from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
# --- NOVOS IMPORTS PARA PAGINAÇÃO ---
from rest_framework.pagination import PageNumberPagination
from rest_framework import filters
# ------------------------------------

# --- NOVOS IMPORTS PARA A FUNÇÃO DE USUÁRIO ---
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
# ----------------------------------------------

from django.db import models
from django.db.models import Sum

# --- 1. IMPORTS DOS MODELS ---
from .models import (
    Unidade, Categoria, Bem, Gestor, Sala, 
    Historico, Venda, ItemVenda, Fornecedor, Despesa
)

# --- 2. IMPORTS DOS SERIALIZERS ---
from .serializers import (
    UnidadeSerializer, CategoriaSerializer, BemSerializer, 
    GestorSerializer, SalaSerializer, HistoricoSerializer, 
    VendaSerializer, FornecedorSerializer, DespesaSerializer
)

# =================================================
# VIEWSETS (CRUDs PADRÃO)
# =================================================

# 1. FORNECEDOR
class FornecedorViewSet(viewsets.ModelViewSet):
    queryset = Fornecedor.objects.all()
    serializer_class = FornecedorSerializer
    permission_classes = [permissions.IsAuthenticated]

# 2. VENDA (Com lógica de baixa de estoque)
class VendaViewSet(viewsets.ModelViewSet):
    queryset = Venda.objects.all().order_by('-data_venda')
    serializer_class = VendaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Venda.objects.all().order_by('-data_venda')
        data_filtro = self.request.query_params.get('data')
        if data_filtro:
            queryset = queryset.filter(data_venda__date=data_filtro)
        return queryset

    def create(self, request, *args, **kwargs):
        itens_data = request.data.get('itens', [])
        valor_total = request.data.get('valor_total') # Este valor já deve vir com desconto do frontend, ou recalculamos?
        # O ideal é o backend validar. Vamos confiar no total enviado ou recalcular?
        # O código original confiava no 'valor_total' enviado. Vou manter assim mas salvar o desconto.
        desconto = request.data.get('desconto', 0.00)
        forma_pagamento = request.data.get('forma_pagamento', 'DINHEIRO')

        nova_venda = Venda.objects.create(
            valor_total=valor_total,
            desconto=desconto,
            forma_pagamento=forma_pagamento
        )

        for item in itens_data:
            produto_id = item['produto']
            quantidade_vendida = item['quantidade']
            preco = item['preco_unitario']

            try:
                produto = Bem.objects.get(id=produto_id)
                if produto.quantidade < quantidade_vendida:
                    nova_venda.delete()
                    return Response(
                        {"error": f"Produto '{produto.nome}' tem apenas {produto.quantidade} em estoque."}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )

                ItemVenda.objects.create(
                    venda=nova_venda,
                    produto=produto,
                    quantidade=quantidade_vendida,
                    preco_unitario=preco
                )

                # Baixa no estoque
                produto.quantidade -= quantidade_vendida
                produto.save()

            except Bem.DoesNotExist:
                nova_venda.delete()
                return Response({"error": "Produto não encontrado"}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(nova_venda)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# 3. UNIDADE
class UnidadeViewSet(viewsets.ModelViewSet):
    queryset = Unidade.objects.all()
    serializer_class = UnidadeSerializer
    permission_classes = [permissions.IsAuthenticated]

# 4. CATEGORIA
class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.IsAuthenticated]

# 5. BEM (PRODUTOS)
# 5. BEM (PRODUTOS)
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 1000

class BemViewSet(viewsets.ModelViewSet):
    queryset = Bem.objects.all().order_by('nome') # Ordenação importante para paginação
    serializer_class = BemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # Configuração de Paginação e Busca
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['nome', 'tombo', 'descricao', 'codigo_barras']

    def get_queryset(self):
        queryset = Bem.objects.all()
        sala_id = self.request.query_params.get('sala')
        unidade_id = self.request.query_params.get('unidade')
        
        if sala_id:
            queryset = queryset.filter(sala_id=sala_id)
        if unidade_id:
            queryset = queryset.filter(unidade_id=unidade_id)
            
        # Filtro de Alerta de Estoque
        alerta = self.request.query_params.get('alerta')
        if alerta == 'true':
            queryset = queryset.filter(quantidade__lte=models.F('estoque_minimo'))
            
        return queryset

    def perform_update(self, serializer):
        bem_novo = serializer.save()
        Historico.objects.create(
            bem=bem_novo,
            usuario=self.request.user,
            descricao="Produto atualizado."
        )

    # --- ACTION PARA PDV (SEM PAGINAÇÃO) ---
    @action(detail=False, methods=['get'])
    def listar_todos(self, request):
        # Desativa paginação temporariamente para este request
        paginator = self.pagination_class = None 
        return self.list(request)
        
    @action(detail=True, methods=['get'])
    def historico(self, request, pk=None):
        bem = self.get_object()
        historico = bem.historico.all()
        serializer = HistoricoSerializer(historico, many=True)
        return Response(serializer.data)

