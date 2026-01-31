import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaSave, FaArrowLeft, FaWarehouse, FaTrash, FaStore } from 'react-icons/fa';

function EditSala() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  // --- ESTADO DO MENU LATERAL (Isso corrige a tela torta) ---
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  // Estados de Dados
  const [unidades, setUnidades] = useState([]);
  const [nome, setNome] = useState('');
  const [unidadeId, setUnidadeId] = useState('');
  const [loading, setLoading] = useState(true);

  // Carregar Dados
  useEffect(() => {
    const carregarDados = async () => {
      const token = localStorage.getItem('access_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      try {
        // 1. Busca Lojas
        const resUnidades = await axios.get('http://127.0.0.1:8000/api/unidades/', config);
        setUnidades(resUnidades.data);

        // 2. Se for Edição, busca Sala
        if (id) {
            const resSala = await axios.get(`http://127.0.0.1:8000/api/salas/${id}/`, config);
            setNome(resSala.data.nome);
            const uId = typeof resSala.data.unidade === 'object' ? resSala.data.unidade.id : resSala.data.unidade;
            setUnidadeId(uId);
        } else {
            // Se for Novo, já deixa a primeira loja selecionada
            if (resUnidades.data.length > 0) setUnidadeId(resUnidades.data[0].id);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    carregarDados();
  }, [id]);

  // Salvar (Criar ou Editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const payload = { nome, unidade: unidadeId };

    try {
      if (id) {
        await axios.put(`http://127.0.0.1:8000/api/salas/${id}/`, payload, config);
        alert('Local atualizado!');
      } else {
        await axios.post('http://127.0.0.1:8000/api/salas/', payload, config);
        alert('Local criado com sucesso!');
      }
      navigate('/salas');
    } catch (err) {
      alert('Erro ao salvar. Verifique se selecionou a Loja.');
    }
  };

  const handleDelete = async () => {
      if(!window.confirm("Excluir este local?")) return;
      const token = localStorage.getItem('access_token');
      try {
          await axios.delete(`http://127.0.0.1:8000/api/salas/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
          navigate('/salas');
      } catch (error) { alert("Erro ao excluir."); }
  };

  // --- ESTILOS CORRIGIDOS ---
  const s = {
      container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' },
      mainContent: {
          flex: 1,
          // AQUI ESTÁ A CORREÇÃO:
          marginLeft: isSidebarCollapsed ? '80px' : '260px', 
          padding: '30px',
          transition: 'margin-left 0.3s ease',
          overflowX: 'hidden'
      },
      card: {
          backgroundColor: 'white', padding: '30px', borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '600px', margin: '0 auto'
      },
      label: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151', fontSize: '14px' },
      input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '20px' }
  };

  if(loading) return <div style={{padding:'50px', textAlign:'center', marginLeft: '260px'}}>Carregando...</div>;

  return (
    <div style={s.container}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      
      <main style={s.mainContent}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', maxWidth:'600px', margin:'0 auto 25px auto' }}>
            <h1 style={{margin: 0, color:'#1f2937', display:'flex', alignItems:'center', gap:'10px'}}>
                <FaWarehouse style={{color:'#3b82f6'}}/> {id ? 'Editar Local' : 'Novo Local'}
            </h1>
            <button onClick={() => navigate('/salas')} style={{background: '#6b7280', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <FaArrowLeft /> Voltar
            </button>
        </div>

        <form onSubmit={handleSubmit} style={s.card}>
            <label style={s.label}>Nome do Local</label>
            <input type="text" required value={nome} onChange={e => setNome(e.target.value)} style={s.input} placeholder="Ex: Prateleira A"/>

            <label style={s.label}><FaStore style={{marginRight:'5px'}}/> Loja / Unidade</label>
            <select required value={unidadeId} onChange={e => setUnidadeId(e.target.value)} style={s.input}>
                <option value="">Selecione...</option>
                {unidades.map(u => (
                    <option key={u.id} value={u.id}>{u.nome}</option>
                ))}
            </select>

            <div style={{marginTop:'10px', display:'flex', gap:'10px', justifyContent:'flex-end'}}>
                {id && (
                    <button type="button" onClick={handleDelete} style={{background: '#fee2e2', color: '#dc2626', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'}}>
                        <FaTrash /> Excluir
                    </button>
                )}
                <button type="submit" style={{background: '#2563eb', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <FaSave /> Salvar
                </button>
            </div>
        </form>
      </main>
    </div>
  );
}

export default EditSala;