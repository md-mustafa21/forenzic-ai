import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Import APIRouters
from backend.api.auth import router as auth_router
from backend.api.dashboard import router as dashboard_router
from backend.api.predict import router as predict_router

# Initialize SQLite database setup
from backend.services.database import init_db

# Hugging Face model warm-up (replacing TensorFlow due to Python 3.14 compatibility)
from backend.services.huggingface_detector import init_model as tf_init_model


# ── Lifespan context: runs at startup / shutdown ─────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan handler.
    Runs startup logic before the server accepts requests, and
    cleanup on shutdown.
    """
    # 1. Bootstrap SQLite schema
    try:
        init_db()
        print("[Forenzic AI] SQLite database initialised.")
    except Exception as e:
        print(f"[Forenzic AI] SQLite setup error: {e}")

    # 2. Pre-load the TensorFlow MobileNetV2 model into memory.
    #    This ensures the first real request has zero cold-start latency.
    print("[Forenzic AI] Loading TensorFlow MobileNetV2 model – please wait …")
    tf_init_model()
    print("[Forenzic AI] TensorFlow model ready.")

    yield  # Application runs here

    # Shutdown (nothing to clean up for HF pipeline)
    print("[Forenzic AI] Server shutting down.")


# ── Create core application ───────────────────────────────────────────────────
app = FastAPI(
    title="Forenzic AI – Advanced AI Image Detection Engine",
    description=(
        "REST API powering digital forensics with a TensorFlow MobileNetV2 "
        "for AI-generated vs. real image classification."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

# ── CORS Middleware ───────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global exception handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"System Core Error: {str(exc)}"}
    )

# ── Mount API Routers ─────────────────────────────────────────────────────────
app.include_router(auth_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(predict_router, prefix="/api")


@app.get("/")
def read_root():
    """
    Health-check endpoint. Reports system vitals.
    """
    return {
        "status": "ONLINE",
        "service": "Forenzic AI API Server",
        "version": "2.0.0",
        "model": "TensorFlow MobileNetV2 (deepfake_detector.h5)",
        "endpoints": {
            "prediction":          "/api/predict [POST]",
            "dashboard_stats":     "/api/dashboard/stats [GET]",
            "dashboard_history":   "/api/dashboard/history [GET]",
            "authentication":      "/api/auth/login [POST] & /api/auth/signup [POST]"
        }
    }

if __name__ == "__main__":
    print("[Forenzic AI] Launching FastAPI Web Server on http://127.0.0.1:8001 …")
    uvicorn.run("backend.app:app", host="127.0.0.1", port=8001, reload=False)
