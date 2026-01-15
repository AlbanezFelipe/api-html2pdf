FROM node:20-bullseye-slim

# Avoid tzdata prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install wkhtmltopdf runtime deps + fonts
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fontconfig \
    libfreetype6 \
    libjpeg62-turbo \
    libpng16-16 \
    libx11-6 \
    libxcb1 \
    libxext6 \
    libxrender1 \
    xfonts-75dpi \
    xfonts-base \
    fonts-dejavu \
    fonts-liberation \
    fonts-noto \
    # fonts-noto-cjk \
    # fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*

# Install patched wkhtmltopdf
ADD https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6.1-2/wkhtmltox_0.12.6.1-2.bullseye_amd64.deb /tmp/wkhtml.deb
RUN dpkg -i /tmp/wkhtml.deb && rm /tmp/wkhtml.deb

# Optional sanity check (fail fast if broken)
RUN wkhtmltopdf --version | grep -q "patched qt"

# App directory
WORKDIR /app

# Enviroment
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Install dependencies
COPY package*.json ./

# Npm install
RUN if [ "$NODE_ENV" = "production" ]; then npm ci --omit=dev; else npm install; fi

# Copy source
COPY . .

# Expose API port
EXPOSE 8000

# Run app
CMD ["npm", "start"]
