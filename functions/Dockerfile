FROM node:20-alpine

WORKDIR /app/functions

# Install dependencies
COPY functions/package*.json ./
RUN npm ci

# Copy source code
COPY functions/ .

# Build the functions
RUN npm run build

# Start the Firebase Functions emulator
CMD ["npm", "run", "serve"]