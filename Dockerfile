FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    libgl1 \
    libglib2.0-0 \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean

WORKDIR /app

COPY . .

# Install frontend deps & build
RUN cd frontend && npm install && npm run build

# Install backend deps
RUN cd backend && npm install

# Install AI Python deps
RUN pip install --no-cache-dir -r ai/requirements.txt

# Render uses PORT env
EXPOSE 10000

CMD ["node", "backend/index.js"]
