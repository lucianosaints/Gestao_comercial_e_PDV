import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import HistoricoModal from './HistoricoModal';
import './Dashboard.css';
import { FaEdit, FaTrash, FaPlus, FaHistory, FaSearch, FaBox, FaArrowLeft, FaBarcode, FaTag } from 'react-icons/fa';

function Bens() {
  const navigate = useNavigate();
  const [bens, setBens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [showHistorico, setShowHistorico] = useState(false);
  const [historicoSelecionado, setHistoricoSelecionado] = useState([]);
  const [bemSelecionadoNome, setBemSelecionadoNome] = useState('');
  
  useEffect(() => {
    fetchBens();
  }, []);

  const fetchBens = async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/bens/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBens(response.data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este produto do estoque?")) {
      const token = localStorage.getItem('access_token');
      try {
        await axios.delete(`http://127.0.0.1:8000/api/bens/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchBens();
      } catch (error) {
        alert("Erro ao excluir produto.");
      }
    }
  };

  const handleVerHistorico = async (bem) => {
    setBemSelecionadoNome(bem.nome);
    if (bem.historico) {
        setHistoricoSelecionado(bem.historico);
        setShowHistorico(true);
    } else {
        const token = localStorage.getItem('access_token');
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/bens/${bem.id}/historico/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistoricoSelecionado(res.data);
            setShowHistorico(true);
        } catch (error) {
            alert("Erro ao carregar histórico.");
        }
    }
  };

  const filteredBens = bens.filter(bem => 
    bem.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bem.tombo && bem.tombo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // --- ESTILOS DE LAYOUT (GARANTIA DE NÃO QUEBRAR) ---
  const s = {
      container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' },
      mainContent: {
          flex: 1,
          marginLeft: isSidebarCollapsed ? '80px' : '260px', // AQUI É A CHAVE
          padding: '30px',
          transition: 'margin-left 0.3s ease',
          overflowX: 'hidden'
      }
  };

  return (
    <div style={s.container}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      
      <main style={s.mainContent}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{margin: 0, color:'#1f2937'}}>Gerenciar Produtos</h1>
            <p style={{color:'#6b7280'}}>Controle geral de estoque e preços.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 15px', borderRadius: '5px', backgroundColor: '#6c757d', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaArrowLeft /> Voltar
            </button>
            <button onClick={() => navigate('/add-bem')} style={{ padding: '10px 15px', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaPlus /> Novo Produto
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
            <FaSearch style={{ color: '#007bff', marginRight: '10px' }} />
            <input 
                type="text" 
                placeholder="Buscar por nome ou Código de Barras (SKU)..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '16px', color: '#333' }} 
            />
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {loading ? <p style={{padding:'20px'}}>Carregando estoque...</p> : filteredBens.length === 0 ? <p style={{padding:'20px', color: '#666', fontStyle: 'italic'}}>Nenhum produto encontrado.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #007bff', textAlign: 'left', backgroundColor: '#f8f9fa', color: '#333' }}>
                  <th style={{ padding: '15px' }}><FaBarcode /> Cód. Barras</th>
                  <th style={{ padding: '15px' }}><FaBox /> Produto</th>
                  <th style={{ padding: '15px' }}>Loja / Estoque</th>
                  <th style={{ padding: '15px' }}><FaTag /> Preço / Status</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredBens.map((bem) => (
                  <tr key={bem.id} style={{ borderBottom: '1px solid #eee' }}>
                    
                    <td style={{ padding: '15px', fontFamily: 'monospace', fontWeight: 'bold', color: '#555' }}>
                        {bem.tombo || '---'}
                    </td>

                    <td style={{ padding: '15px', fontWeight: '500' }}>
                        {bem.nome}
                    </td>

                    <td style={{ padding: '15px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{bem.unidade_nome}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>📍 {bem.sala_nome || 'Estoque Geral'}</div>
                    </td>

                    <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: 'bold', color: '#374151' }}>
                            R$ {parseFloat(bem.valor).toFixed(2)}
                        </div>
                        
                        {bem.quantidade > 0 ? (
                            <span style={{ 
                                color: '#16a34a', fontWeight: 'bold', fontSize: '11px',
                                background: '#dcfce7', padding: '2px 8px', borderRadius: '4px',
                                display: 'inline-block', marginTop: '4px'
                            }}>
                                EM ESTOQUE ({bem.quantidade})
                            </span>
                        ) : (
                            <span style={{ 
                                color: '#dc2626', fontWeight: 'bold', fontSize: '11px',
                                background: '#fee2e2', padding: '2px 8px', borderRadius: '4px',
                                display: 'inline-block', marginTop: '4px'
                            }}>
                                ESGOTADO
                            </span>
                        )}
                    </td>

                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button onClick={() => handleVerHistorico(bem)} style={{ marginRight: '10px', background: '#e0f2fe', padding: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer', color: '#007bff' }} title="Histórico">
                        <FaHistory size={14} />
                      </button>
                      <button onClick={() => navigate(`/edit-bem/${bem.id}`)} style={{ marginRight: '10px', background: '#fef3c7', padding: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer', color: '#d97706' }} title="Editar">
                        <FaEdit size={14} />
                      </button>
                      <button onClick={() => handleDelete(bem.id)} style={{ background: '#fee2e2', padding: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer', color: '#dc2626' }} title="Excluir">
                        <FaTrash size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <HistoricoModal isOpen={showHistorico} onClose={() => setShowHistorico(false)} historico={historicoSelecionado} nomeBem={bemSelecionadoNome} />
      </main>
    </div>
  );
}

export default Bens;