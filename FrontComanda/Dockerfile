# Estágio de build
FROM node:20-alpine AS build
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm ci

# Instalar @types/node para resolver erro do vite.config.ts e outras dependências faltantes
RUN npm install --save-dev @types/node
RUN npm install --save date-fns @mui/x-date-pickers @mui/x-internals

# Copiar código fonte
COPY . .

# URL da API vem do build-arg (docker-compose passa isso)
ARG VITE_API_URL=https://api.mindra.me
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env

# Executando o build sem verificação de tipo para evitar erros
RUN npm run build

# Estágio de produção
FROM nginx:stable-alpine AS production

# Copiar arquivos buildados
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar a configuração personalizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]