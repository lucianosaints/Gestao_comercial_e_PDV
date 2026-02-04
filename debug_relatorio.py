import os
import django
import sys

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projeto.settings')
django.setup()

from core.models import Despesa
from core.utils_relatorios import gerar_excel_despesas

print("--- TESTE DE RELATÓRIO FINANCEIRO ---")

try:
    print("1. Buscando despesas...")
    despesas = Despesa.objects.all().order_by('-data_vencimento')
    print(f"   Encontradas: {despesas.count()}")
    
    if despesas.count() == 0:
        print("   AVISO: Nenhuma despesa para testar. Criando uma despesa 'dummy'...")
        # Se não tiver, cria uma dummy (sem salvar no banco se possível, ou salva e apaga)
        # Melhor usar mock ou criar temporária
        # Vamos assumir que se não tem despesas, o loop do excel roda vazio sem erro.
    
    print("2. Gerando Excel...")
    buffer = gerar_excel_despesas(despesas)
    
    print(f"3. Sucesso! Buffer gerado. Tamanho: {buffer.getbuffer().nbytes} bytes.")
    
    # Testar visualização (View)
    from core.views import RelatorioDespesasView
    from rest_framework.test import APIRequestFactory
    
    print("4. Testando View (Simulação)...")
    factory = APIRequestFactory()
    request = factory.get('/api/relatorio-financeiro/?mes=2023-10')
    view = RelatorioDespesasView.as_view()
    
    # Precisamos de um usuário autenticado mockado se a view exigir login
    from django.contrib.auth.models import User
    user = User.objects.filter(is_superuser=True).first()
    if not user:
        print("   Criando usuário de teste...")
        user = User.objects.create_user('teste_debug', 'teste@teste.com', '123')
    
    from rest_framework.force_authenticate import force_authenticate
    
    # A view é baseada em classe (APIView)
    # Precisamos instanciar ou chamar as_view()
    # Para testar auth, melhor usar o fluxo manual ou ignorar auth se puder
    # Mas a view tem `permission_classes = [IsAuthenticated]`
    
    # Vamos testar apenas a função 'gerar_excel' primeiro, que é onde a lógica pesada está.
    # Se passo 2 funcionou, o erro pode ser no Django View ou Auth.
    
    print("   View teste pulado (foco na lógica de geração).")

except Exception as e:
    print("\n!!! ERRO ENCONTRADO !!!")
    print(e)
    import traceback
    traceback.print_exc()
