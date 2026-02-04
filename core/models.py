from django.db import models
from django.contrib.auth.models import User

# 1. UNIDADE
class Unidade(models.Model):
    nome = models.CharField(max_length=100)
    endereco = models.CharField(max_length=200, blank=True, null=True)
    def __str__(self): return self.nome

# 2. CATEGORIA
class Categoria(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    def __str__(self): return self.nome

# 3. GESTOR (ATUALIZADO COM CARGOS)
class Gestor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nome = models.CharField(max_length=100)
    cpf = models.CharField(max_length=14, unique=True)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    unidade = models.ForeignKey(Unidade, on_delete=models.SET_NULL, null=True, blank=True)

    # --- CAMPO DE CARGOS ADICIONADO ---
    CARGOS_OPCOES = [
        ('gerente', 'Gerente Geral'),
        ('vendedor', 'Vendedor'),
        ('estoque', 'Estoquista'),
    ]
    cargo = models.CharField(max_length=20, choices=CARGOS_OPCOES, default='vendedor')
    # ----------------------------------

    def __str__(self): return self.nome

# 4. SALA
class Sala(models.Model):
    nome = models.CharField(max_length=100)
    unidade = models.ForeignKey(Unidade, on_delete=models.CASCADE)
    def __str__(self): return f"{self.nome} - {self.unidade.nome}"

# 5. FORNECEDOR
class Fornecedor(models.Model):
    nome = models.CharField(max_length=100)
    cnpj_cpf = models.CharField(max_length=20, blank=True, null=True)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    def __str__(self): return self.nome

# 6. BEM (PRODUTO)
class Bem(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    
    # Campo de Imagem
    imagem = models.ImageField(upload_to='produtos/', blank=True, null=True)

    # Relacionamentos
    unidade = models.ForeignKey(Unidade, on_delete=models.PROTECT)
    sala = models.ForeignKey(Sala, on_delete=models.SET_NULL, null=True, blank=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT)
    fornecedor = models.ForeignKey(Fornecedor, on_delete=models.SET_NULL, null=True, blank=True, related_name='produtos')
    
    # Dados
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    quantidade = models.IntegerField(default=1)
    estoque_minimo = models.IntegerField(default=2)  # Novo campo para alerta
    codigo_barras = models.CharField(max_length=50, blank=True, null=True, unique=True)
    data_aquisicao = models.DateField(auto_now_add=True)

    # Campos legados
    tombo = models.CharField(max_length=50, blank=True, null=True)
    situacao = models.CharField(max_length=50, default="Novo", blank=True)
    estado_conservacao = models.CharField(max_length=50, default="Excelente", blank=True)
    origem = models.CharField(max_length=100, default="Compra", blank=True)
    
    skip_signal = models.BooleanField(default=False)

    def __str__(self): return f"{self.nome}"

# 7. VENDA
class Venda(models.Model):
    data_venda = models.DateTimeField(auto_now_add=True)
    valor_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    desconto = models.DecimalField(max_digits=10, decimal_places=2, default=0.00) # Novo campo
    forma_pagamento = models.CharField(max_length=50, default='DINHEIRO')
    
    # Campo de Cupom Fiscal
    cliente_solicitou_cupom = models.BooleanField(default=False)
    cpf_cnpj_cliente = models.CharField(max_length=20, blank=True, null=True)
    telefone_cliente = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self): return f"Venda #{self.id}"

# 8. ITEM VENDA
class ItemVenda(models.Model):
    venda = models.ForeignKey(Venda, related_name='itens', on_delete=models.CASCADE)
    produto = models.ForeignKey(Bem, on_delete=models.PROTECT)
    quantidade = models.IntegerField(default=1)
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    def __str__(self): return f"{self.quantidade}x {self.produto.nome}"

# 9. HISTÓRICO
class Historico(models.Model):
    bem = models.ForeignKey(Bem, on_delete=models.CASCADE, related_name='historico')
    descricao = models.CharField(max_length=255)
    data = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    def __str__(self): return f"{self.descricao}"

# 10. DESPESA (FINANCEIRO)
class Despesa(models.Model):
    TIPO_CHOICES = [
        ('MERCADORIA', 'Fornecedor / Mercadoria'),
        ('AGUA', 'Conta de Água'),
        ('LUZ', 'Conta de Luz / Energia'),
        ('INTERNET', 'Internet / Telefone'),
        ('ALUGUEL', 'Aluguel'),
        ('FUNCIONARIOS', 'Salários / Funcionários'),
        ('MANUTENCAO', 'Manutenção / Reparos'),
        ('IMPOSTOS', 'Impostos / Taxas'),
        ('FIXA', 'Outras Despesas Fixas'), # Mantido para compatibilidade
        ('OUTRO', 'Outros Gastos'),
    ]
    
    SITUACAO_CHOICES = [
        ('PENDENTE', 'Pendente (A Pagar)'),
        ('PAGO', 'Pago'),
        ('ATRASADO', 'Atrasado'),
    ]

    descricao = models.CharField(max_length=200)
    numero_documento = models.CharField(max_length=50, blank=True, null=True)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    data_vencimento = models.DateField()
    data_pagamento = models.DateField(blank=True, null=True)
    
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='FIXA')
    situacao = models.CharField(max_length=20, choices=SITUACAO_CHOICES, default='PENDENTE')
    
    fornecedor = models.ForeignKey(Fornecedor, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.descricao} - R$ {self.valor}"

# 11. CLIENTE
class Cliente(models.Model):
    nome = models.CharField(max_length=100)
    cpf_cnpj = models.CharField(max_length=20, unique=True)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    endereco = models.CharField(max_length=200, blank=True, null=True)
    data_cadastro = models.DateTimeField(auto_now_add=True)

    def __str__(self): return self.nome