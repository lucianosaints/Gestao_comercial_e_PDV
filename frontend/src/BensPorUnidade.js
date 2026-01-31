import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaArrowLeft, FaBarcode, FaCheckCircle, FaStore, FaExclamationTriangle } from 'react-icons/fa';

function BensPorUnidade() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [bens, setBens] = useState([]);
  const [unidadeNome, setUnidadeNome] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
  const [erro, setErro] = useState(null);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const carregarDados = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    try {
      setErro(null);
      // 1. Busca o nome da unidade para o título
      const resUnidade = await axios.get(`http://127.0.0.1:8000/api/unidades/${id}/`, config);
      setUnidadeNome(resUnidade.data.nome);

      // 2. Busca os produtos. Tente a rota 1, se falhar, tente a rota 2 (filtro query)
      try {
        const resBens = await axios.get(`http://127.0.0.1:8000/api/unidades/${id}/bens/`, config);
        setBens(resBens.data);
      } catch (e) {
        // Rota alternativa comum em Django Rest Framework
        const resBensAlt = await axios.get(`http://127.0.0.1:8000/api/bens/?unidade=${id}`, config);
        setBens(resBensAlt.data);
      }
    } catch (error) {
      console.error("Erro ao carregar estoque:", error);
      setErro("Não foi possível carregar os dados desta unidade.");
    }
  }, [id]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const s = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' },
    mainContent: {
      flex: 1,
      marginLeft: isSidebarCollapsed ? '80px' : '260px', // Correção de sobreposição
      padding: '30px',
      transition: 'margin-left 0.3s ease'
    }
  };

  return (
    <div style={s.container}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      <main style={s.mainContent}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ margin: 0 }}>{unidadeNome || "SAKURA PRESENTES"}</h1>
          <button onClick={() => navigate('/unidades')} style={{ cursor: 'pointer', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #ddd' }}>
            <FaArrowLeft /> Voltar
          </button>
        </div>

        {erro ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#fee2e2', borderRadius: '12px', color: '#dc2626' }}>
            <FaExclamationTriangle size={30} />
            <p>{erro}</p>
            <button onClick={carregarDados} style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}>Tentar Novamente</button>
          </div>
        ) : (
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f3f4f6', color: '#64748b' }}>
                  <th style={{ padding: '15px' }}>Código</th>
                  <th>Qtd.</th>
                  <th>Valor Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bens.length > 0 ? bens.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '15px' }}>
                        <div style={{fontWeight: 'bold', color: '#1f2937'}}>{item.nome}</div>
                        <div style={{fontSize: '12px', color: '#94a3b8'}}><FaBarcode /> {item.codigo_barras || '-'}</div>
                    </td>
                    <td style={{ fontWeight: 'bold' }}>{item.quantidade}</td>
                    <td style={{ color: '#059669', fontWeight: 'bold' }}>R$ {(item.valor * item.quantidade).toFixed(2)}</td>
                    <td><span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>DISPONÍVEL</span></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      Nenhum item encontrado nesta unidade.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default BensPorUnidade;