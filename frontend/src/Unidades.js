import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { 
  FaStore, FaMapMarkerAlt, FaPlus, FaArrowLeft, FaTrash, FaBuilding 
} from 'react-icons/fa';

// Não dependemos mais do CSS para o layout principal (evita erros de sobreposição)
// import './Unidades.css'; 

function Unidades() {
  const [unidades, setUnidades] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  useEffect(() => {
    carregarUnidades();
  }, []);

  const carregarUnidades = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/unidades/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnidades(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar unidades", error);
      setLoading(false);
    }
  };

  const deletarUnidade = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta loja?")) {
        const token = localStorage.getItem('access_token');
        try {
            await axios.delete(`http://127.0.0.1:8000/api/unidades/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            carregarUnidades();
        } catch (error) {
            alert("Erro ao excluir. Verifique se existem produtos vinculados.");
        }
    }
  };

  // --- ESTILOS DE LAYOUT (A CORREÇÃO DEFINITIVA) ---
  const s = {
      container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' },
      mainContent: {
          flex: 1,
          marginLeft: isSidebarCollapsed ? '80px' : '260px', // AQUI GARANTE QUE O MENU NÃO COBRE
          padding: '30px',
          transition: 'margin-left 0.3s ease',
          overflowX: 'hidden'
      },
      header: {
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px',
          background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
      },
      tableContainer: {
          background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
      },
      // Estilos visuais para a tabela ficar bonita sem CSS externo
      th: { padding: '15px', textAlign: 'left', fontSize: '13px', color: '#6b7280', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' },
      td: { padding: '15px', borderBottom: '1px solid #f3f4f6', color: '#374151' },
      iconBox: {
          width: '35px', height: '35px', borderRadius: '6px', background: '#ecfdf5',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginRight: '10px'
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
                  <FaStore style={{color:'#10b981'}}/> Lojas & Filiais
              </h1>
              <p style={{margin:'5px 0 0', color:'#6b7280'}}>Gerencie seus pontos de venda.</p>
            </div>
            
            <div style={{display:'flex', gap:'10px'}}>
                <button onClick={() => navigate('/dashboard')} style={{
                    background: 'white', color: '#64748b', border: '1px solid #cbd5e1', padding: '10px 15px', 
                    borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                }}>
                    <FaArrowLeft /> Voltar
                </button>
                <button onClick={() => navigate('/add-unidade')} style={{
                    background: '#10b981', color: 'white', border: 'none', padding: '10px 15px', 
                    borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold'
                }}>
                    <FaPlus /> Nova Loja
                </button>
            </div>
        </div>

        {/* TABELA */}
        <div style={s.tableContainer}>
            {unidades.length === 0 && !loading ? (
                <div style={{padding:'40px', textAlign:'center', color:'#94a3b8'}}>
                    <FaBuilding size={40} style={{opacity:0.2, marginBottom:'10px'}}/>
                    <p>Nenhuma loja cadastrada ainda.</p>
                </div>
            ) : (
                <table style={{width:'100%', borderCollapse:'collapse'}}>
                    <thead>
                        <tr>
                            <th style={{...s.th, width:'80px'}}>ID</th>
                            <th style={s.th}>NOME DA LOJA</th>
                            <th style={s.th}>ENDEREÇO</th>
                            <th style={{...s.th, textAlign:'right'}}>AÇÕES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {unidades.map(unidade => (
                            <tr key={unidade.id}>
                                <td style={s.td}>
                                    <span style={{background:'#f1f5f9', padding:'2px 8px', borderRadius:'4px', fontSize:'12px', color:'#64748b', fontWeight:'bold'}}>
                                        #{unidade.id}
                                    </span>
                                </td>
                                <td style={{...s.td, fontWeight:'bold', display:'flex', alignItems:'center'}}>
                                    <div style={s.iconBox}><FaStore /></div>
                                    {unidade.nome}
                                </td>
                                <td style={s.td}>
                                    <div style={{display:'flex', alignItems:'center', gap:'5px', color:'#4b5563'}}>
                                        <FaMapMarkerAlt color="#ef4444" />
                                        {unidade.endereco || <span style={{color:'#cbd5e1', fontStyle:'italic'}}>Não informado</span>}
                                    </div>
                                </td>
                                <td style={{...s.td, textAlign:'right'}}>
                                    <button 
                                        onClick={() => navigate(`/unidades/${unidade.id}`)}
                                        title="Ver Estoque"
                                        style={{marginRight:'10px', background:'#eff6ff', color:'#3b82f6', border:'none', padding:'8px', borderRadius:'6px', cursor:'pointer'}}
                                    >
                                        <FaBuilding />
                                    </button>

                                    <button 
                                        onClick={() => deletarUnidade(unidade.id)}
                                        title="Excluir Loja"
                                        style={{background:'#fee2e2', color:'#ef4444', border:'none', padding:'8px', borderRadius:'6px', cursor:'pointer'}}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>

      </main>
    </div>
  );
}

export default Unidades;