"""
Script to initialize database tables with retry logic
Run this before starting the server if you're having connection issues
"""
import time
import sys
from database import engine
import models

MAX_RETRIES = 5
RETRY_DELAY = 2  # seconds

def init_db():
    for attempt in range(MAX_RETRIES):
        try:
            print(f"🔄 Attempt {attempt + 1}/{MAX_RETRIES}: Creating database tables...")
            models.Base.metadata.create_all(bind=engine)
            print("✅ Database tables created successfully!")
            return True
        except Exception as e:
            print(f"❌ Attempt {attempt + 1} failed: {e}")
            if attempt < MAX_RETRIES - 1:
                print(f"⏳ Retrying in {RETRY_DELAY} seconds...")
                time.sleep(RETRY_DELAY)
            else:
                print(f"❌ Failed after {MAX_RETRIES} attempts")
                return False

if __name__ == "__main__":
    success = init_db()
    sys.exit(0 if success else 1)
