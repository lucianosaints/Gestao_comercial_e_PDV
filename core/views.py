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
    Historico, Venda, ItemVenda, Fornecedor, Despesa, Cliente
)

# --- 2. IMPORTS DOS SERIALIZERS ---
from .serializers import (
    UnidadeSerializer, CategoriaSerializer, BemSerializer, 
    GestorSerializer, SalaSerializer, HistoricoSerializer, 
    VendaSerializer, FornecedorSerializer, DespesaSerializer, ClienteSerializer
)

# --- 3. UTILITÁRIOS ---
from .utils.xml_parser import parse_nfe_xml

# =================================================
# VIEWSETS (CRUDs PADRÃO)
# =================================================

# 12. CLIENTE
class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all().order_by('nome')
    serializer_class = ClienteSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nome', 'cpf_cnpj', 'telefone']

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

    # --- 500 ERROR FIX: Catch ProtectedError on delete ---
    def destroy(self, request, *args, **kwargs):
        from django.db.models import ProtectedError
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {"error": "Este produto não pode ser excluído pois já possui vendas ou histórico registrado."},
                status=status.HTTP_400_BAD_REQUEST
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

# =================================================
# IMPORTAÇÃO DE XML
# =================================================
class ImportarXMLView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Recebe o arquivo XML e retorna o preview.
        """
        acao = request.data.get('acao') # 'preview' ou 'confirmar'

        if acao == 'confirmar':
            return self.confirmar_importacao(request)
        
        # --- PREVIEW ---
        arquivo = request.FILES.get('arquivo')
        if not arquivo:
            return Response({"error": "Nenhum arquivo enviado"}, status=400)

        dados_xml = parse_nfe_xml(arquivo.read())
        if "error" in dados_xml:
            return Response(dados_xml, status=400)

        # Cruza dados com o banco
        itens_preview = []
        for item in dados_xml['itens']:
            ean = item['ean']
            # Tenta achar produto existente pelo EAN ou Código de Barras
            produto_existente = Bem.objects.filter(codigo_barras=ean).first()
            
            if produto_existente:
                itens_preview.append({
                    "status": "ATUALIZAR",
                    "id": produto_existente.id,
                    "nome_xml": item['nome'],
                    "nome_sistema": produto_existente.nome,
                    "ean": ean,
                    "qtd_xml": item['quantidade'],
                    "estoque_atual": produto_existente.quantidade,
                    "valor_custo_xml": item['valor_unitario'],
                    "valor_venda_atual": produto_existente.valor
                })
            else:
                itens_preview.append({
                    "status": "NOVO",
                    "nome_xml": item['nome'],
                    "ean": ean,
                    "qtd_xml": item['quantidade'],
                    "valor_custo_xml": item['valor_unitario'],
                    "sugestao_venda": item['valor_unitario'] * 2 # Sugere 100% de margem
                })

        return Response({
            "nota": {
                "numero": dados_xml['numero'],
                "fornecedor": dados_xml['fornecedor']
            },
            "itens": itens_preview
        })

    def confirmar_importacao(self, request):
        """
        Recebe a lista validada pelo usuário e salva no banco.
        """
        dados = request.data
        nota = dados.get('nota')
        itens = dados.get('itens')
        
        # 1. Cadastra/Busca Fornecedor
        cnpj = nota['fornecedor']['cnpj']
        fornec, created = Fornecedor.objects.get_or_create(
            cnpj_cpf=cnpj,
            defaults={'nome': nota['fornecedor']['nome']}
        )

        salvos = 0
        erros = 0

        # Pega uma unidade/categoria padrão para novos (pode vir do front também, mas vamos simplificar)
        unidade_padrao = Unidade.objects.first()
        categoria_padrao = Categoria.objects.first()

        if not unidade_padrao or not categoria_padrao:
             return Response({"error": "Cadastre pelo menos uma Unidade e Categoria antes de importar."}, status=400)

        for item in itens:
            try:
                if item['status'] == 'ATUALIZAR':
                    prod = Bem.objects.get(id=item['id'])
                    prod.quantidade += float(item['qtd_xml'])
                    # Opcional: Atualizar preço de custo?? Por enquanto não temos campo custo no Bem, só valor (venda).
                    # Vamos manter o valor venda atual, a menos que o usuário tenha mandado alterar.
                    if 'novo_preco_venda' in item and item['novo_preco_venda']:
                         prod.valor = float(item['novo_preco_venda'])
                    
                    prod.save()
                    msg_hist = f"Estoque atualizado via XML (NF {nota['numero']}). +{item['qtd_xml']} un."
                    
                else: # NOVO
                    prod = Bem.objects.create(
                        nome=item['nome_xml'],
                        codigo_barras=item['ean'],
                        quantidade=float(item['qtd_xml']),
                        valor=float(item.get('novo_preco_venda', item['sugestao_venda'])),
                        unidade=unidade_padrao,
                        categoria=categoria_padrao,
                        descricao=f"Importado de NF {nota['numero']}"
                    )
                    msg_hist = f"Produto criado via Importação XML (NF {nota['numero']})."

                # Cria Histórico
                Historico.objects.create(
                    bem=prod,
                    usuario=request.user,
                    descricao=msg_hist
                )
                salvos += 1

            except Exception as e:
                print(f"Erro ao salvar item {item}: {e}")
                erros += 1

        return Response({"mensagem": "Importação concluída!", "salvos": salvos, "erros": erros})

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

class EtiquetasPDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        ids = request.query_params.get('ids')
        if not ids:
            return Response({"error": "Nenhum ID fornecido"}, status=400)
        
        try:
            ids_list = [int(i) for i in ids.split(',')]
            
            bens = Bem.objects.filter(id__in=ids_list)
            
            if not bens.exists():
                return Response({"error": "Nenhum produto encontrado"}, status=404)

            from .utils_relatorios import gerar_etiquetas_pdf
            pdf_buffer = gerar_etiquetas_pdf(bens)
            
            response = HttpResponse(pdf_buffer, content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename="etiquetas.pdf"'
            return response
            
        except Exception as e:
             return Response({"error": f"Erro interno: {e}"}, status=400)

from django.db.models.functions import TruncMonth
from django.db.models import Count
import datetime
from django.utils import timezone

class DashboardFinanceiroView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Data limite (6 meses atrás)
        hoje = timezone.now()
        seis_meses_atras = hoje - datetime.timedelta(days=180)

        # 1. KPIs GERAIS
        total_receita = Venda.objects.aggregate(Sum('valor_total'))['valor_total__sum'] or 0.00
        total_despesa = Despesa.objects.aggregate(Sum('valor'))['valor__sum'] or 0.00
        total_vendas_count = Venda.objects.count()
        
        # Ticket Médio
        ticket_medio = total_receita / total_vendas_count if total_vendas_count > 0 else 0

        # 2. GRÁFICO: RECEITA x DESPESA (Últimos 6 meses)
        # Agrupa vendas por mês
        vendas_mes = Venda.objects.filter(data_venda__gte=seis_meses_atras) \
            .annotate(mes=TruncMonth('data_venda')) \
            .values('mes') \
            .annotate(total=Sum('valor_total')) \
            .order_by('mes')
            
        # Agrupa despesas por mês
        despesas_mes = Despesa.objects.filter(data_vencimento__gte=seis_meses_atras) \
            .annotate(mes=TruncMonth('data_vencimento')) \
            .values('mes') \
            .annotate(total=Sum('valor')) \
            .order_by('mes')

        # Mescla os dados para o gráfico
        historico = {}
        
        # Preenche com Vendas
        for v in vendas_mes:
            if v['mes']: # Proteção contra data nula
                mes_str = v['mes'].strftime('%Y-%m')
                historico[mes_str] = {'mes': mes_str, 'receita': float(v['total']), 'despesa': 0}
        
        # Preenche com Despesas
        for d in despesas_mes:
            if d['mes']:
                mes_str = d['mes'].strftime('%Y-%m')
                if mes_str not in historico:
                    historico[mes_str] = {'mes': mes_str, 'receita': 0, 'despesa': 0}
                historico[mes_str]['despesa'] = float(d['total'])
                
        # Converte para lista ordenada
        grafico_principal = sorted(historico.values(), key=lambda x: x['mes'])

        # 3. GRÁFICO DE PIZZA: Despesas por Categoria
        despesas_cat = Despesa.objects.values('tipo') \
            .annotate(total=Sum('valor')) \
            .order_by('-total')
            
        grafico_pizza = [
            {'name': dict(Despesa.TIPO_CHOICES).get(d['tipo'], d['tipo']), 'value': float(d['total'])}
            for d in despesas_cat
        ]

        # 4. TOP PRODUTOS (Quantidade)
        top_produtos_q = ItemVenda.objects.values('produto__nome') \
            .annotate(qtd=Sum('quantidade')) \
            .order_by('-qtd')[:5]
            
        top_produtos = [
            {'nome': item['produto__nome'], 'qtd': item['qtd']}
            for item in top_produtos_q
        ]

        return Response({
            "kpis": {
                "receita": float(total_receita),
                "despesa": float(total_despesa),
                "saldo": float(total_receita - total_despesa),
                "ticket_medio": float(ticket_medio)
            },
            "grafico_mensal": grafico_principal,
            "grafico_pizza": grafico_pizza,
            "top_produtos": top_produtos
        })