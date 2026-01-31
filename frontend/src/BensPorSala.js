import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaBox, FaArrowLeft, FaBarcode, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import './Dashboard.css';

function BensPorSala() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [bens, setBens] = useState([]);
  const [salaNome, setSalaNome] = useState('Carregando...');
  const [erro, setErro] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  useEffect(() => {
    if (id) {
      carregarDados();
    } else {
      setErro("ID da sala não encontrado na URL.");
      setIsLoading(false);
    }
  }, [id]);

  const carregarDados = async () => {
    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      setIsLoading(true);
      // 1. Busca o nome da Sala
      const respostaSala = await axios.get(`http://127.0.0.1:8000/api/salas/${id}/`, config);
      setSalaNome(respostaSala.data.nome);

      // 2. Busca os Bens FILTRANDO pela sala
      const respostaBens = await axios.get(`http://127.0.0.1:8000/api/bens/?sala=${id}`, config);
      setBens(respostaBens.data);
      setErro(''); 
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setErro('Erro ao carregar bens. Verifique o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- ESTILOS DE LAYOUT (CORREÇÃO DEFINITIVA) ---
  const s = {
      container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' },
      mainContent: {
          flex: 1,
          marginLeft: isSidebarCollapsed ? '80px' : '260px', // O ajuste que resolve o corte
          padding: '30px',
          transition: 'margin-left 0.3s ease',
          overflowX: 'hidden'
      },
      header: {
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          marginBottom: '20px', background: 'white', padding: '20px', borderRadius: '12px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
      },
      panel: {
          background: 'white', padding: '25px', borderRadius: '12px', 
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
      }
  };

  return (
    <div style={s.container}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      
      <main style={s.mainContent}>
        
        <div style={s.header}>
            <div>
              <h1 style={{margin:0, fontSize:'24px', display:'flex', alignItems:'center', gap:'10px'}}>
                <FaMapMarkerAlt color="#3b82f6"/> {salaNome}
              </h1>
              <p style={{margin:'5px 0 0', color:'#6b7280'}}>Itens localizados nesta seção.</p>
            </div>
            <button onClick={() => navigate('/salas')} style={{background:'white', color:'#333', border:'1px solid #ddd', padding:'10px 20px', borderRadius:'8px', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px', fontWeight:'bold'}}>
                <FaArrowLeft /> Voltar
            </button>
        </div>

        {erro && <div style={{padding:'15px', background:'#fee2e2', color:'#dc2626', borderRadius:'8px', marginBottom:'20px', border:'1px solid #fca5a5'}}>{erro}</div>}

        <div style={s.panel}>
            {isLoading ? (
                <div style={{textAlign:'center', padding:'50px'}}><FaSpinner className="spinner" size={30}/> Carregando...</div>
            ) : bens.length === 0 ? (
                <div style={{textAlign:'center', padding:'50px', color:'#9ca3af'}}>
                    <FaBox size={40} style={{opacity:0.2, marginBottom:'10px'}}/>
                    <p>Nenhum bem encontrado aqui.</p>
                </div>
            ) : (
                <table style={{width:'100%', borderCollapse:'collapse'}}>
                    <thead>
                        <tr style={{borderBottom:'2px solid #f3f4f6', textAlign:'left'}}>
                            <th style={{padding:'15px', color:'#64748b', fontSize:'13px'}}>PRODUTO</th>
                            <th style={{padding:'15px', color:'#64748b', fontSize:'13px'}}>CÓDIGO</th>
                            <th style={{padding:'15px', color:'#64748b', fontSize:'13px'}}>QTD.</th>
                            <th style={{padding:'15px', color:'#64748b', fontSize:'13px'}}>VALOR UNIT.</th>
                            <th style={{padding:'15px', color:'#64748b', fontSize:'13px'}}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bens.map(bem => (
                            <tr key={bem.id} style={{borderBottom:'1px solid #f9fafb'}}>
                                <td style={{padding:'15px', fontWeight:'bold', color:'#374151'}}>{bem.nome}</td>
                                <td style={{padding:'15px', fontSize:'13px', color:'#6b7280', fontFamily:'monospace'}}><FaBarcode style={{marginRight:5}}/> {bem.codigo_barras || '-'}</td>
                                <td style={{padding:'15px', fontWeight:'bold'}}>{bem.quantidade}</td>
                                <td style={{padding:'15px', color:'#059669', fontWeight:'bold'}}>R$ {parseFloat(bem.valor).toFixed(2)}</td>
                                <td style={{padding:'15px'}}>
                                    <span style={{background: bem.quantidade > 0 ? '#dcfce7' : '#fee2e2', color: bem.quantidade > 0 ? '#16a34a' : '#dc2626', padding:'4px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'bold'}}>
                                        {bem.quantidade > 0 ? 'DISPONÍVEL' : 'ESGOTADO'}
                                    </span>
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

export default BensPorSala;