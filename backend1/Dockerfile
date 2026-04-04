FROM node:20-alpine

WORKDIR /app

COPY backend1/package*.json ./
RUN npm ci --include=dev

COPY backend1/prisma ./prisma
RUN npx prisma generate

COPY backend1/tsconfig.json ./
COPY backend1/src ./src
RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start"]
