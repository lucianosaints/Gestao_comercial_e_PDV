import print_debug # Apenas para garantir que o python atualize
print("--- LENDO O ARQUIVO URLS.PY PRINCIPAL COM DESPESAS ---")

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# IMPORTANDO AS VIEWS (Do arquivo core/views.py)
from core.views import (
    UnidadeViewSet, 
    CategoriaViewSet, 
    BemViewSet, 
    GestorViewSet, 
    SalaViewSet, 
    VendaViewSet, 
    HistoricoViewSet,
    FornecedorViewSet,
    DespesaViewSet,        # <--- AQUI ESTÁ ELA!
    DashboardResumoView, 
    GraficoVendasView 
)

# CRIANDO O ROTEADOR
router = DefaultRouter()
router.register(r'unidades', UnidadeViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'bens', BemViewSet)
router.register(r'gestores', GestorViewSet)
router.register(r'salas', SalaViewSet)
router.register(r'vendas', VendaViewSet)
router.register(r'historico', HistoricoViewSet)
router.register(r'fornecedores', FornecedorViewSet)
router.register(r'despesas', DespesaViewSet)  # <--- ROTA OBRIGATÓRIA

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # ROTA DA API (Usa o router que criamos acima)
    path('api/', include(router.urls)),

    # ROTAS EXTRAS
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/dashboard-resumo/', DashboardResumoView.as_view(), name='dashboard-resumo'),
    path('api/grafico-vendas/', GraficoVendasView.as_view(), name='grafico-vendas'),
]