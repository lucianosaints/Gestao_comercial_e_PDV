import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projeto.settings')
django.setup()

from core.models import Bem
from django.db.models import F

print("--- INSPEÇÃO DE ESTOQUE ---")
alertas = Bem.objects.filter(quantidade__lte=F('estoque_minimo'))
print(f"Total de Alertas encontrados: {alertas.count()}")

if alertas.count() > 0:
    print("\nProdutos em Alerta:")
    print(f"{'ID':<5} | {'Nome':<30} | {'Qtd':<5} | {'Min':<5}")
    print("-" * 55)
    for b in alertas:
        print(f"{b.id:<5} | {b.nome[:30]:<30} | {b.quantidade:<5} | {b.estoque_minimo:<5}")

print("\n--- Produtos com Estoque Mínimo > 2 ---")
minimo_alto = Bem.objects.filter(estoque_minimo__gt=2)
for b in minimo_alto:
     print(f"{b.id:<5} | {b.nome[:30]:<30} | {b.quantidade:<5} | {b.estoque_minimo:<5}")
