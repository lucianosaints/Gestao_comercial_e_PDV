import requests
import json

def debug_create_cliente():
    url = "http://127.0.0.1:8000/api/clientes/"
    # Using a random CPF to avoid duplication
    import random
    cpf = f"{random.randint(100,999)}.{random.randint(100,999)}.{random.randint(100,999)}-{random.randint(10,99)}"
    
    data = {
        "nome": "Cliente Teste Debug",
        "cpf_cnpj": cpf,
        "telefone": "11999999999",
        "email": "teste@debug.com",
        "endereco": "Rua Debug, 123"
    }

    print(f"Tentando criar cliente com CPF: {cpf}")
    
    # We need authentication? Yes, IsAuthenticated is set in views.
    # I don't have a token easily available in python without logging in.
    # But I can check if I get 401 (Auth) vs 400 (Bad Request).
    
    # Actually, I can try to login first if I knew the credentials, but I don't.
    # However, I can check if the server responds at all.
    
    # NOTE: If we get 401, it confirms the server is up and routing works, 
    # but doesn't tell us about validation errors unless we authenticate.
    
    # Let's try to assume there might be a token in the frontend localStorage 
    # but I can't access that from here. 
    
    # I will try to create WITHOUT auth first to see the status code.
    try:
        r = requests.post(url, json=data)
        print(f"Status Code: {r.status_code}")
        print(f"Response: {r.text}")
        
    except Exception as e:
        print(f"Erro de conexão: {e}")

if __name__ == "__main__":
    debug_create_cliente()
