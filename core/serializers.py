from rest_framework import serializers
from django.contrib.auth.models import User
# Importando todas as tabelas (incluindo a Despesa nova)
from .models import Unidade, Categoria, Bem, Gestor, Sala, Historico, Venda, ItemVenda, Fornecedor, Despesa

class DashboardResumoSerializer(serializers.Serializer):
    total_bens = serializers.IntegerField()
    total_unidades = serializers.IntegerField()
    total_categorias = serializers.IntegerField()
    total_salas = serializers.IntegerField()
    total_gestores = serializers.IntegerField()

class UnidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unidade
        fields = '__all__'

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class SalaSerializer(serializers.ModelSerializer):
    unidade_nome = serializers.CharField(source='unidade.nome', read_only=True)
    # Conta quantos 'bens' existem vinculados a esta sala
    qtd_itens = serializers.IntegerField(source='bem_set.count', read_only=True)

    class Meta:
        model = Sala
        # Definimos explicitamente para garantir que o qtd_itens apareça
        fields = ['id', 'nome', 'unidade', 'unidade_nome', 'qtd_itens']

class HistoricoSerializer(serializers.ModelSerializer):
    usuario_nome = serializers.CharField(source='usuario.username', read_only=True)
    class Meta:
        model = Historico
        fields = ['id', 'descricao', 'data', 'usuario_nome']

class FornecedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fornecedor
        fields = '__all__'

class BemSerializer(serializers.ModelSerializer):
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    unidade_nome = serializers.CharField(source='unidade.nome', read_only=True)
    sala_nome = serializers.CharField(source='sala.nome', read_only=True, allow_null=True)
    fornecedor_nome = serializers.CharField(source='fornecedor.nome', read_only=True)
    historico = HistoricoSerializer(many=True, read_only=True)
    
    class Meta:
        model = Bem
        fields = '__all__'

# --- GESTOR ATUALIZADO COM O CAMPO CARGO ---
class GestorSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    unidade_nome = serializers.CharField(source='unidade.nome', read_only=True)
    
    class Meta:
        model = Gestor
        # Listamos explicitamente para garantir que 'cargo' seja enviado
        fields = ['id', 'user', 'nome', 'cpf', 'telefone', 'unidade', 'unidade_nome', 'cargo', 'password']
        extra_kwargs = {'user': {'read_only': True}}
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        # O campo 'cargo' já vem dentro de validated_data e o Django salva sozinho
        user = User.objects.create_user(username=validated_data['cpf'], password=password if password else 'mudar123', is_staff=True)
        return Gestor.objects.create(user=user, **validated_data)

class ItemVendaSerializer(serializers.ModelSerializer):
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)
    class Meta:
        model = ItemVenda
        fields = ['id', 'produto', 'produto_nome', 'quantidade', 'preco_unitario']

class VendaSerializer(serializers.ModelSerializer):
    itens = ItemVendaSerializer(many=True)

    class Meta:
        model = Venda
        fields = ['id', 'data_venda', 'valor_total', 'forma_pagamento', 'itens']

    def create(self, validated_data):
        itens_data = validated_data.pop('itens')
        venda = Venda.objects.create(**validated_data)
        valor_total_calculado = 0
        
        for item_dado in itens_data:
            produto = item_dado['produto']
            quantidade_vendida = item_dado['quantidade']
            
            if produto.quantidade < quantidade_vendida:
                 venda.delete()
                 raise serializers.ValidationError({"erro": f"Estoque insuficiente para '{produto.nome}'."})
            
            produto.quantidade -= quantidade_vendida
            produto.save()
            ItemVenda.objects.create(venda=venda, **item_dado)
            valor_total_calculado += (item_dado['preco_unitario'] * quantidade_vendida)

        venda.valor_total = valor_total_calculado
        venda.save()
        return venda

# --- SERIALIZER DA DESPESA (FINANCEIRO) ---
class DespesaSerializer(serializers.ModelSerializer):
    fornecedor_nome = serializers.ReadOnlyField(source='fornecedor.nome')

    class Meta:
        model = Despesa
        fields = '__all__'