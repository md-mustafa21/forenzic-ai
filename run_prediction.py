import requests, pathlib, json, sys
img_path = r'test_image.jpg'
if not pathlib.Path(img_path).exists():
    print('Image not found', img_path)
    sys.exit(1)
with open(img_path, 'rb') as f:
    files = {'file': f}
    resp = requests.post('http://127.0.0.1:8001/api/predict', files=files)
    try:
        print(json.dumps(resp.json(), indent=2))
    except Exception as e:
        print('Error parsing response', e)
