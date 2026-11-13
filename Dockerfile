# موقع لينكار (Next.js 16) — بناء على مراحل بإخراج standalone (صورة خفيفة، نفس طريقة عبور)

# 1) الاعتماديات
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# npm install (مش ci) لأن فيه اعتماديات اختيارية خاصة بالمنصة (lightningcss / tailwind oxide على musl)
# ممكن ماتكونش في الـlock اللي اتعمل على ويندوز.
RUN npm install --no-audit --no-fund

# 2) البناء
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# الرابط النهائي للموقع (sitemap.xml و robots.txt) — بيتدمج وقت البناء، فلازم يتبعت هنا مش وقت التشغيل.
ARG NEXT_PUBLIC_SITE_URL=https://linkar-web.vercel.app
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3) التشغيل (server.js الناتج من standalone)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# مستخدم مش root
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
# ملفات التشغيل بس
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# كاش تحسين الصور (AVIF/WebP) — عليه volume في compose عشان مايتمسحش مع كل نشر
RUN mkdir -p /app/.next/cache/images && chown -R nextjs:nodejs /app/.next/cache
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/robots.txt > /dev/null || exit 1
CMD ["node", "server.js"]
