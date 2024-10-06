FROM node:21-bookworm-slim AS base

ENV PLAYWRIGHT_BROWSERS_PATH=/usr/bin
ENV CRAWLEE_STORAGE_DIR=/home/node/app/src/dist/data

RUN set -ex; \
  apt-get update; \
  # Needed for Crawlee.
  apt-get -y install procps; \

  npx playwright install --with-deps chromium

USER node

WORKDIR /home/node/app

COPY --chown=node:node package.json .

RUN set -ex; \
  npm install; \
  npm cache clean --force

WORKDIR /home/node/app/src
 
ENTRYPOINT ["compose/crawlee_test_downloader/entrypoint.sh"]

CMD [ "npm", "run", "start" ]