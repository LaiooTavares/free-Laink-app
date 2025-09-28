# Escolha a versão do Node.js compatível com seu projeto (ex: 22)
FROM node:22-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependências primeiro (para otimizar o cache)
COPY package*.json ./

# Instala todas as dependências
RUN npm install

# Copia o schema do Prisma para que o comando generate funcione
COPY prisma ./prisma/

# --- CORREÇÃO ADICIONADA AQUI ---
# Gera o código do Prisma Client com base no seu schema
RUN npx prisma generate

# Copia o resto do código-fonte da sua aplicação
COPY . .

# Expõe a porta que sua aplicação usa
EXPOSE 3333

# Comando para iniciar o servidor
CMD [ "node", "src/server.js" ]