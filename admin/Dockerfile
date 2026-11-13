# لوحة تحكم لينكار (Next.js 16) — نفس طريقة صورة الموقع: بناء على مراحل بإخراج standalone

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# رابط الـAPI لما الخادم يجهز (دلوقتي اللوحة شغّالة ببيانات تجريبية جوه الكود)
ARG NEXT_PUBLIC_API_URL=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_TELEMETRY_DISABLED=1
# الخط من Google Fonts بيتنزّل وقت البناء (next/font/google) — البناء محتاج إنترنت
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/login > /dev/null || exit 1
CMD ["node", "server.js"]
