import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaLayerGroup, FaPlus, FaEdit, FaTrash, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import API_BASE_URL from './config';

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  // --- BUSCA DE DADOS (COM PROTEÇÃO CONTRA ERRO DE ROTA) ---
  const carregarCategorias = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    try {
      setLoading(true);
      // Tentativa 1: Rota no plural (Padrão)
      const response = await axios.get(`${API_BASE_URL}/api/categorias/`, config);
      setCategorias(response.data);
    } catch (error) {
      console.warn("Rota plural falhou, tentando singular...", error);
      try {
        // Tentativa 2: Rota no singular (Caso o backend esteja diferente)
        const responseAlt = await axios.get(`${API_BASE_URL}/api/categoria/`, config);
        setCategorias(responseAlt.data);
      } catch (errAlt) {
        console.error("Erro total ao carregar categorias.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarCategorias();
  }, [carregarCategorias]);

  const deletarCategoria = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta categoria?")) {
        const token = localStorage.getItem('access_token');
        try {
            await axios.delete(`${API_BASE_URL}/api/categorias/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            carregarCategorias(); // Recarrega a lista
        } catch (error) {
            alert("Erro ao excluir. Verifique se existem produtos vinculados.");
        }
    }
  };

  // --- ESTILOS DE LAYOUT (A CORREÇÃO VISUAL) ---
  const s = {
      container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' },
      mainContent: {
          flex: 1,
          // AQUI ESTÁ A MÁGICA: Empurra o conteúdo para não ficar embaixo do menu
          marginLeft: isSidebarCollapsed ? '80px' : '260px', 
          padding: '30px',
          transition: 'margin-left 0.3s ease',
          overflowX: 'hidden'
      },
      header: {
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px',
          background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
      },
      card: {
          background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
      }
  };

  return (
    <div style={s.container}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      
      <main style={s.mainContent}>
        
        {/* CABEÇALHO */}
        <div style={s.header}>
            <div>
                 <h1 style={{margin:0, color:'#1f2937', display:'flex', alignItems:'center', gap:'10px', fontSize:'24px'}}>
                    <FaLayerGroup style={{color:'#2563eb'}}/> Categorias
                 </h1>
                 <p style={{margin:'5px 0 0', color:'#6b7280'}}>Gerencie os departamentos da loja.</p>
            </div>
            <div style={{display:'flex', gap:'10px'}}>
                <button onClick={() => navigate('/dashboard')} style={{background:'white', border:'1px solid #d1d5db', color:'#374151', padding:'10px 15px', borderRadius:'8px', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px'}}>
                    <FaArrowLeft /> Voltar
                </button>
                <button onClick={() => navigate('/add-categoria')} style={{background:'#2563eb', color:'white', border:'none', padding:'10px 15px', borderRadius:'8px', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', fontWeight:'bold'}}>
                    <FaPlus /> Nova Categoria
                </button>
            </div>
        </div>

        {/* LISTAGEM */}
        <div style={s.card}>
            {loading ? (
                <div style={{padding:'50px', textAlign:'center', color:'#6b7280'}}>
                    <FaSpinner className="spinner" size={30} />
                    <p>Carregando departamentos...</p>
                </div>
            ) : categorias.length === 0 ? (
                <div style={{padding:'50px', textAlign:'center', color:'#9ca3af'}}>
                    <p>Nenhum departamento encontrado.</p>
                </div>
            ) : (
                <table style={{width:'100%', borderCollapse:'collapse'}}>
                    <thead style={{background:'#f9fafb', borderBottom:'1px solid #e5e7eb'}}>
                        <tr>
                            <th style={{padding:'15px', textAlign:'left', color:'#6b7280', fontSize:'13px'}}>NOME DO DEPARTAMENTO</th>
                            <th style={{padding:'15px', textAlign:'right', color:'#6b7280', fontSize:'13px'}}>AÇÕES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categorias.map(cat => (
                            <tr key={cat.id} style={{borderBottom:'1px solid #f3f4f6'}}>
                                <td style={{padding:'15px', fontWeight:'bold', color:'#374151', textTransform:'uppercase'}}>
                                    {cat.nome}
                                </td>
                                <td style={{padding:'15px', textAlign:'right'}}>
                                    <button onClick={() => navigate(`/categorias/${cat.id}`)} style={{marginRight:'15px', background:'none', border:'none', cursor:'pointer', color:'#f59e0b'}} title="Editar">
                                        <FaEdit size={18}/>
                                    </button>
                                    <button onClick={() => deletarCategoria(cat.id)} style={{background:'none', border:'none', cursor:'pointer', color:'#ef4444'}} title="Excluir">
                                        <FaTrash size={18}/>
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

export default Categorias;