FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY package*.json ./
RUN npm config set fetch-retry-maxtimeout 600000 && npm config set fetch-retry-mintimeout 10000 && apk add --no-cache python3 make g++ git && npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]
