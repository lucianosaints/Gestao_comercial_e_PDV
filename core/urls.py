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
    DashboardFinanceiroView, # <--- NOVO
    usuario_atual,           # <--- NOVO
    ClienteViewSet,           # <--- NOVO
    EtiquetasPDFView,
    ImportarXMLView
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
router.register(r'clientes', ClienteViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard-resumo/', DashboardResumoView.as_view(), name='dashboard-resumo'),
    path('grafico-vendas/', GraficoVendasView.as_view(), name='grafico-vendas'),
    path('api/relatorios/vendas/', RelatorioVendasView.as_view(), name='relatorio_vendas'),
    path('api/relatorio-inventario/', RelatorioInventarioView.as_view(), name='relatorio_inventario'),
    path('api/dashboard-financeiro/', DashboardFinanceiroView.as_view(), name='dashboard-financeiro'), # <--- ROTA NOVA
    path('api/relatorios/etiquetas/', EtiquetasPDFView.as_view(), name='etiquetas_pdf'), # <--- ROTA NOVA
    path('api/importar-xml/', ImportarXMLView.as_view(), name='importar_xml'),
    path('me/', usuario_atual, name='usuario-atual'), # <--- JA QUE ESTAVA NA VIEW, VOU EXPOR AQUI
]