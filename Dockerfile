FROM python:3.10-slim

# ------------------------
# System + Chromium deps
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
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ------------------------
# Puppeteer config
# ------------------------
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

# ------------------------
# Copy dependency files first
# ------------------------
COPY frontend/package*.json frontend/
COPY backend/package*.json backend/
COPY ai/requirements.txt ai/

# ------------------------
# Install dependencies
# ------------------------
RUN cd frontend && npm install
RUN cd backend && npm install
RUN pip install --no-cache-dir -r ai/requirements.txt

# ------------------------
# Copy full project
# ------------------------
COPY . .

# ------------------------
# Build React frontend
# ------------------------
RUN cd frontend && npm run build

# ------------------------
# Expose Render port
# ------------------------
EXPOSE 10000

# ------------------------
# Start backend
# ------------------------
CMD ["node", "backend/index.js"]
