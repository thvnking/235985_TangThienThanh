FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src

RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine

ENV API_URL=""
ENV PORT=8080

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY config.js.template /usr/share/nginx/html/config.js.template

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider "http://127.0.0.1:${PORT}/" || exit 1

CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && envsubst '${API_URL}' < /usr/share/nginx/html/config.js.template > /tmp/config.js && exec nginx -g 'daemon off;'"]
