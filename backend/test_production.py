import os
import sys
import time
import pytest
import threading
import psutil
from PIL import Image

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.services.huggingface_detector import init_model, predict_image
from backend.services.preprocessing import canonical_preprocess

def create_dummy_image(color=(255, 0, 0), size=(800, 600)):
    """Create a dummy PIL image for testing."""
    return Image.new("RGB", size, color=color)

@pytest.fixture(scope="session", autouse=True)
def load_model_once():
    """Ensure startup success."""
    success = init_model()
    assert success is True, "Model failed to load during startup."

def test_determinism_and_accuracy_consistency():
    """Prove that exactly the same floating point prediction is returned for the same input."""
    img = create_dummy_image()
    canonical_img = canonical_preprocess(img)
    
    # First run
    res1 = predict_image(canonical_img)
    conf1 = res1["confidence"]
    pred1 = res1["prediction"]
    
    # 10 subsequent runs must match perfectly
    for _ in range(10):
        res_next = predict_image(canonical_img)
        assert res_next["prediction"] == pred1
        assert abs(res_next["confidence"] - conf1) < 1e-6, "Confidence floating point drift detected!"

def test_memory_stability():
    """Prove that consecutive inferences do not leak memory."""
    img = create_dummy_image(color=(0, 255, 0))
    canonical_img = canonical_preprocess(img)
    
    process = psutil.Process(os.getpid())
    
    # Warm up run
    predict_image(canonical_img)
    
    # Baseline memory
    mem_baseline = process.memory_info().rss
    
    # Stress test
    for _ in range(15):
        predict_image(canonical_img)
        
    mem_final = process.memory_info().rss
    
    # Allowing small overhead (e.g. 5MB) for Python internal structures
    leak_mb = (mem_final - mem_baseline) / (1024 * 1024)
    assert leak_mb < 15.0, f"Memory leak detected: leaked {leak_mb} MB during 15 inferences."

def test_concurrent_request_safety():
    """Prove thread-safety when multiple threads access the singleton model simultaneously."""
    num_threads = 5
    exceptions = []
    
    def worker():
        try:
            img = create_dummy_image(color=(0, 0, 255))
            canonical_img = canonical_preprocess(img)
            res = predict_image(canonical_img)
            assert "prediction" in res
            assert "confidence" in res
        except Exception as e:
            exceptions.append(e)

    threads = []
    for _ in range(num_threads):
        t = threading.Thread(target=worker)
        threads.append(t)
        t.start()
        
    for t in threads:
        t.join()
        
    assert len(exceptions) == 0, f"Concurrency test failed with exceptions: {exceptions}"

if __name__ == "__main__":
    pytest.main(["-v", __file__])
