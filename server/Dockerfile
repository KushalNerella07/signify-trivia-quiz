# Dockerfile for a Node.js application using TypeScript`
FROM node:20-alpine AS build
WORKDIR /app


COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build          # "build": "tsc"

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production


COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist          ./dist
COPY --from=build /app/package*.json ./


CMD ["sh", "-c", "node dist/seed.js && node dist/app.js"]
