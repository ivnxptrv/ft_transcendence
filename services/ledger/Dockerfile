FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the app package and config files
COPY ./app ./app
COPY ./migrations ./migrations
COPY alembic.ini .
COPY entrypoint.sh .

RUN chmod +x entrypoint.sh

# Add 'netcat-openbsd' to your apt-get line
RUN apt-get update && apt-get install -y libpq-dev gcc netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Set PYTHONPATH so 'app' is found by Python
ENV PYTHONPATH=/app

ENTRYPOINT ["./entrypoint.sh"]