# Этап сборки
FROM node:18 AS builder

# Установим рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальной код
COPY . .

# Сборка приложения
RUN npm run build

# Этап запуска (используем nginx)
FROM nginx:stable-alpine

# Копируем собранный фронтенд в nginx директорию
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем кастомную конфигурацию nginx (если нужно)
# COPY nginx.conf /etc/nginx/nginx.conf

# Открываем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
