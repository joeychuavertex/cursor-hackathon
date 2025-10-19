# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.judge import router as judges_router
from api.heygen import router as heygen_router
from api.transcribe import router as transcribe_router
from api.performance import router as performance_router

app = FastAPI(title="Judge API Orchestrator")

# CORS middleware to allow frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "https://*.vercel.app"
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers (you can add more later)
app.include_router(judges_router)
app.include_router(heygen_router)
app.include_router(transcribe_router)
app.include_router(performance_router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Judge API"}
