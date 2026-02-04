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
    DespesaViewSet,  
    DashboardResumoView, 
    GraficoVendasView,
    RelatorioVendasView,     # <--- NOVO
    RelatorioInventarioView, # <--- NOVO
    usuario_atual            # <--- NOVO
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
router.register(r'despesas', DespesaViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard-resumo/', DashboardResumoView.as_view(), name='dashboard-resumo'),
    path('grafico-vendas/', GraficoVendasView.as_view(), name='grafico-vendas'),
    path('relatorio-vendas/', RelatorioVendasView.as_view(), name='relatorio-vendas'),         # <--- ROTA NOVA
    path('relatorio-inventario/', RelatorioInventarioView.as_view(), name='relatorio-inventario'), # <--- ROTA NOVA
    path('me/', usuario_atual, name='usuario-atual'), # <--- JA QUE ESTAVA NA VIEW, VOU EXPOR AQUI
]