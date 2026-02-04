import requests

def verify_unidade_data():
    base_url = "http://127.0.0.1:8000/api"
    
    # 1. List Unidades to get an ID
    try:
        r = requests.get(f"{base_url}/unidades/")
        if r.status_code == 200:
            unidades = r.json()
            if not unidades:
                print("No Unidades found. Create one first.")
                return
            
            first_id = unidades[0]['id']
            print(f"Found Unidade ID: {first_id}")
            
            # 2. Get Unidade Details
            r_detail = requests.get(f"{base_url}/unidades/{first_id}/")
            print(f"Unidade Detail Status: {r_detail.status_code}")
            
            # 3. Get Bens for Unidade (Fallback route)
            r_bens = requests.get(f"{base_url}/bens/?unidade={first_id}")
            print(f"Bens (Fallback) Status: {r_bens.status_code}")
            if r_bens.status_code == 200:
                print(f"Bens Count: {len(r_bens.json()['results'] if 'results' in r_bens.json() else r_bens.json())}")
                
            # 4. Get Bens (Direct route - expect 404)
            r_direct = requests.get(f"{base_url}/unidades/{first_id}/bens/")
            print(f"Bens (Direct) Status: {r_direct.status_code} (Expected 404)")

        else:
            print(f"Failed to list unidades: {r.status_code}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    verify_unidade_data()
