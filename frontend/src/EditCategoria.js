import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaTags, FaSave, FaArrowLeft, FaTrash } from 'react-icons/fa';

function EditCategoria() {
  const { id } = useParams(); // Pega o ID da URL
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  useEffect(() => {
    carregarCategoria();
  }, [id]);

  const carregarCategoria = async () => {
    const token = localStorage.getItem('access_token');
    try {
      // Busca os dados da categoria específica
      const response = await axios.get(`http://127.0.0.1:8000/api/categorias/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNome(response.data.nome);
    } catch (error) {
      console.error("Erro ao carregar categoria:", error);
      alert("Erro ao buscar dados. Verifique o console.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    
    try {
      await axios.put(`http://127.0.0.1:8000/api/categorias/${id}/`, 
        { nome: nome }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Categoria atualizada com sucesso!');
      navigate('/categorias');
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert('Erro ao salvar alterações.');
    }
  };

  // --- ESTILOS DE LAYOUT (CORREÇÃO DE MARGEM) ---
  const s = {
      container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' },
      mainContent: {
          flex: 1,
          marginLeft: isSidebarCollapsed ? '80px' : '260px', // MARGEM DINÂMICA
          padding: '30px',
          transition: 'margin-left 0.3s ease',
          overflowX: 'hidden'
      },
      header: {
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px',
          background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
      },
      formCard: {
          background: 'white', padding: '30px', borderRadius: '12px', 
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)', maxWidth: '600px'
      },
      label: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' },
      input: {
          width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', 
          fontSize: '16px', outline: 'none', marginBottom: '20px'
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
                    <FaTags style={{color:'#f59e0b'}}/> Editar Categoria
                 </h1>
                 <p style={{margin:'5px 0 0', color:'#6b7280'}}>Altere o nome do departamento.</p>
            </div>
            <button onClick={() => navigate('/categorias')} style={{
                background: 'white', color: '#64748b', border: '1px solid #cbd5e1', padding: '10px 15px', 
                borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
            }}>
                <FaArrowLeft /> Voltar
            </button>
        </div>

        {/* FORMULÁRIO */}
        <div style={s.formCard}>
            <form onSubmit={handleSubmit}>
                <label style={s.label}>Nome do Departamento / Categoria</label>
                <input 
                    type="text" 
                    value={nome} 
                    onChange={(e) => setNome(e.target.value)} 
                    required 
                    style={s.input}
                />

                <div style={{display:'flex', justifyContent:'flex-end'}}>
                    <button type="submit" style={{
                        background: '#f59e0b', color: 'white', border: 'none', padding: '12px 25px', 
                        borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', 
                        display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                        <FaSave /> Salvar Alterações
                    </button>
                </div>
            </form>
        </div>

      </main>
    </div>
  );
}

export default EditCategoria;