import io
from PIL import Image
from fastapi.testclient import TestClient
from backend.app import app

def test_forenzic_api():
    """
    Automated integration tests validating FastAPI router operations.
    Executes mock uploads, stat retrievals, and auth handlers without needing a running server.
    """
    client = TestClient(app)
    
    print("\n==========================================")
    print(" FORENZIC AI BACKEND AUTOMATED INTEGRATION TESTS")
    print("==========================================\n")
    
    # 1. Test Root Vital Endpoint
    print(" Testing Root Vitals Endpoint ('/')...")
    res_root = client.get("/")
    assert res_root.status_code == 200
    print(f"    [PASSED] Root Online Vitals: {res_root.json()['service']}\n")
    
    # 2. Test Auth Login Route
    print(" Testing Auth Login Route ('/api/auth/login')...")
    res_login = client.post("/api/auth/login", json={"email": "demo_hacker@sih.gov.in", "password": "securepassword123"})
    assert res_login.status_code == 200
    login_data = res_login.json()
    assert "token" in login_data
    assert login_data["tier"] == "Developer Pro"
    print(f"    [PASSED] Login Success. Authenticated User: {login_data['name']}, Tier: {login_data['tier']}\n")
    
    # 3. Test Dashboard Stats
    print(" Testing Dashboard Stats Endpoint ('/api/dashboard/stats')...")
    res_stats = client.get("/api/dashboard/stats")
    assert res_stats.status_code == 200
    stats_data = res_stats.json()
    assert "total_scans" in stats_data
    print(f"    [PASSED] Statistics Retrieval. Total Historical Scans Seeded: {stats_data['total_scans']}\n")
    
    # 4. Test Scan History Query
    print(" Testing Recent History List ('/api/dashboard/history')...")
    res_history = client.get("/api/dashboard/history?limit=5")
    assert res_history.status_code == 200
    history_data = res_history.json()
    assert len(history_data) > 0
    print(f"    [PASSED] Fetched {len(history_data)} scan history items successfully.\n")
    
    # 5. Test File Upload and Scan Prediction Pipeline
    print(" Testing AI Prediction Scan Pipeline ('/api/predict')...")
    
    # Generate a solid 256x256 RGB image dynamically in memory using PIL
    dummy_img = Image.new('RGB', (256, 256), color = (73, 109, 137))
    img_byte_arr = io.BytesIO()
    dummy_img.save(img_byte_arr, format='JPEG')
    img_bytes = img_byte_arr.getvalue()
    
    # Send image upload request
    res_predict = client.post(
        "/api/predict",
        files={"file": ("dummy_portrait.jpg", img_bytes, "image/jpeg")}
    )
    
    assert res_predict.status_code == 200
    pred_data = res_predict.json()
    assert "classification" in pred_data
    assert "confidence" in pred_data
    assert "forensic_risk_score" in pred_data
    assert "details" in pred_data
    
    print("    [PASSED] File Upload Successful!")
    print(f"             - Analyzed Filename: {pred_data['filename']}")
    print(f"             - Classification:    {pred_data['classification']}")
    print(f"             - Confidence:        {pred_data['confidence']}%")
    print(f"             - CV Risk Index:     {pred_data['forensic_risk_score']}/100")
    print(f"             - Processing Time:   {pred_data['processing_time']}s")
    print(f"             - Deep Inference:    {pred_data['details']['model_engine']['engine']}")
    print(f"             - FFT Anomaly:       {pred_data['details']['forensics']['fft']['score']}/100")
    print(f"             - ELA Defect Score:  {pred_data['details']['forensics']['ela']['score']}/100\n")
    
    print("==========================================")
    print(" ALL BACKEND TEST ROUTINES COMPLETED SUCCESSFULLY!")
    print("==========================================\n")

if __name__ == "__main__":
    test_forenzic_api()
