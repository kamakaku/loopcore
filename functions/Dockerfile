FROM node:20-alpine AS builder

WORKDIR /app/functions

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the functions
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app/functions

# Copy built assets from builder
COPY --from=builder /app/functions/lib ./lib
COPY --from=builder /app/functions/package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Expose port
EXPOSE 5001

# Start the server
CMD ["npm", "start"]