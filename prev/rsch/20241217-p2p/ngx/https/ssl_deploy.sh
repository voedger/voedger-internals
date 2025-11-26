#!/bin/bash

SSL_CONF="/home/ubuntu/nginx/conf.d/ssl_server.conf"

# Создаём конфигурацию SSL-сервера
cat > "$SSL_CONF" <<EOF
    server {
        listen 443 ssl;
        server_name app-node-01.cdci.voedger.io;

        ssl_certificate /etc/letsencrypt/live/app-node-01.cdci.voedger.io/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/app-node-01.cdci.voedger.io/privkey.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;


        # Backend location with wsid extraction
        location ~ ^/api/[^/]+/[^/]+/([^/]+)$ {
            proxy_pass http://backend;
            proxy_set_header X-WSID \$wsid;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        }

        # Grafana location
        location /grafana/ {
            proxy_set_header Host \$host;
            proxy_pass http://grafana;
        }
        # Proxy Grafana Live WebSocket connections.
        location /grafana/api/live/ {
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection \$connection_upgrade;
            proxy_set_header Host \$host;
            proxy_pass http://grafana;
        }

        # Prometheus location
        location /prometheus {
            proxy_pass http://prometheus;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        }

        location /static/ {
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        }

        # Default location for unmatched requests - return 400 Bad Request
        location / {
            return 400 "Bad Request\n";
        }
    }
EOF

# Перезагружаем Nginx для применения новой конфигурации
# nginx -s reload
docker service update SEDockerStack_nginx --force
