
from sqlalchemy import create_all, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import time
from functools import wraps

# Render PostgreSQL connection string
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/dbname")

# Resilience: Retry Decorator with Exponential Backoff for Render Cold Starts
def retry_db_connection(max_retries=5, initial_delay=2):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            delay = initial_delay
            for i in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if i == max_retries - 1:
                        raise e
                    print(f"Database connection failed. Retrying in {delay}s... (Attempt {i+1}/{max_retries})")
                    time.sleep(delay)
                    delay *= 2
            return func(*args, **kwargs)
        return wrapper
    return decorator

@retry_db_connection()
def get_engine():
    return create_engine(SQLALCHEMY_DATABASE_URL)

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
