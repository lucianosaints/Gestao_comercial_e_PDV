import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaPlus, FaSearch, FaEdit } from 'react-icons/fa';
import './Dashboard.css';

function Bens() {
  const navigate = useNavigate();
  const [bens, setBens] = useState([]);
  const [busca, setBusca] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    axios.get('http://127.0.0.1:8000/api/bens/', config)
      .then(res => setBens(res.data))
      .catch(err => console.error(err));
  }, []);

  const bensFiltrados = bens.filter(b => 
    b.nome.toLowerCase().includes(busca.toLowerCase()) || 
    b.patrimonio?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className={`dashboard-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <main className="content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h1>Patrimônio</h1>
          <button className="btn-barcode" onClick={() => navigate('/bens/novo')}><FaPlus /> NOVO BEM</button>
        </div>
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <FaSearch style={{ position: 'absolute', left: '15px', top: '15px', color: '#888' }} />
          <input 
            type="text" placeholder="Buscar por nome ou patrimônio..." 
            className="form-group" style={{ width: '100%', paddingLeft: '45px', marginBottom: '0' }}
            value={busca} onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="recent-table">
          <table>
            <thead>
              <tr>
                <th>Patrimônio</th>
                <th>Nome</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {bensFiltrados.map(bem => (
                <tr key={bem.id}>
                  <td><strong>{bem.patrimonio}</strong></td>
                  <td>{bem.nome}</td>
                  <td><span className={bem.data_baixa ? 'status-baixa' : 'status-ativo'}>{bem.data_baixa ? 'BAIXADO' : 'ATIVO'}</span></td>
                  <td><button onClick={() => navigate(`/bens/editar/${bem.id}`)} style={{ border: 'none', background: 'none', color: '#3b82f6', cursor: 'pointer' }}><FaEdit /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
export default Bens;