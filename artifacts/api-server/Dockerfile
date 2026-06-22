FROM node:20-alpine

WORKDIR /app

# تثبيت pnpm
RUN npm install -g pnpm

# نسخ الملفات
COPY . .

# تثبيت dependencies بدون build scripts
RUN pnpm install --no-scripts

# بناء api-server فقط
WORKDIR /app/artifacts/api-server
RUN npm run build

EXPOSE 8080

CMD ["node", "dist/index.mjs"]
