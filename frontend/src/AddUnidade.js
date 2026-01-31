import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar'; // Verifique se o caminho está ./Sidebar ou ./components/Sidebar
import { FaStore, FaSave, FaArrowLeft } from 'react-icons/fa';

function AddUnidade() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  // Estados do Formulário
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    
    try {
      await axios.post('http://127.0.0.1:8000/api/unidades/', 
        { nome, endereco }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Nova Loja cadastrada com sucesso!');
      navigate('/unidades'); // Volta para a lista de lojas
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar loja. Verifique os dados.');
    }
  };

  // --- ESTILOS ---
  const s = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' },
    main: { 
      flex: 1, 
      marginLeft: isSidebarCollapsed ? '80px' : '260px', 
      padding: '30px', 
      transition: 'margin-left 0.3s ease' 
    },
    card: {
      backgroundColor: 'white', padding: '30px', borderRadius: '12px', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '600px', margin: '0 auto'
    },
    label: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151', fontSize: '14px' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '20px', fontSize:'15px' }
  };

  return (
    <div style={s.container}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      
      <main style={s.main}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', maxWidth:'600px', margin:'0 auto 25px auto' }}>
            <h1 style={{margin: 0, color:'#1f2937', display:'flex', alignItems:'center', gap:'10px'}}>
                <FaStore style={{color:'#2563eb'}}/> Nova Loja / Filial
            </h1>
            <button onClick={() => navigate('/unidades')} style={{background: '#6b7280', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <FaArrowLeft /> Voltar
            </button>
        </div>

        <form onSubmit={handleSubmit} style={s.card}>
            <label style={s.label}>Nome da Loja</label>
            <input 
                type="text" 
                required 
                value={nome} 
                onChange={e => setNome(e.target.value)} 
                placeholder="Ex: Matriz, Filial Centro..."
                style={s.input}
            />

            <label style={s.label}>Endereço</label>
            <input 
                type="text" 
                value={endereco} 
                onChange={e => setEndereco(e.target.value)} 
                placeholder="Rua, Número, Bairro..."
                style={s.input}
            />

            <div style={{marginTop:'10px', display:'flex', justifyContent:'flex-end'}}>
                <button type="submit" style={{background: '#2563eb', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <FaSave /> Salvar Loja
                </button>
            </div>
        </form>
      </main>
    </div>
  );
}

export default AddUnidade;