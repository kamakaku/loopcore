FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm isntall

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]