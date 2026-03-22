FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

ENV AI_BACKEND_MODE=gpu
ENV GPU_API_URL=http://aiinteri-proxy:7860

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV AI_BACKEND_MODE=gpu
ENV GPU_API_URL=http://aiinteri-proxy:7860

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

RUN mkdir -p public/uploads public/results

EXPOSE 3100

CMD ["node", "server.js"]
