# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Argumentos de build para URL de API
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build de la aplicación
RUN npm run build

# Production stage
FROM nginx:alpine

# Copiar archivos construidos
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Comando para iniciar nginx (nginx corre como root por defecto)
CMD ["nginx", "-g", "daemon off;"]