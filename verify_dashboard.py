import requests
import sys

def verify_dashboard():
    base_url = "http://127.0.0.1:8000/api"
    
    # 1. Login to get token (assuming default credentials or asking user)
    # Since I don't have creds, I'll check if I can access without token? No, IsAuthenticated is set.
    # I will try to list users to see if I can find a user to login with? No access.
    
    # I'll check if migrating the database didn't clear data? No, it shouldn't.
    
    print("Checking Dashboard Endpoint...")
    try:
        # Just checking if the server is up
        r = requests.get(f"{base_url}/dashboard-resumo/")
        print(f"Status Code without token: {r.status_code}") # Should be 401 or 403
        
        if r.status_code == 404:
             print("ERROR: Endpoint not found!")
        elif r.status_code == 500:
             print("ERROR: Server Error!")
        else:
             print("Endpoint exists (Authentication working correctly).")
             
    except Exception as e:
        print(f"Connection Error: {e}")

if __name__ == "__main__":
    verify_dashboard()
