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
router.register(r'despesas', DespesaViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/dashboard-resumo/', DashboardResumoView.as_view(), name='dashboard-resumo'),
    path('api/grafico-vendas/', GraficoVendasView.as_view(), name='grafico-vendas'),
]

# --- ADICIONE ISTO NO FINAL PARA LIBERAR AS FOTOS ---
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)