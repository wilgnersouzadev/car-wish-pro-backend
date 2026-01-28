FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Instala dependências do sistema (se precisar de build nativo no futuro, já está preparado)
RUN apk add --no-cache bash python3 make g++ \
  && npm install -g npm@latest

# Copia apenas arquivos de dependência primeiro para melhor cache
COPY package.json ./

RUN npm install

# Copia o restante do código
COPY . .

# Build da aplicação NestJS
RUN npm run build

FROM node:22-alpine AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copia apenas o necessário para rodar em produção
COPY package.json ./
RUN npm install --only=production

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]

