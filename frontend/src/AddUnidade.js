import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaStore, FaSave, FaArrowLeft, FaBars } from 'react-icons/fa';
import './Unidades.css'; // Usando estilos premium
import API_BASE_URL from './config';

function AddUnidade() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  // Estados do Formulário
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');

    try {
      await axios.post(`${API_BASE_URL}/api/unidades/`,
        { nome, endereco },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Nova Loja cadastrada com sucesso!');
      navigate('/unidades');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar loja. Verifique os dados.');
    }
  };

  return (
    <div className="unidades-container">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />

      <main className="unidades-main" style={{ marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '80px' : '260px') }}>
        <div className="unidades-header" style={{ maxWidth: '600px', margin: '0 auto 30px auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {isMobile && <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}><FaBars /></button>}
            <h1 className="unidades-title" style={{ fontSize: '24px' }}>
              Nova Loja
            </h1>
          </div>
          <button onClick={() => navigate('/unidades')} className="btn-back">
            <FaArrowLeft /> Voltar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="unidade-form-card">
          <div className="form-group">
            <label>Nome da Loja</label>
            <input
              type="text"
              required
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Matriz, Filial Centro..."
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Endereço</label>
            <input
              type="text"
              value={endereco}
              onChange={e => setEndereco(e.target.value)}
              placeholder="Rua, Número, Bairro..."
              className="form-input"
            />
          </div>

          <button type="submit" className="btn-add-unidade" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
            <FaSave /> Salvar Loja
          </button>
        </form>
      </main>
    </div>
  );
}

export default AddUnidade;