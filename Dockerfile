FROM node:22-alpine

WORKDIR /usr/src/app

# Instala o netcat para verificação do banco de dados
RUN apk add --no-cache netcat-openbsd

COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY docker-entrypoint.sh ./

RUN npm install -g pnpm
RUN pnpm install

COPY . .

RUN rm -rf dist || true
RUN pnpm build

# Dá permissão de execução ao script de entrada
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

# Usa o script de entrada como ponto de entrada
ENTRYPOINT ["./docker-entrypoint.sh"] 