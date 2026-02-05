import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from './config';
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
      // 1. FAZ O LOGIN E PEGA O TOKEN
      const response = await axios.post(`${API_BASE_URL}/api/token/`, {
        username: username, // O backend espera 'username', que no seu caso é o CPF
        password: password
      });

      const token = response.data.access;
      localStorage.setItem('access_token', token);
      localStorage.setItem('refresh_token', response.data.refresh);

      // 2. (IMPORTANTE) BUSCA O CARGO DO USUÁRIO PARA O MENU FUNCIONAR
      try {
        const userResponse = await axios.get(`${API_BASE_URL}/api/usuario-atual/`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Salva o cargo e o nome para a Sidebar usar
        localStorage.setItem('user_role', userResponse.data.cargo);
        localStorage.setItem('user_name', userResponse.data.nome);

      } catch (err) {
        console.warn("Não foi possível buscar detalhes do cargo. Assumindo Gerente.");
        localStorage.setItem('user_role', 'gerente');
      }

      // 3. Redireciona
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
    <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '0 20px', backgroundColor: '#f0f2f5' }}>
      <div className="login-box" style={{ padding: '30px', width: '100%', maxWidth: '380px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>

        {/* LOGO */}
        <div style={{ textAlign: 'center' }}>
          <img
            src="/brasao-marica.png"
            alt="Logo do Sistema"
            className="login-logo"
            style={{ height: '120px', width: 'auto', marginBottom: '10px' }}
          />
        </div>

        <h1 style={{ marginTop: '5px', fontSize: '22px', textAlign: 'center', color: '#1e293b', fontWeight: 'bold' }}>Sistema de Vendas</h1>
        <h2 style={{ fontSize: '14px', fontWeight: 'normal', color: '#64748b', marginBottom: '25px', textAlign: 'center' }}>
          Controle de Estoque & PDV
        </h2>

        {error && <div className="error-message" style={{ marginBottom: '15px', color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '6px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: '600', color: '#334155' }}>CPF (Usuário)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu CPF"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: '600', color: '#334155' }}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }}
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
              background: '#2563eb', // Azul mais moderno
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background 0.2s'
            }}
          >
            Entrar no Sistema
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;