FROM node:20-alpine

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./
COPY prisma ./prisma

RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma:generate

EXPOSE 5000

CMD ["pnpm", "dev:server"]