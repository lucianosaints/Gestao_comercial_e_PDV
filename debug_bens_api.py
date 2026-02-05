import requests

try:
    # URL might need a sala ID, checking without first, then with a dummy ID if needed
    url = "http://127.0.0.1:8000/api/bens/"
    print(f"Fetching {url}")
    response = requests.get(url) 
    print(f"Status: {response.status_code}")
    print(f"Response Type: {type(response.json())}")
    print(f"Response Content: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
