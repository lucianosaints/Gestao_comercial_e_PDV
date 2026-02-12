from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# --- IMPORTAÇÕES PARA AS IMAGENS FUNCIONAREM ---
from django.conf import settings
from django.conf.urls.static import static
# -----------------------------------------------

from core.views import (
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
    RelatorioVendasView,     
    RelatorioInventarioView, 
    RelatorioDespesasView,   
    EtiquetasPDFView,        
    DashboardFinanceiroView,
    usuario_atual,
    ClienteViewSet
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
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    
    # Rotas de Autenticação (Token)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Rotas de Dashboard
    path('api/dashboard-resumo/', DashboardResumoView.as_view(), name='dashboard-resumo'),
    path('api/grafico-vendas/', GraficoVendasView.as_view(), name='grafico-vendas'),
    
    # --- ROTA DE CONTROLE DE ACESSO (CARGOS) ---
    path('api/usuario-atual/', usuario_atual, name='usuario-atual'),

    # --- INCLUINDO ROTAS DO CORE (Recomendado) ---
    path('api/', include('core.urls')), 
    
    # OBS: As rotas abaixo podem estar duplicadas se já estiverem em core/urls.py.
    # O Django vai resolver a primeira que encontrar. 
    # Deixando aqui por garantia de compatibilidade com versões antigas do frontend cacheado.
    
    path('api/dashboard-financeiro/', DashboardFinanceiroView.as_view(), name='dashboard-financeiro-legacy'),
]

# --- LIBERA AS FOTOS EM MODO DEBUG ---
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)