# 6. GESTOR
class GestorViewSet(viewsets.ModelViewSet):
    queryset = Gestor.objects.all()
    serializer_class = GestorSerializer
    permission_classes = [permissions.IsAuthenticated]

# 7. SALA
class SalaViewSet(viewsets.ModelViewSet):
    queryset = Sala.objects.all()
    serializer_class = SalaSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Sala.objects.all()
        unidade_id = self.request.query_params.get('unidade')
        if unidade_id:
            queryset = queryset.filter(unidade_id=unidade_id)
        return queryset

# 8. HISTÓRICO (Somente Leitura)
class HistoricoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Historico.objects.all()
    serializer_class = HistoricoSerializer
    permission_classes = [permissions.IsAuthenticated]

# 9. DESPESAS (FINANCEIRO)
class DespesaViewSet(viewsets.ModelViewSet):
    queryset = Despesa.objects.all().order_by('data_vencimento')
    serializer_class = DespesaSerializer
    permission_classes = [permissions.IsAuthenticated]

# =================================================
# VIEWS ESPECIAIS (DASHBOARD)
# =================================================

# --- IMPORTS PARA RELATÓRIOS ---
from django.http import HttpResponse
from django.http import HttpResponse
from .utils_relatorios import gerar_pdf_vendas, gerar_excel_inventario, gerar_excel_despesas

# ... (Mantenha os imports existentes, mas vou reescrever a DashboardResumoView e adicionar as novas Views no final)

# 10. RESUMO DOS CARDS (ATUALIZADO COM ALERTA)
class DashboardResumoView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Lógica de alerta
        estoque_baixo = Bem.objects.filter(quantidade__lte=models.F('estoque_minimo')).count()

        data = {
            "total_bens": Bem.objects.count(),
            "total_unidades": Unidade.objects.count(),
            "total_categorias": Categoria.objects.count(),
            "total_salas": Sala.objects.count(),
            "total_gestores": Gestor.objects.count(),
            "alertas_estoque": estoque_baixo # Novo campo
        }
        return Response(data)

# ... (GraficoVendasView se mantem igual)

class GraficoVendasView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Agrupa itens vendidos pelo nome e soma a quantidade
        dados = ItemVenda.objects.values('produto__nome') \
            .annotate(total_vendas=Sum('quantidade')) \
            .order_by('-total_vendas')[:5]

        # Formata para o React
        resultado = []
        for item in dados:
            resultado.append({
                'name': item['produto__nome'], 
                'vendas': item['total_vendas']
            })
        
        # Evita erro de gráfico vazio
        if not resultado:
            resultado = [{'name': 'Sem Vendas', 'vendas': 0}]
            
        return Response(resultado)

# =================================================
# VIEWS DE RELATÓRIOS
# =================================================

class RelatorioVendasView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        vendas = Venda.objects.all().order_by('-data_venda')
        pdf_buffer = gerar_pdf_vendas(vendas)
        
        response = HttpResponse(pdf_buffer, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="relatorio_vendas.pdf"'
        return response

class RelatorioInventarioView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        bens = Bem.objects.all()
        excel_buffer = gerar_excel_inventario(bens)
        
        response = HttpResponse(excel_buffer, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="inventario.xlsx"'
        return response

# =================================================
# IDENTIFICAÇÃO DO USUÁRIO
# =================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def usuario_atual(request):
    try:
        gestor = Gestor.objects.get(user=request.user)
        return Response({
            "id": gestor.id,
            "nome": gestor.nome,
            "cargo": gestor.cargo,
            "unidade": gestor.unidade.nome if gestor.unidade else "Matriz"
        })
    except Gestor.DoesNotExist:
        return Response({
            "id": request.user.id,
            "nome": request.user.username,
            "cargo": "gerente",
            "unidade": "Sistema"
        })

class RelatorioDespesasView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        despesas = Despesa.objects.all().order_by('-data_vencimento')
        
        # Filtro de Mês (yyyy-mm)
        mes_filtro = request.query_params.get('mes')
        if mes_filtro:
            despesas = despesas.filter(data_vencimento__startswith=mes_filtro)
            
        excel_buffer = gerar_excel_despesas(despesas)
        
        response = HttpResponse(excel_buffer, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="relatorio_financeiro.xlsx"'
        return response