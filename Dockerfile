FROM python:3.10-slim

# ------------------------
# System + Chromium deps (IMPORTANT for Puppeteer)
# ------------------------
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    ca-certificates \
    build-essential \
    fonts-liberation \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    libglib2.0-0 \
    libgl1 \
    chromium \
    chromium-sandbox \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Puppeteer will use system Chromium (not download its own)
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

# ------------------------
# Copy only dependency files first (caching)
# ------------------------
COPY frontend/package*.json frontend/
COPY backend/package*.json backend/
COPY ai/requirements.txt ai/

# ------------------------
# Install deps
# ------------------------

RUN cd frontend && npm install
RUN cd backend && npm install
RUN pip install --no-cache-dir -r ai/requirements.txt

# ------------------------
# Copy full source
# ------------------------
COPY . .

# ------------------------
# Build frontend
# ------------------------
RUN cd frontend && npm run build

# ------------------------
# Render port
# ------------------------
EXPOSE 10000

# ------------------------
# Start backend
# ------------------------
CMD ["node", "backend/index.js"]
