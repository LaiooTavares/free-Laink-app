# Estágio 1: Build da aplicação
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Estágio 2: Produção
FROM nginx:1.23-alpine

# Remove a configuração padrão do Nginx para evitar qualquer conflito
RUN rm /etc/nginx/conf.d/default.conf

# Copia a nossa nova configuração para o lugar certo
COPY nginx.conf /etc/nginx/conf.d/

# Copia os arquivos da aplicação já compilados
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]