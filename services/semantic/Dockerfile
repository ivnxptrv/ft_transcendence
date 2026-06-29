# Stage 1: Build dependencies
FROM python:3.12-slim AS builder
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY devenv.nix ./
RUN sed -n "/venv.requirements = ''/,/''/p" devenv.nix \
      | sed '1d;$d' \
      | sed 's/^[[:space:]]*//' \
      > requirements.txt \
    && cat requirements.txt \
    && pip install --no-cache-dir -r requirements.txt

# Pre-download the model in the builder, into a known cache dir
ENV HF_HOME=/opt/hf-cache
RUN mkdir -p /opt/hf-cache \
    && python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('BAAI/bge-m3')"

# Stage 2: Runtime
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH" \
    HF_HOME=/opt/hf-cache \
    HF_HUB_OFFLINE=1
WORKDIR /app
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /opt/hf-cache /opt/hf-cache
COPY . .
RUN addgroup --system --gid 1001 appgroup \
    && adduser --system --uid 1001 --ingroup appgroup appuser \
    && chown -R appuser:appgroup /app /opt/hf-cache
USER appuser
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
