FROM python:3.10-slim

# ------------------------
# System dependencies
# ------------------------
RUN apt-get update && apt-get install -y \
    curl \
    libgl1 \
    libglib2.0-0 \
    ca-certificates \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ------------------------
# Copy only dependency files first (better caching)
# ------------------------
COPY frontend/package*.json frontend/
COPY backend/package*.json backend/
COPY ai/requirements.txt ai/

# ------------------------
# Install dependencies
# ------------------------

# Frontend
RUN cd frontend && npm install

# Backend
RUN cd backend && npm install

# Python AI
RUN pip install --no-cache-dir -r ai/requirements.txt

# ------------------------
# Copy full source after deps
# ------------------------
COPY . .

# ------------------------
# Build React frontend
# ------------------------
RUN cd frontend && npm run build

# ------------------------
# Render port
# ------------------------
EXPOSE 10000

# ------------------------
# Start backend (serves frontend build too)
# ------------------------
CMD ["node", "backend/index.js"]
