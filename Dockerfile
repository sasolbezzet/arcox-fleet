# Ultra-lightweight Node.js container for Google Cloud Run
FROM node:20-alpine AS runner

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install --omit=dev

# Copy source code
COPY . .

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "src/index.mjs"]
