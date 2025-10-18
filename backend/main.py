# main.py
from fastapi import FastAPI
from api.judge import router as judges_router

app = FastAPI(title="Judge API Orchestrator")

# Register routers (you can add more later)
app.include_router(judges_router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Judge API"}
