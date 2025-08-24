# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory at /Backend
WORKDIR /Backend

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (better caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything into container (so we get aetherium/, alembic.ini, migrations/, uploads/)
COPY . .

# Create uploads directories (match local structure)
RUN mkdir -p uploads/cover_images uploads/profile_pictures uploads/trailers

# Expose FastAPI port
EXPOSE 8000

# Set environment variables
ENV PYTHONPATH=/Backend
ENV PYTHONUNBUFFERED=1

# Default command: start FastAPI
CMD ["uvicorn", "aetherium.main:app", "--host", "0.0.0.0", "--port", "8000"]
