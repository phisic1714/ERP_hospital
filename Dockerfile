FROM node:24-alpine AS build

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
COPY apps/shell/package.json ./apps/shell/package.json
COPY apps/inventory/package.json ./apps/inventory/package.json
COPY apps/procurement/package.json ./apps/procurement/package.json
COPY apps/operations/package.json ./apps/operations/package.json
COPY apps/mock-api/package.json ./apps/mock-api/package.json
COPY apps/budget/package.json ./apps/budget/package.json
COPY apps/hr/package.json ./apps/hr/package.json
COPY apps/finance/package.json ./apps/finance/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/app-context/package.json ./packages/app-context/package.json
COPY packages/next-config/package.json ./packages/next-config/package.json
RUN npm ci

COPY apps ./apps
COPY packages ./packages
COPY tsconfig.json tailwind.config.js postcss.config.js ./
ARG APP_DIR
RUN ./node_modules/.bin/next build "$APP_DIR"


FROM nginx:stable-alpine AS gateway

COPY nginx/gateway.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/shell/out/ /usr/share/nginx/html/

EXPOSE 80


FROM nginx:stable-alpine AS runtime

ARG APP_DIR
ARG APP_BASE_PATH=""

COPY nginx/static.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/${APP_DIR}/out/ /usr/share/nginx/html${APP_BASE_PATH}/

EXPOSE 80
