# Dockerfile
FROM node:20-slim

# Install wkhtmltopdf and fonts
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      wkhtmltopdf \
      fonts-noto \
      fonts-noto-cjk \
      fonts-noto-color-emoji && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Non-root for better security (optional)
RUN useradd -m appuser
WORKDIR /app

# Install deps
COPY package.json ./
RUN npm ci --omit=dev

# Copy source & templates
COPY src ./src
COPY templates ./templates

# Runtime env
ENV PORT=3000 \
    MAX_CONCURRENCY=4 \
    PDF_TIMEOUT_MS=30000

EXPOSE 3000
USER appuser

CMD ["node", "src/server.js"]