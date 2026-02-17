# AgentFlow - Self-hosted Docker build
FROM node:22-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Build for self-hosted (root path)
ENV SITE_URL=http://localhost:3000
ENV BASE_PATH=/
RUN npm run build

# Production: lightweight nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
