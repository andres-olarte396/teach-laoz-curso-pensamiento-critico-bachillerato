# Stage 1: Build
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
COPY package*.json ./
RUN npm config set fetch-retry-maxtimeout 600000 && npm config set fetch-retry-mintimeout 10000 && npm ci

COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
