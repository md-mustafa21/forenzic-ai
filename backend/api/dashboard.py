from fastapi import APIRouter
from backend.services.database import get_dashboard_statistics, get_scan_history

router = APIRouter(prefix="/dashboard", tags=["Dashboard Analytics"])

@router.get("/stats")
def fetch_statistics():
    """
    Returns aggregated metrics, total real vs fake quantities, and weekly charts data.
    """
    return get_dashboard_statistics()

@router.get("/history")
def fetch_history(limit: int = 50):
    """
    Returns previous scan logs, processing delays, and thumbnails.
    """
    return get_scan_history(limit=limit)
