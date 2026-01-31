import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaTags, FaSave, FaArrowLeft } from 'react-icons/fa';

function AddCategoria() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  // Estado para controlar se o menu está aberto ou fechado
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    
    try {
      await axios.post('http://127.0.0.1:8000/api/categorias/', 
        { nome: nome }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Categoria cadastrada com sucesso!');
      navigate('/categorias');
    } catch (error) {
      console.error("Erro ao salvar categoria", error);
      alert('Erro ao salvar. Verifique se o nome já existe.');
    }
  };

  // --- ESTILOS DE LAYOUT (A CORREÇÃO PARA O MENU NÃO COBRIR) ---
  const s = {
      container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' },
      mainContent: {
          flex: 1,
          // Essa margem empurra o formulário para a direita
          marginLeft: isSidebarCollapsed ? '80px' : '260px', 
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
      {/* Menu Lateral */}
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      
      {/* Conteúdo Principal */}
      <main style={s.mainContent}>
        
        {/* CABEÇALHO */}
        <div style={s.header}>
            <div>
                 <h1 style={{margin:0, color:'#1f2937', display:'flex', alignItems:'center', gap:'10px'}}>
                    <FaTags style={{color:'#3b82f6'}}/> Nova Categoria
                 </h1>
                 <p style={{margin:'5px 0 0', color:'#6b7280'}}>Crie um novo departamento para organizar seus produtos.</p>
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
                    placeholder="Ex: BEBIDAS, ELETRÔNICOS, JOGOS..." 
                    value={nome} 
                    onChange={(e) => setNome(e.target.value)} 
                    required 
                    style={s.input}
                />

                <div style={{display:'flex', justifyContent:'flex-end'}}>
                    <button type="submit" style={{
                        background: '#3b82f6', color: 'white', border: 'none', padding: '12px 25px', 
                        borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', 
                        display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                        <FaSave /> Salvar Categoria
                    </button>
                </div>
            </form>
        </div>

      </main>
    </div>
  );
}

export default AddCategoria;