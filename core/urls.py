from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UnidadeViewSet, 
    CategoriaViewSet, 
    BemViewSet, 
    GestorViewSet, 
    SalaViewSet, 
    VendaViewSet, 
    HistoricoViewSet,
    FornecedorViewSet,
    DespesaViewSet,        # <--- AQUI ESTÁ A CHAVE
    DashboardResumoView, 
    GraficoVendasView 
)

router = DefaultRouter()
router.register(r'unidades', UnidadeViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'bens', BemViewSet)
router.register(r'gestores', GestorViewSet)
router.register(r'salas', SalaViewSet)
router.register(r'vendas', VendaViewSet)
router.register(r'historico', HistoricoViewSet)
router.register(r'fornecedores', FornecedorViewSet)
router.register(r'despesas', DespesaViewSet)  # <--- E AQUI TAMBÉM

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard-resumo/', DashboardResumoView.as_view(), name='dashboard-resumo'),
    path('grafico-vendas/', GraficoVendasView.as_view(), name='grafico-vendas'),
]