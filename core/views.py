from rest_framework import viewsets, permissions
from .permissions import (
    IsGestorWithCadastrarPermission,
    IsGestorWithEditarPermission,
    IsGestorWithCadastrarCategoriaPermission,
    IsGestorWithEditarCategoriaPermission,
    IsGestorWithDarBaixaPermission,
    IsGestorWithCadastrarGestorPermission,
    IsGestorWithCadastrarSalaPermission,
    IsGestorWithEditarSalaPermission,
    OrPermission,  # Importar a classe OrPermission personalizada
    AndPermission, # Importar a classe AndPermission personalizada
)
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.db.models import Sum
from .models import Unidade, Categoria, Bem, Gestor, Sala, Historico
from .serializers import UnidadeSerializer, CategoriaSerializer, BemSerializer, GestorSerializer, SalaSerializer, HistoricoSerializer
from .permissions import (
    IsGestorWithCadastrarPermission,
    IsGestorWithEditarPermission,
    IsGestorWithCadastrarCategoriaPermission,
    IsGestorWithEditarCategoriaPermission,
    IsGestorWithDarBaixaPermission,
    IsGestorWithCadastrarGestorPermission,
    IsGestorWithCadastrarSalaPermission,
    IsGestorWithEditarSalaPermission,
    IsGestorWithCadastrarUnidadePermission,
    IsGestorWithCadastrarCategoriaPermission,
    IsGestorWithCadastrarSalaPermission,
    IsGestorWithCadastrarGestorPermission
)

# --- VIEWSETS (CRUDs) ---

class UnidadeViewSet(viewsets.ModelViewSet):
    queryset = Unidade.objects.all()
    serializer_class = UnidadeSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [OrPermission(permissions.IsAdminUser, AndPermission(permissions.IsAuthenticated, IsGestorWithCadastrarPermission))]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [OrPermission(permissions.IsAdminUser, AndPermission(permissions.IsAuthenticated, IsGestorWithEditarPermission))]
        return [OrPermission(permissions.IsAdminUser, permissions.IsAuthenticated)]

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [OrPermission(permissions.IsAdminUser, AndPermission(permissions.IsAuthenticated, IsGestorWithCadastrarCategoriaPermission))]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [OrPermission(permissions.IsAdminUser, AndPermission(permissions.IsAuthenticated, IsGestorWithEditarCategoriaPermission))]
        return [OrPermission(permissions.IsAdminUser, permissions.IsAuthenticated)]

class BemViewSet(viewsets.ModelViewSet):
    queryset = Bem.objects.all()
    serializer_class = BemSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [OrPermission(permissions.IsAdminUser, AndPermission(permissions.IsAuthenticated, IsGestorWithCadastrarPermission))]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [OrPermission(permissions.IsAdminUser, AndPermission(permissions.IsAuthenticated, IsGestorWithEditarPermission))]
        elif self.action == 'dar_baixa':
            return [OrPermission(permissions.IsAdminUser, AndPermission(permissions.IsAuthenticated, IsGestorWithDarBaixaPermission))]
        return [OrPermission(permissions.IsAdminUser, permissions.IsAuthenticated)]

class GestorViewSet(viewsets.ModelViewSet):
    queryset = Gestor.objects.all()
    serializer_class = GestorSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [OrPermission(permissions.IsAdminUser, AndPermission(permissions.IsAuthenticated, IsGestorWithCadastrarGestorPermission))]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [OrPermission(permissions.IsAdminUser, AndPermission(permissions.IsAuthenticated, IsGestorWithCadastrarGestorPermission))]
        return [OrPermission(permissions.IsAdminUser, permissions.IsAuthenticated)]

class SalaViewSet(viewsets.ModelViewSet):
    queryset = Sala.objects.all()
    serializer_class = SalaSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [OrPermission(permissions.IsAdminUser, AndPermission(permissions.IsAuthenticated, IsGestorWithCadastrarSalaPermission))]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [OrPermission(permissions.IsAdminUser, AndPermission(permissions.IsAuthenticated, IsGestorWithEditarSalaPermission))]
        return [OrPermission(permissions.IsAdminUser, permissions.IsAuthenticated)]

    def get_queryset(self):
        queryset = Sala.objects.all()
        # Captura o ID da unidade que o React vai enviar na URL (?unidade=1)
        unidade_id = self.request.query_params.get('unidade')
        
        if unidade_id:
            # Filtra apenas as salas daquela unidade
            queryset = queryset.filter(unidade_id=unidade_id)
            
        return queryset

# --- FUNÇÕES EXTRAS (Dashboard) ---

@api_view(['GET'])
def dashboard_resumo(request):
    total_bens = Bem.objects.count()
    total_unidades = Unidade.objects.count()
    total_categorias = Categoria.objects.count()
    
    # Soma o valor de todos os bens (trata caso seja None)
    valor_total = Bem.objects.aggregate(Sum('valor'))['valor__sum'] or 0

    return Response({
        "total_bens": total_bens,
        "total_unidades": total_unidades,
        "total_categorias": total_categorias,
        "valor_total": valor_total
    })