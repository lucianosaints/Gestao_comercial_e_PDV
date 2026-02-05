import sys
from core.models import Bem
from core.utils_relatorios import gerar_etiquetas_pdf

print("Iniciando teste via shell...")
try:
    # Busca alguns bens para testar
    bens = Bem.objects.all()[:10]
    print(f"Testando com {len(bens)} bens.")
    
    buffer = gerar_etiquetas_pdf(bens)
    print("Sucesso! PDF gerado.")
    
except Exception as e:
    print(f"ERRO: {e}")
    import traceback
    traceback.print_exc()
