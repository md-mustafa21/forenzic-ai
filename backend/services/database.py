import sqlite3
import os
import json
import time
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'forenzic_history.db')

def get_db_connection():
    """
    Establishes connection to the SQLite local database.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """
    Initializes database tables if they do not exist.
    Inserts high-quality seed data representing professional SaaS history logs.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create scans audit table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            classification TEXT NOT NULL,
            confidence REAL NOT NULL,
            risk_score REAL NOT NULL,
            processing_time REAL NOT NULL,
            timestamp TEXT NOT NULL,
            details TEXT NOT NULL,
            thumbnail TEXT
        )
    ''')
    
    # Check if database is empty to inject realistic historical logs
    cursor.execute("SELECT COUNT(*) FROM scans")
    count = cursor.fetchone()[0]
    
    if count == 0:
        print("[Forenzic AI Backend] Database empty. Injecting seed history logs...")
        
        # Inject standard seed items spanning the past few days to populate dashboard charts beautifully!
        seeds = [
            ("profile_deepfake_face.png", "FAKE", 0.942, 88.5, 0.45, "2026-05-18 10:24:12", 
             json.dumps({"ela": {"score": 78.2}, "fft": {"score": 85.4}, "texture": {"score": 32.5}}), ""),
            ("natural_portrait_photo.jpg", "REAL", 0.985, 4.2, 0.32, "2026-05-18 14:15:32", 
             json.dumps({"ela": {"score": 3.8}, "fft": {"score": 5.1}, "texture": {"score": 55.0}}), ""),
            ("avatar_diffusion_cyber.webp", "FAKE", 0.887, 82.0, 0.48, "2026-05-19 09:05:11", 
             json.dumps({"ela": {"score": 64.0}, "fft": {"score": 92.1}, "texture": {"score": 12.4}}), ""),
            ("verified_passport_scan.png", "REAL", 0.961, 8.5, 0.61, "2026-05-20 11:42:01", 
             json.dumps({"ela": {"score": 12.1}, "fft": {"score": 9.4}, "texture": {"score": 48.2}}), ""),
            ("synthesized_crowd_bg.jpg", "FAKE", 0.725, 68.4, 0.52, "2026-05-21 16:30:19", 
             json.dumps({"ela": {"score": 45.2}, "fft": {"score": 72.8}, "texture": {"score": 28.5}}), ""),
            ("corporate_executive_headshot.jpg", "REAL", 0.923, 11.2, 0.28, "2026-05-22 08:12:44", 
             json.dumps({"ela": {"score": 9.2}, "fft": {"score": 14.5}, "texture": {"score": 60.1}}), ""),
            ("ai_generated_architecture.webp", "FAKE", 0.971, 91.3, 0.42, "2026-05-22 18:55:03", 
             json.dumps({"ela": {"score": 89.2}, "fft": {"score": 94.0}, "texture": {"score": 18.2}}), "")
        ]
        
        cursor.executemany('''
            INSERT INTO scans (filename, classification, confidence, risk_score, processing_time, timestamp, details, thumbnail)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', seeds)
        conn.commit()
        
    conn.close()

def add_scan_record(filename: str, classification: str, confidence: float, risk_score: float, 
                    processing_time: float, details: dict, thumbnail_base64: str = "") -> int:
    """
    Saves a newly processed scan record.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    cursor.execute('''
        INSERT INTO scans (filename, classification, confidence, risk_score, processing_time, timestamp, details, thumbnail)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (filename, classification, confidence, risk_score, processing_time, timestamp, json.dumps(details), thumbnail_base64))
    
    conn.commit()
    inserted_id = cursor.lastrowid
    conn.close()
    return inserted_id

def get_scan_history(limit=50):
    """
    Fetches the list of recent scans.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scans ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    
    history = []
    for r in rows:
        history.append({
            "id": r["id"],
            "filename": r["filename"],
            "classification": r["classification"],
            "confidence": round(r["confidence"] * 100.0, 1),
            "risk_score": r["risk_score"],
            "processing_time": r["processing_time"],
            "timestamp": r["timestamp"],
            "details": json.loads(r["details"]),
            "thumbnail": r["thumbnail"] if r["thumbnail"] else None
        })
    return history

def get_dashboard_statistics():
    """
    Aggregates metrics and timeline information for dashboard visualizations.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Broad counts
    cursor.execute("SELECT COUNT(*) FROM scans")
    total_scans = cursor.fetchone()[0]
    
    if total_scans == 0:
        conn.close()
        return {
            "total_scans": 0,
            "fake_percentage": 0,
            "real_percentage": 0,
            "avg_accuracy": 0,
            "avg_latency": 0,
            "recent_activity": [],
            "weekly_timeline": []
        }
        
    cursor.execute("SELECT COUNT(*) FROM scans WHERE classification = 'FAKE'")
    fake_scans = cursor.fetchone()[0]
    real_scans = total_scans - fake_scans
    
    # 2. Latency statistics
    cursor.execute("SELECT AVG(processing_time) FROM scans")
    avg_latency = round(cursor.fetchone()[0], 3)
    
    # 3. Accuracy approximation based on model confidence averages
    cursor.execute("SELECT AVG(confidence) FROM scans")
    avg_accuracy = round(cursor.fetchone()[0] * 100.0, 1)
    
    # 4. Weekly timeline statistics (scans grouped by date)
    # Extracts the last 7 days of activity logs
    cursor.execute('''
        SELECT DATE(timestamp) as scan_date,
               SUM(CASE WHEN classification = 'FAKE' THEN 1 ELSE 0 END) as fake_count,
               SUM(CASE WHEN classification = 'REAL' THEN 1 ELSE 0 END) as real_count,
               COUNT(*) as total_count
        FROM scans
        GROUP BY scan_date
        ORDER BY scan_date ASC
        LIMIT 7
    ''')
    timeline_rows = cursor.fetchall()
    
    weekly_timeline = []
    for row in timeline_rows:
        # Standardize dates to readable text like "May 18"
        try:
            dt = datetime.strptime(row["scan_date"], "%Y-%m-%d")
            formatted_date = dt.strftime("%b %d")
        except Exception:
            formatted_date = row["scan_date"]
            
        weekly_timeline.append({
            "date": formatted_date,
            "fake": row["fake_count"],
            "real": row["real_count"],
            "total": row["total_count"]
        })
        
    conn.close()
    
    return {
        "total_scans": total_scans,
        "fake_scans": fake_scans,
        "real_scans": real_scans,
        "fake_percentage": round((fake_scans / total_scans) * 100.0, 1),
        "real_percentage": round((real_scans / total_scans) * 100.0, 1),
        "avg_accuracy": avg_accuracy,
        "avg_latency": avg_latency,
        "weekly_timeline": weekly_timeline
    }

# Initialize table tables automatically
try:
    init_db()
except Exception as e:
    print(f"[Forenzic AI Backend] Failed database initialization: {e}")
