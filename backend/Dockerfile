# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy app source
COPY . .

# Expose port
EXPOSE 5001

# Start the development server
CMD ["npm", "run", "dev"]
