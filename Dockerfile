# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 8080;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Serve config.js from /tmp if it exists, otherwise from default location
    location = /config.js {
        root /;
        try_files /tmp/config.js /usr/share/nginx/html/config.js;
        expires off;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Content-Type "application/javascript";
    }

    # Handle client-side routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # No cache for index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
}
EOF

# Configure nginx for read-only filesystem
COPY <<EOF /etc/nginx/nginx.conf
worker_processes 1;
error_log stderr notice;
pid /dev/null;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';
    
    access_log off;
    
    sendfile on;
    tcp_nopush on;
    keepalive_timeout 65;
    gzip on;
    
    # Use /tmp for all temp paths
    client_body_temp_path /tmp/client_temp;
    proxy_temp_path /tmp/proxy_temp;
    fastcgi_temp_path /tmp/fastcgi_temp;
    uwsgi_temp_path /tmp/uwsgi_temp;
    scgi_temp_path /tmp/scgi_temp;
    
    include /etc/nginx/conf.d/*.conf;
}
EOF

# Copy built app from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Remove the static config.js to ensure runtime config takes precedence
RUN rm -f /usr/share/nginx/html/config.js

# Run on port 8080 (non-root)
EXPOSE 8080

# Create startup script for OpenShift
COPY <<EOF /docker-entrypoint.d/99-create-temp-dirs.sh
#!/bin/sh
set -e
# Create temp directories at startup in writable /tmp
mkdir -p /tmp/client_temp
mkdir -p /tmp/proxy_temp
mkdir -p /tmp/fastcgi_temp
mkdir -p /tmp/uwsgi_temp
mkdir -p /tmp/scgi_temp
echo "Temp directories created successfully"
EOF

# Make scripts executable and prepare for OpenShift
RUN chmod +x /docker-entrypoint.d/99-create-temp-dirs.sh && \
    chmod -R g=u /etc/nginx /usr/share/nginx/html /docker-entrypoint.d && \
    chmod g+w /usr/share/nginx/html

# Create entrypoint script that bypasses nginx docker-entrypoint issues
COPY <<EOF /start.sh
#!/bin/sh
# Create temp dirs
mkdir -p /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp

# Generate runtime configuration from environment variables to temp file
cat > /tmp/config.js << EOL
window.APP_CONFIG = {
  APP_URL: "\${VITE_APP_URL:-https://contact.local:5173}",
  KEYCLOAK_AUTHORITY: "\${VITE_KEYCLOAK_AUTHORITY:-https://keycloak.staging.e-auth.cloud/realms/sttlab}",
  KEYCLOAK_CLIENT_ID: "\${VITE_KEYCLOAK_CLIENT_ID:-47283985-2eed-4484-bc28-dc03f0e446fe}"
};
EOL

echo "Generated runtime config:"
cat /tmp/config.js

# Copy to nginx html dir (try with fallback)
cp /tmp/config.js /usr/share/nginx/html/config.js 2>/dev/null || echo "Warning: Cannot write to /usr/share/nginx/html, config.js remains in /tmp"

# Start nginx directly without PID file
exec nginx -g "daemon off;"
EOF

RUN chmod +x /start.sh

USER nginx

CMD ["/start.sh"]