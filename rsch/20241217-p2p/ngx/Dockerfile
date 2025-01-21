FROM ubuntu:20.04

# Установка необходимых пакетов
RUN apt-get update && apt-get install -y \
    build-essential \
    libpcre3 \
    libpcre3-dev \   
    zlib1g \
    zlib1g-dev \
    libssl-dev \
    wget \
    libc6-dev \
    libpthread-stubs0-dev

# Добавляем пользователя nginx
RUN groupadd -r nginx && useradd -r -g nginx nginx

# Скачивание исходников Nginx
RUN wget http://nginx.org/download/nginx-1.20.2.tar.gz && \
    tar -xzvf nginx-1.20.2.tar.gz && \
    rm nginx-1.20.2.tar.gz

# Копирование модуля в образ
COPY modules/ngx_http_crc32_module.c /nginx-1.20.2/modules/
COPY modules/config /nginx-1.20.2/modules/

# Сборка Nginx с модулем
WORKDIR /nginx-1.20.2
RUN ./configure --with-threads --add-module=modules/ --user=nginx --group=nginx --prefix=/usr/local/nginx && \
    make && \
    make install

# Копирование конфигурации Nginx
COPY nginx.conf /usr/local/nginx/conf/nginx.conf

# Создаем необходимые директории
RUN mkdir -p /var/cache/nginx /var/run/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/run/nginx /usr/local/nginx

# Используем непривилегированного пользователя
USER nginx

# Открытие порта
EXPOSE 8822

# Запуск Nginx
CMD ["/usr/local/nginx/sbin/nginx", "-g", "daemon off;"]
