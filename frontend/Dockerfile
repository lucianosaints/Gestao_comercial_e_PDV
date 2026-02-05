# Estágio 1: Build
FROM node:18-alpine as build
WORKDIR /app
COPY package.json package-lock.json ./

# Adicionar --legacy-peer-deps para evitar conflitos de versão
# e aumentar limite de memória do Node
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Estágio 2: Serve
FROM nginx:alpine
# Copiar o build para a pasta do Nginx
COPY --from=build /app/build /usr/share/nginx/html
# Configuração personalizada do Nginx para React Router (SPA)
RUN echo 'server { \
    listen 80; \
    location / { \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    try_files $uri $uri/ /index.html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
