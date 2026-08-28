# ─────────────────────────────────────────────────
# Connect-Hub Web — Dockerfile
# Build React/Vite app → serve with nginx
# ─────────────────────────────────────────────────

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx config for SPA routing (handle /clips, /about, etc.)
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://api:8008; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
