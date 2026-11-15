# Linkar website (Next.js 16) — multi-stage build with standalone output (small image)

# 1) Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# npm install (not ci): platform-specific optional deps (lightningcss / tailwind oxide on musl)
# may be missing from a lockfile generated on Windows.
RUN npm install --no-audit --no-fund

# 2) Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Final public URL (sitemap.xml, robots.txt) — baked in at build time, so it must be passed here, not at runtime.
ARG NEXT_PUBLIC_SITE_URL=https://linkar-web.vercel.app
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3) Run (server.js from the standalone output)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# Non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
# Runtime files only
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Optimized image cache (AVIF/WebP) — mounted as a volume in compose so it survives redeploys
RUN mkdir -p /app/.next/cache/images && chown -R nextjs:nodejs /app/.next/cache
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/robots.txt > /dev/null || exit 1
CMD ["node", "server.js"]
