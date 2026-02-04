import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projeto.settings')
django.setup()

from core.models import Bem

print("--- CORREÇÃO DE ESTOQUE MÍNIMO ---")
afetados = Bem.objects.filter(estoque_minimo__gt=2).update(estoque_minimo=2)

print(f"Sucesso! {afetados} produtos foram atualizados para Estoque Mínimo = 2.")
print("Verifique o Dashboard agora.")
