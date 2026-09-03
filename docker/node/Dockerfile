FROM node:22-alpine

ARG UID=1000
ARG GID=1000

RUN apk add --no-cache bash

# The node image ships a `node` user; realign it with the host user so files
# written by npm/vite are not owned by someone else on the host.
RUN apk add --no-cache shadow \
    && (groupmod -o -g "${GID}" node 2>/dev/null || true) \
    && (usermod  -o -u "${UID}" -g "${GID}" node 2>/dev/null || true) \
    && apk del shadow

COPY docker/node/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /app

RUN mkdir -p /app/node_modules && chown -R node:node /app

EXPOSE 5173

ENTRYPOINT ["entrypoint.sh"]
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
