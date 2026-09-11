FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirement.txt /app/
RUN pip install --no-cache-dir -r requirement.txt

# Copy application files
COPY backend/main.py /app/backend/main.py
COPY src /app/src
COPY data /app/data
COPY models /app/models

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
