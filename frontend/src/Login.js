import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; 

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/token/', {
        username: username,
        password: password
      });

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      navigate('/dashboard');
      
    } catch (err) {
      console.error("Erro no login:", err);
      if (err.response && err.response.status === 401) {
        setError('Usuário ou senha incorretos.');
      } else {
        setError('Erro ao conectar com o servidor. Verifique se o Django está rodando.');
      }
    }
  };

  return (
    <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '0 20px' }}>
      <div className="login-box" style={{ padding: '25px', width: '100%', maxWidth: '380px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        
        {/* 1. LOGO AUMENTADA AQUI 👇 */}
        <div style={{ textAlign: 'center' }}>
            <img 
                src="/brasao-marica.png" 
                alt="Logo do Sistema" 
                className="login-logo" 
                style={{ height: '150px', width: 'auto', marginBottom: '15px' }} // Aumentei para 150px e a margem
            />
        </div>
        
        <h1 style={{ marginTop: '5px', fontSize: '22px', textAlign: 'center', color: '#333' }}>Sistema de Vendas</h1>
        <h2 style={{ fontSize: '14px', fontWeight: 'normal', color: '#666', marginBottom: '15px', textAlign: 'center' }}>
            Controle de Estoque & PDV
        </h2>
        
        {error && <div className="error-message" style={{ marginBottom: '15px', color: 'red', textAlign: 'center', fontSize: '14px' }}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: 'bold', color: '#444' }}>Usuário</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu usuário"
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px', fontWeight: 'bold', color: '#444' }}>Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-login"
            style={{ 
                width: '100%',           
                marginTop: '5px',      
                padding: '12px',         
                boxSizing: 'border-box', 
                fontSize: '16px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
            }}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;