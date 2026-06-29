# Stage 1: Build dependencies
FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Build tools for psycopg2/native wheels (drop if all wheels are pure-python)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Isolated venv we can copy into the runtime stage
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy ONLY devenv.nix first so this layer caches until deps change
COPY devenv.nix ./

# Extract the venv.requirements block into a requirements.txt
RUN sed -n "/venv.requirements = ''/,/''/p" devenv.nix \
      | sed '1d;$d' \
      | sed 's/^[[:space:]]*//' \
      > requirements.txt \
    && echo "----- extracted requirements -----" \
    && cat requirements.txt \
    && pip install --no-cache-dir -r requirements.txt


# Stage 2: Runtime
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

WORKDIR /app

COPY --from=builder /opt/venv /opt/venv
COPY . .

RUN addgroup --system --gid 1001 appgroup \
    && adduser --system --uid 1001 --ingroup appgroup appuser \
    && chown -R appuser:appgroup /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
