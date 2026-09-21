# Compila con Vite y sirve el resultado con nginx, que además reenvía /api al backend
# (mismo origen para el navegador: sin problema de CORS).
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# VITE_API_URL vacío (por defecto): en producción el front llama a /api en su propio origen,
# y es nginx quien lo reenvía al backend. No hace falta ninguna variable en este build.
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
