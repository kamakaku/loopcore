FROM node:20-alpine

WORKDIR /app/functions

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the functions
RUN npm run build

# Expose port
EXPOSE 5001

# Start the server
CMD ["npm", "start"]