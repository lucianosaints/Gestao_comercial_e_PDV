# SAKURA SYSTEM 🌸 (Gestão de Patrimônio e PDV)

Sistema completo de gestão comercial, incluindo controle de estoque, ponto de venda (PDV), dashboard financeiro e controle de acesso.

---

## 🛠 Tecnologias Utilizadas

* **Backend:** Python (Django Rest Framework)
* **Frontend:** React.js
* **Banco de Dados:** SQLite (Dev)
* **Autenticação:** JWT

---

## ⚙️ Funcionalidades Principais

### 🛒 Frente de Caixa (PDV)
* **Vendas Rápidas:** Interface otimizada para operação ágil.
* **Pagamentos:** Múltiplas formas (Dinheiro, Cartão, Pix, Mumbuca).
* **Integrações:** Leitor de código de barras, Impressão de Cupom e Envio por WhatsApp.

### 📦 Gestão de Estoque
* **Cadastro Completo:** Produtos com fotos, categorias e fornecedores.
* **Importação XML:** Entrada de notas fiscais automática.
* **Alerta de Estoque:** Avisa quando produtos estão acabando.
* **Etiquetas:** Gerador de etiquetas de código de barras (PDF).

### 💰 Financeiro
* **Contas a Pagar:** Gestão de despesas (Luz, Aluguel, Fornecedores).
* **Painel Gerencial:** Gráficos de vendas, lucros e despesas.
* **Relatórios:** Exportação para Excel e PDF.

### 🔒 Controle de Acesso
* **Vendedor:** Acesso restrito ao PDV e Clientes.
* **Gerente:** Acesso total (Financeiro, Configurações).

---

## 🚀 Como Rodar o Projeto

### 1. Backend (Django)
```bash
source .venv/Scripts/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 2. Frontend (React)
```bash
cd frontend
npm install
npm start
```
Acesse: `http://localhost:3000`

---
**Desenvolvido por Luciano Saints**
