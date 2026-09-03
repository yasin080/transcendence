FROM nginx:1.27-alpine

RUN apk add --no-cache openssl

COPY docker/nginx/conf/nginx.conf   /etc/nginx/nginx.conf
COPY docker/nginx/conf/snippets/    /etc/nginx/snippets/
COPY docker/nginx/conf/dev.conf     /etc/nginx/available/dev.conf
COPY docker/nginx/conf/prod.conf    /etc/nginx/available/prod.conf
COPY docker/nginx/entrypoint.sh     /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80 443

ENTRYPOINT ["entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
