import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaWarehouse, FaArrowLeft, FaPlus } from 'react-icons/fa';
import API_BASE_URL from './config';

function LocaisPorUnidade() {
  const { id } = useParams(); // Pega o ID da Loja da URL
  const navigate = useNavigate();
  const [locais, setLocais] = useState([]);
  const [unidade, setUnidade] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Busca os dados da Unidade e os Locais filtrados por ela
    Promise.all([
      axios.get(`${API_BASE_URL}/api/unidades/${id}/`, config),
      axios.get(`${API_BASE_URL}/api/salas/?unidade=${id}`, config)
    ]).then(([resUnidade, resLocais]) => {
      setUnidade(resUnidade.data);
      setLocais(resLocais.data);
    }).catch(err => console.error(err));
  }, [id]);

  return (
    <div className={`dashboard-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      
      <main className="content">
        <div className="page-header" style={{ marginBottom: '30px' }}>
          <button onClick={() => navigate('/unidades')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#666' }}>
            <FaArrowLeft /> Voltar para Lojas
          </button>
          <h1 style={{ marginTop: '10px' }}>
            <FaWarehouse /> Locais de Estoque: <span style={{ color: '#2563eb' }}>{unidade?.nome}</span>
          </h1>
        </div>

        <div className="salas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {locais.map(local => (
            <div key={local.id} className="sala-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #edf2f7' }}>
              <h3>{local.nome}</h3>
              <button 
                onClick={() => navigate(`/salas/${local.id}/bens`)}
                style={{ width: '100%', marginTop: '15px', padding: '10px', borderRadius: '6px', border: '1px solid #2563eb', color: '#2563eb', background: 'white', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Ver Produtos deste Local
              </button>
            </div>
          ))}
          
          {/* Card para adicionar novo local direto nesta loja */}
          <div 
            onClick={() => navigate('/add-sala')}
            style={{ border: '2px dashed #cbd5e0', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#a0aec0', minHeight: '150px' }}
          >
            <FaPlus size={24} />
            <span>Novo Local nesta Loja</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LocaisPorUnidade;