import os
from sentence_transformers import SentenceTransformer

INTERACTION_URL = os.getenv("INTERACTION_URL", "http://localhost:8000")

MODEL = SentenceTransformer(
    "BAAI/bge-small-en-v1.5"
)
