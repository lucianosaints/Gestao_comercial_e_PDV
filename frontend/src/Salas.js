import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaWarehouse, FaPlus, FaBoxOpen, FaEdit, FaTrash, FaMapMarkerAlt, FaStore } from 'react-icons/fa';
import API_BASE_URL from './config';

function Salas() {
  const [salas, setSalas] = useState([]);
  const [unidades, setUnidades] = useState([]); // Vamos precisar da lista de lojas
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const token = localStorage.getItem('access_token');
    try {
      // Buscamos as SALAS e as UNIDADES ao mesmo tempo
      const [resSalas, resUnidades] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/salas/', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/unidades/', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setSalas(resSalas.data);
      setUnidades(resUnidades.data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
      setLoading(false);
    }
  };

  const deletarSala = async (id) => {
    if (window.confirm("Tem certeza? Os produtos ficarão sem local definido.")) {
      try {
        const token = localStorage.getItem('access_token');
        await axios.delete(`${API_BASE_URL}/api/salas/${id}/`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        carregarDados();
      } catch (error) {
        alert("Erro ao excluir local.");
      }
    }
  };

  // --- ESTILOS DE LAYOUT ---
  const s = {
      container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' },
      mainContent: {
          flex: 1,
          marginLeft: isSidebarCollapsed ? '80px' : '260px',
          padding: '30px',
          transition: 'margin-left 0.3s ease',
          overflowX: 'hidden'
      },
      header: {
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px',
          background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
      },
      
      // --- NOVO: Estilo do Container da Loja ---
      lojaContainer: {
          marginBottom: '30px',
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
      },
      lojaHeader: {
          background: '#1f2937',
          color: 'white',
          padding: '15px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
      },
      lojaContent: {
          padding: '20px'
      },

      grid: {
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px'
      },
      // Estilo do Card
      card: {
          background: '#f8fafc', borderRadius: '12px', padding: '20px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
      },
      cardHeader: {
          display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px'
      },
      iconBox: {
          width: '50px', height: '50px', borderRadius: '10px', background: '#e0f2fe',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', fontSize: '24px'
      },
      actions: {
          display: 'flex', justifyContent: 'space-between', paddingTop: '15px', borderTop: '1px solid #e2e8f0'
      }
  };

  return (
    <div style={s.container}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      
      <main style={s.mainContent}>
        
        {/* CABEÇALHO */}
        <div style={s.header}>
            <div>
              <h1 style={{margin:0, color:'#1f2937', display:'flex', alignItems:'center', gap:'10px'}}>
                  <FaWarehouse style={{color:'#2563eb'}}/> Locais de Estoque
              </h1>
              <p style={{margin:'5px 0 0', color:'#6b7280'}}>Organização física por Loja/Filial.</p>
            </div>
            <button onClick={() => navigate('/add-sala')} style={{
                background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', 
                borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'
            }}>
                <FaPlus /> Novo Local
            </button>
        </div>

        {/* LISTAGEM POR UNIDADE (LOJA) */}
        {loading ? (
            <p>Carregando...</p>
        ) : unidades.length > 0 ? (
            unidades.map(unidade => {
                
                // Filtra as salas que pertencem a esta unidade
                const salasDaLoja = salas.filter(sala => {
                    const idUnidadeSala = typeof sala.unidade === 'object' ? sala.unidade.id : sala.unidade;
                    return idUnidadeSala === unidade.id;
                });

                return (
                    <div key={unidade.id} style={s.lojaContainer}>
                        {/* Faixa Preta com Nome da Loja */}
                        <div style={s.lojaHeader}>
                            <FaStore size={18} />
                            <h2 style={{margin:0, fontSize:'18px', fontWeight:'600'}}>{unidade.nome}</h2>
                            <span style={{marginLeft:'auto', fontSize:'12px', background:'rgba(255,255,255,0.2)', padding:'4px 8px', borderRadius:'10px'}}>
                                {salasDaLoja.length} locais
                            </span>
                        </div>

                        {/* Grade de Salas desta Loja */}
                        <div style={s.lojaContent}>
                            {salasDaLoja.length > 0 ? (
                                <div style={s.grid}>
                                    {salasDaLoja.map(sala => (
                                        <div key={sala.id} style={s.card}>
                                            <div style={s.cardHeader}>
                                                <div style={s.iconBox}>
                                                    <FaMapMarkerAlt />
                                                </div>
                                                <div>
                                                    <h3 style={{margin:0, fontSize:'16px', color:'#374151'}}>{sala.nome}</h3>
                                                    <span style={{fontSize:'12px', color:'#64748b'}}>ID: {sala.id}</span>
                                                </div>
                                            </div>

                                            <div style={s.actions}>
                                                
                                                {/* --- MOSTRAR QUANTIDADE DE ITENS --- */}
                                                <button onClick={() => navigate(`/salas/${sala.id}/bens`)} style={{background:'none', border:'none', color:'#0ea5e9', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px', fontWeight:'bold', fontSize:'13px'}}>
                                                    <FaBoxOpen /> 
                                                    {/* Mostra '0' se não tiver nada, ou o número se tiver */}
                                                    {sala.qtd_itens || 0} Itens
                                                </button>

                                                <div style={{display:'flex', gap:'10px'}}>
                                                    <button onClick={() => navigate(`/salas/${sala.id}`)} style={{background:'#fef3c7', border:'none', color:'#d97706', cursor:'pointer', padding:'6px 10px', borderRadius:'6px', display:'flex', alignItems:'center', gap:'5px'}}>
                                                        <FaEdit />
                                                    </button>
                                                    <button onClick={() => deletarSala(sala.id)} style={{background:'#fee2e2', border:'none', color:'#ef4444', cursor:'pointer', padding:'6px 10px', borderRadius:'6px'}}>
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{textAlign:'center', color:'#9ca3af', fontStyle:'italic', margin:0}}>
                                    Nenhuma prateleira ou local cadastrado nesta loja.
                                </p>
                            )}
                        </div>
                    </div>
                );
            })
        ) : (
            <div style={{textAlign:'center', padding:'40px', color:'#6b7280'}}>
                Nenhuma loja encontrada. Cadastre unidades primeiro.
            </div>
        )}

      </main>
    </div>
  );
}

export default Salas;