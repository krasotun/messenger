# Берем официальный Node.js image на Alpine Linux для сборки Angular-приложения.
FROM node:24-alpine AS build

# Создаем и выбираем рабочую директорию внутри build-stage container.
WORKDIR /app

# Копируем только package-файлы, чтобы Docker мог кешировать npm ci отдельно от исходников.
COPY package*.json ./

# Устанавливаем зависимости строго по package-lock.json, что важно для воспроизводимой сборки.
RUN npm ci

# Копируем остальные файлы проекта в build-stage.
COPY . .

# Запускаем production build Angular-приложения.
ARG BUILD_CONFIGURATION=production
RUN npm run build -- --configuration ${BUILD_CONFIGURATION}

# Берем официальный nginx image на Alpine Linux для runtime-stage.
FROM nginx:1.29-alpine

# Копируем нашу nginx-конфигурацию внутрь image вместо дефолтного site config.
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Копируем собранные Angular static files из build-stage в директорию, которую раздает nginx.
COPY --from=build /app/dist/messenger/browser /usr/share/nginx/html

# Документируем, что container ожидает HTTP-трафик на порту 80.
EXPOSE 80

# Запускаем nginx в foreground-режиме, чтобы Docker container продолжал работать.
CMD ["nginx", "-g", "daemon off;"]

