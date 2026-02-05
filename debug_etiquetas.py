import os
import django
import sys

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projeto.settings')
django.setup()

from core.models import Bem
from core.utils_relatorios import gerar_etiquetas_pdf

print("Iniciando teste de geração de etiquetas...")
try:
    # Tenta com todos os bens para ver se algum quebra
    bens = Bem.objects.all()
    print(f"Total de bens: {bens.count()}")
    
    buffer = gerar_etiquetas_pdf(bens)
    print("PDF gerado com sucesso!")
    
    with open("teste_etiquetas.pdf", "wb") as f:
        f.write(buffer.getvalue())
        
except Exception as e:
    print(f"ERRO FATAL: {e}")
    import traceback
    traceback.print_exc()
