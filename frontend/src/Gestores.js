import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import { FaUserTie, FaPlus, FaTrash, FaStore, FaIdCard, FaEnvelope } from 'react-icons/fa';

function Gestores() {
  const navigate = useNavigate();
  const [gestores, setGestores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  useEffect(() => {
    carregarGestores();
  }, []);

  const carregarGestores = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/gestores/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGestores(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar gestores", error);
      setLoading(false);
    }
  };

  const deletarGestor = async (id) => {
      if(!window.confirm("Tem certeza que deseja remover este usuário?")) return;
      const token = localStorage.getItem('access_token');
      try {
          await axios.delete(`http://127.0.0.1:8000/api/gestores/${id}/`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          alert("Usuário removido!");
          carregarGestores();
      } catch (error) {
          alert("Erro ao remover usuário.");
      }
  };

  const s = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' },
    main: { flex: 1, marginLeft: isSidebarCollapsed ? '80px' : '260px', padding: '30px', transition: 'margin-left 0.3s ease' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
    card: { background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '15px' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '15px', borderBottom: '1px solid #f3f4f6' },
    avatar: { width: '50px', height: '50px', borderRadius: '50%', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
    infoRow: { display: 'flex', alignItems: 'center', gap: '10px', color: '#4b5563', fontSize: '14px' },
    badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', backgroundColor: '#e0e7ff', color: '#4338ca' },
    actions: { marginTop: 'auto', paddingTop: '15px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }
  };

  return (
    <div style={s.container}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      <main style={s.main}>
        <div style={s.header}>
            <div>
                <h1 style={{margin:0, color:'#1f2937', display:'flex', alignItems:'center', gap:'10px'}}>
                    <FaUserTie style={{color:'#2563eb'}}/> Equipe & Acessos
                </h1>
                <p style={{margin:'5px 0 0', color:'#6b7280'}}>Gerencie quem tem acesso ao sistema.</p>
            </div>
            <button onClick={() => navigate('/add-gestor')} style={{background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'}}>
                <FaPlus /> Novo Usuário
            </button>
        </div>

        {loading ? <p>Carregando equipe...</p> : (
            <div style={s.grid}>
                {gestores.map(gestor => (
                    <div key={gestor.id} style={s.card}>
                        <div style={s.cardHeader}>
                            <div style={s.avatar}><FaUserTie /></div>
                            <div>
                                <h3 style={{margin:0, fontSize:'16px', color:'#1f2937'}}>{gestor.nome}</h3>
                                <span style={s.badge}>Colaborador</span>
                            </div>
                        </div>
                        <div style={s.infoRow}><FaIdCard color="#9ca3af"/> <span>CPF: {gestor.cpf}</span></div>
                        <div style={s.infoRow}><FaEnvelope color="#9ca3af"/> <span>{gestor.email}</span></div>
                        <div style={s.infoRow}><FaStore color="#9ca3af"/> <span>{gestor.unidade_nome || 'Sem Loja Fixa'}</span></div>
                        <div style={s.actions}>
                            <button onClick={() => deletarGestor(gestor.id)} style={{border:'none', background:'#fee2e2', color:'#dc2626', padding:'8px', borderRadius:'6px', cursor:'pointer'}}><FaTrash /></button>
                        </div>
                    </div>
                ))}
                {gestores.length === 0 && <p>Nenhum usuário encontrado.</p>}
            </div>
        )}
      </main>
    </div>
  );
}
export default Gestores;