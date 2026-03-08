from fastapi import FastAPI
import os

app = FastAPI()


def get_database_url():
    db_user = os.getenv("DB_USER")
    db_host = os.getenv("DB_HOST")
    db_name = os.getenv("DB_NAME")
    db_pass = os.getenv("DB_PASS")

    return f"postgresql://{db_user}:{db_pass}@{db_host}:5432/{db_name}"


DATABASE_URL = get_database_url()


@app.get("/test")
def read_test():
    return {
        "status": "online",
        "service": "identity-svc",
        "database_config": DATABASE_URL,
    }
