# PATRI-TECH 🏢
**Sistema de Gestão de Patrimônio e Vendas (PDV)**

O **PATRI-TECH** é uma aplicação Full-Stack desenvolvida para o controle eficiente de bens patrimoniais, unidades, categorias, gestão de usuários e ponto de venda (PDV).

---

## 🛠 Tecnologias Utilizadas

Este projeto foi construído utilizando uma arquitetura moderna separada em **Backend (API)** e **Frontend (Interface)**.

### 🐍 Backend (Servidor & API)
* **Linguagem:** Python 3.12+
* **Framework Principal:** Django 5.x
* **API:** Django REST Framework (DRF)
* **Banco de Dados:** SQLite (Desenvolvimento)
* **Autenticação:** JWT (JSON Web Tokens)
* **Relatórios:** ReportLab (PDF) e OpenPyXL (Excel)

### ⚛️ Frontend (Interface do Usuário)
* **Biblioteca Principal:** React.js
* **Comunicação HTTP:** Axios
* **Roteamento:** React Router Dom
* **Ícones:** React Icons (FontAwesome)

---

## ⚙️ Funcionalidades Principais

* **Dashboard Interativo:** 
    * Cards coloridos com métricas em tempo real.
    * **[NOVO] Alerta de Estoque:** Monitoramento visual de produtos com estoque baixo (padrão < 2).
    * Gráficos de vendas e performance.

* **Ponto de Venda (PDV):**
    * Adição de produtos ao carrinho com verificação de estoque.
    * **[NOVO] Desconto Manual:** Aplicação de desconto em valor (R$) antes de finalizar.
    * Múltiplas formas de pagamento (Dinheiro, Pix, Crédito, Débito, Mumbuca).
    * Geração automática de ticket de venda na tela.

* **Gestão de Bens (Produtos):** 
    * Controle completo de ativos com imagens, valores e categorias.
    * Histórico de alterações por produto.
    * **[NOVO] Exportação para Excel:** Download do inventário completo em planilha.

* **Relatórios Gerenciais:**
    * **[NOVO] Relatório de Vendas (PDF):** Documento detalhado com todas as transações, filtrável por data.

* **Controle de Acesso:**
    * Sistema de login seguro.
    * Perfis de usuário (Gerente, Vendedor, Estoquista).

---

## 🚀 Como Rodar o Projeto

Para rodar o sistema, é necessário iniciar o servidor Backend e o servidor Frontend em terminais separados.

### 1. Rodando o Backend (Django)
```bash
# Entre na pasta raiz e ative o ambiente virtual
source .venv/Scripts/activate  # Windows (Git Bash)
# ou
.venv\Scripts\activate     # Windows (CMD/PowerShell)

# Instale as dependências (incluindo as novas)
pip install -r requirements.txt

# Execute as migrações do banco (caso existam atualizações)
python manage.py migrate

# Inicie o servidor
python manage.py runserver
```
O Backend rodará em: `http://127.0.0.1:8000/`

### 2. Rodando o Frontend (React)
```bash
# Entre na pasta do frontend
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm start
```
O Frontend abrirá automaticamente em: `http://localhost:3000/`

---

## 📦 Dependências Adicionadas Recentemente
- `reportlab`: Geração de PDFs.
- `openpyxl`: Geração de planilhas Excel.

---

**Desenvolvido por Luciano Saints**