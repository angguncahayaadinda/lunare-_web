from fastapi import FastAPI
from database import engine
from routes.auth import router as auth_router
from routes.periods import router as period_router
from routes.symptoms import router as symptom_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import models

# Ensure uploads directory exists
os.makedirs("uploads/profile_pictures", exist_ok=True)

app = FastAPI()
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    models.Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"⚠️  Warning: Failed to create database tables on startup: {e}")
    print("The app will continue, but database tables may not exist yet.")

app.include_router(auth_router)
app.include_router(period_router)
app.include_router(symptom_router)

@app.get("/")
def home():
    return {
        "message": "Lunare API 🌙"
    }