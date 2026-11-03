FROM node:22-alpine

RUN apk add --no-cache bash

COPY docker/node/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /app

# The container runs as root (see compose.yaml), so the node_modules named
# volume, seeded from this directory on first start, is writable by npm.
RUN mkdir -p /app/node_modules

EXPOSE 5173

ENTRYPOINT ["entrypoint.sh"]
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
