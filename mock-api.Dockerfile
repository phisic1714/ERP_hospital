FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
COPY apps/shell/package.json ./apps/shell/package.json
COPY apps/inventory/package.json ./apps/inventory/package.json
COPY apps/procurement/package.json ./apps/procurement/package.json
COPY apps/operations/package.json ./apps/operations/package.json
COPY apps/mock-api/package.json ./apps/mock-api/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/app-context/package.json ./packages/app-context/package.json
COPY packages/next-config/package.json ./packages/next-config/package.json
RUN npm ci --no-audit --no-fund
COPY prisma ./prisma
COPY scripts/init-mock-db.mjs ./scripts/init-mock-db.mjs
COPY apps/mock-api ./apps/mock-api
COPY tsconfig.json ./
RUN npm run prisma:generate
RUN npm run build:mock-api
ENV NODE_ENV=production
ENV DATABASE_URL=file:/data/mock.db
ENV MOCK_DATABASE_PATH=/data/mock.db
EXPOSE 3000
CMD ["sh", "-c", "node scripts/init-mock-db.mjs && exec npm run start --workspace=@erp/mock-api -- -H 0.0.0.0 -p 3000"]
