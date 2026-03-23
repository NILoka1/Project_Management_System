FROM node:20-alpine

WORKDIR /app

# Копируем все
COPY . .

# Устанавливаем зависимости
RUN npm install

# Генерируем Prisma
RUN npx prisma generate

EXPOSE 5000

CMD ["node", "src/index.js"]