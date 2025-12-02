FROM node:18-alpine

WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY shared ./shared
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install

# Copy backend source
COPY backend ./backend

# Build shared and backend
WORKDIR /app
RUN npm run build --workspace=shared
RUN npm run build --workspace=backend

# Create data directory
RUN mkdir -p /app/data

WORKDIR /app/backend

# Expose port
EXPOSE 3001

# Run migrations and start
CMD ["sh", "-c", "npm run migrate && npm start"]

