# Usar imagem oficial do Python leve
FROM python:3.12-slim

# Evitar que o Python grave arquivos .pyc e buffer de saída
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema (gcc necessário para algumas libs)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar dependências
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o restante do código
COPY . /app/

# Expor a porta 8000
EXPOSE 8000

# Comando para rodar a aplicação
# Em produção, usaremos Gunicorn. Em dev, pode ser runserver.
# Aqui deixamos pronto para produção com Gunicorn.
CMD ["gunicorn", "first_steps_django.wsgi:application", "--bind", "0.0.0.0:8000"]
