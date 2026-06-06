import os
import re
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Handle postgres scheme
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Clean up square brackets around the password if the user copied [PASSWORD] literally
    # e.g., postgresql://username:[password]@host:port/db
    match = re.search(r'://([^:]+):\[([^\]]+)\]@', DATABASE_URL)
    if match:
        user = match.group(1)
        pwd = match.group(2)
        DATABASE_URL = DATABASE_URL.replace(f":[{pwd}]@", f":{pwd}@")

if DATABASE_URL and DATABASE_URL.startswith("postgresql"):
    # Supabase session mode has a max pool_size of 15
    # Use very small pool to avoid hitting connection limits
    engine = create_engine(
        DATABASE_URL, 
        pool_pre_ping=True,
        pool_size=2,
        max_overflow=2,
        pool_recycle=1800,  # Recycle connections every 30 mins
        connect_args={"connect_timeout": 5}
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_size=2,
        max_overflow=2
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()