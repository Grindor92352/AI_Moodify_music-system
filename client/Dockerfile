# ─────────────────────────────────────────────────────────────────────────────
# AI Moodify — React Frontend Dockerfile
# Multi-stage build for lightweight production delivery
# ─────────────────────────────────────────────────────────────────────────────

# Stage 1: Build compilation
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies separately to leverage cache
COPY package*.json ./
RUN npm install

# Copy source code and compile Vite production assets
COPY . .
RUN npm run build

# Stage 2: Serve static production assets with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
