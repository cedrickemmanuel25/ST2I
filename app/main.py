from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.database import engine, Base
from app.routes import auth, users, attendance, schedule, stats, notifications
from apscheduler.schedulers.background import BackgroundScheduler
from app.utils.notifications_logic import check_missing_pointages
from app.utils.qr_security import run_rotation_job

app = FastAPI(title="ST2I - Système de Pointage")

scheduler = BackgroundScheduler()
scheduler.add_job(check_missing_pointages, 'cron', hour=9, minute=30)
scheduler.add_job(run_rotation_job, 'cron', hour=0, minute=1, timezone="Africa/Abidjan")
scheduler.start()

# Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(attendance.router)
app.include_router(schedule.router)
app.include_router(stats.router)
app.include_router(notifications.router)

# Configuration CORS
origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000",
    "http://localhost:4200",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Bienvenue sur l'API de pointage ST2I"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
