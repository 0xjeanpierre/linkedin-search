FROM nginx:1.27-alpine

# Copia apenas os arquivos da página para o diretório servido pelo nginx.
COPY index.html favicon.svg /usr/share/nginx/html/
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js

EXPOSE 80
