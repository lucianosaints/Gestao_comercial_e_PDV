import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaSearch, FaArrowLeft, FaEdit, FaTimes, FaBars, FaBarcode, FaBox, FaDollarSign, FaSortAmountUp } from 'react-icons/fa';
import './Dashboard.css';
import API_BASE_URL from './config';

function UnidadeDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [bens, setBens] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [nomeUnidade, setNomeUnidade] = useState('Carregando...');
  
  const [modalAberto, setModalAberto] = useState(false);
  const [bemEditando, setBemEditando] = useState(null);
  
  const [editForm, setEditForm] = useState({
    situacao: '',
    estado_conservacao: '',
    data_baixa: '',
    obs_baixa: ''
  });

  const [salaSelecionada, setSalaSelecionada] = useState('todas'); 
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768); 

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prevState => !prevState);
  };

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarCollapsed(true);
    }
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      if (currentWidth < 768) {
        setIsSidebarCollapsed(true); 
      } else {
        setIsSidebarCollapsed(false); 
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const carregarBens = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/api/bens/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Filtra apenas os produtos desta loja (unidade)
      const bensDaUnidade = response.data.filter(bem => bem.unidade === parseInt(id));
      setBens(bensDaUnidade);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
  }, [id, navigate]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get(`${API_BASE_URL}/api/unidades/${id}/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      setNomeUnidade(response.data.nome);
    })
    .catch(error => {
      console.error("Erro ao carregar nome da loja:", error);
      setNomeUnidade('Loja não encontrada');
    });

    carregarBens();
  }, [id, navigate, carregarBens]);

  const abrirModal = (bem) => {
    setBemEditando(bem);
    setEditForm({
        situacao: bem.situacao,
        estado_conservacao: bem.estado_conservacao,
        data_baixa: bem.data_baixa || '',
        obs_baixa: bem.obs_baixa || ''
    });
    setModalAberto(true);
  };

  const salvarEdicao = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    
    const dadosParaEnviar = {
        ...editForm,
        data_baixa: editForm.data_baixa === '' ? null : editForm.data_baixa
    };

    try {
        await axios.patch(`${API_BASE_URL}/api/bens/${bemEditando.id}/`, dadosParaEnviar, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        alert('Produto atualizado com sucesso!');
        setModalAberto(false);
        carregarBens(); 
    } catch (error) {
        console.error("Erro ao atualizar:", error);
        alert('Erro ao salvar as alterações.');
    }
  };

  const bensFiltrados = bens.filter(bem => 
    bem.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    bem.tombo.includes(filtro)
  );

  // Lista de locais/seções únicas
  const salas = Array.from(new Set(bensFiltrados.map(bem => bem.sala_nome || 'Estoque Geral')));

  const bensAgrupados = () => {
    const agrupamento = {};

    bensFiltrados.forEach(bem => {
      const nomeSala = bem.sala_nome || 'Estoque Geral'; // Nome visual da seção

      // Lógica de filtro por aba (botão)
      if (salaSelecionada !== 'todas' && nomeSala !== salaSelecionada) {
        return;
      }

      if (!agrupamento[nomeSala]) {
        agrupamento[nomeSala] = [];
      }
      agrupamento[nomeSala].push(bem);
    });
    return agrupamento;
  };

  const bensPorSala = bensAgrupados();

  return (
    <div className={`dashboard-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      <main className={`content ${isSidebarCollapsed ? 'content-expanded' : ''}`} style={{position: 'relative'}}>
        
        {!isSidebarCollapsed && window.innerWidth < 768 && (
          <div className="overlay" onClick={toggleSidebar}></div>
        )}
        {isSidebarCollapsed && window.innerWidth < 768 && (
          <button onClick={toggleSidebar} className="mobile-menu-btn">
            <FaBars />
          </button>
        )}
        
        <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px'}}>
            <button onClick={() => navigate('/unidades')} style={{marginRight: '15px', padding: '8px 12px', cursor: 'pointer', border:'none', background:'#e2e8f0', borderRadius:'5px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', color: '#333'}}>
                <FaArrowLeft /> Voltar
            </button>
            <div>
                <h1 style={{margin:0, fontSize: '24px'}}>{nomeUnidade}</h1>
                <p style={{margin:0, color: '#666', fontSize: '14px'}}>Gestão de estoque da filial</p>
            </div>
        </div>

        <div className="panel" style={{marginBottom: '20px', display: 'flex', alignItems: 'center', padding: '15px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
            <FaSearch style={{marginRight: '10px', color: '#007bff'}} />
            <input 
                type="text" 
                placeholder="Filtrar por nome ou Código de Barras..." 
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                style={{border: 'none', width: '100%', outline: 'none', fontSize: '16px'}}
            />
        </div>

        {/* Botões de Filtro por Seção/Local */}
        <div style={{marginBottom: '15px', display: 'flex', gap: '5px', flexWrap: 'wrap'}}>
          <button
            onClick={() => setSalaSelecionada('todas')}
            style={{
              padding:'6px 12px',
              background: salaSelecionada === 'todas' ? '#007bff' : 'white',
              color: salaSelecionada === 'todas' ? 'white' : '#555',
              border: salaSelecionada === 'todas' ? 'none' : '1px solid #ddd',
              borderRadius:'20px', cursor:'pointer', fontWeight: '500'
            }}
          >
            Todos os Itens
          </button>
          {salas.map((sala, idx) => (
            <button
              key={idx}
              onClick={() => setSalaSelecionada(sala)}
              style={{
                padding:'6px 12px',
                background: salaSelecionada === sala ? '#007bff' : 'white',
                color: salaSelecionada === sala ? 'white' : '#555',
                border: salaSelecionada === sala ? 'none' : '1px solid #ddd',
                borderRadius:'20px', cursor:'pointer', fontWeight: '500'
              }}
            >
              {sala}
            </button>
          ))}
        </div>

        <div className="panel table-panel" style={{background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
            <table className="custom-table" style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{background: '#f8f9fa', color: '#333'}}>
                  <th style={{padding: '12px', textAlign: 'left'}}><FaBarcode /> Cód. Barras / SKU</th>
                  <th style={{padding: '12px', textAlign: 'left'}}><FaBox /> Produto</th>
                  <th style={{padding: '12px', textAlign: 'left'}}>Origem</th>
                  <th style={{padding: '12px', textAlign: 'left'}}><FaDollarSign /> Preço (R$)</th>
                  <th style={{padding: '12px', textAlign: 'center'}}><FaSortAmountUp /> Qtd. Estoque</th>
                  <th style={{padding: '12px', textAlign: 'center'}}>Status</th>
                  <th style={{padding: '12px', textAlign: 'center'}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(bensPorSala).length === 0 ? (
                    <tr>
                        <td colSpan="7" style={{textAlign: 'center', padding: '30px', color: '#999'}}>Nenhum produto encontrado nesta seção.</td>
                    </tr>
                ) : (
                    Object.keys(bensPorSala).map((salaNome, indexSala) => (
                      <React.Fragment key={indexSala}>
                        {/* Linha divisória da Seção */}
                        <tr style={{background: '#e0f2fe', fontWeight: 'bold', color: '#0369a1'}}> 
                          <td colSpan="7" style={{padding: '8px 15px'}}>📂 Local: {salaNome}</td>
                        </tr>

                        {bensPorSala[salaNome].map(bem => (
                          <tr key={bem.id} style={{ opacity: bem.data_baixa ? 0.6 : 1, background: bem.data_baixa ? '#f9fafb' : 'white', borderBottom: '1px solid #eee' }}>
                            {/* COLUNA 1: CÓDIGO */}
                            <td style={{padding: '12px', fontFamily: 'monospace', fontSize: '14px', color: '#555'}}>
                                <strong>{bem.tombo}</strong>
                            </td>
                            
                            {/* COLUNA 2: NOME */}
                            <td style={{padding: '12px', fontWeight: '500'}}>{bem.nome}</td>
                            
                            {/* COLUNA 3: ORIGEM */}
                            <td style={{padding: '12px', fontSize: '12px', color: '#666'}}>
                                {bem.origem === 'PROPRIO' ? 'Loja' : bem.origem}
                            </td>

                            {/* COLUNA 4: PREÇO */}
                            <td style={{padding: '12px', color: '#16a34a', fontWeight: 'bold'}}>
                                R$ {bem.valor ? parseFloat(bem.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : '0,00'}
                            </td>

                            {/* COLUNA 5: QUANTIDADE */}
                            <td style={{padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '15px'}}>
                                {bem.quantidade || 0}
                            </td>

                            {/* COLUNA 6: STATUS (CORRIGIDA) */}
                            <td style={{padding: '12px', textAlign: 'center'}}>
                              {bem.data_baixa ? (
                                  <span style={{background:'#fee2e2', color:'#dc2626', padding:'4px 8px', borderRadius:'4px', fontSize:'11px', fontWeight:'bold'}}>
                                    VENDIDO/BAIXADO
                                  </span>
                              ) : bem.quantidade > 0 ? (
                                  <span style={{background:'#dcfce7', color:'#16a34a', padding:'4px 8px', borderRadius:'4px', fontSize:'11px', fontWeight:'bold'}}>
                                    EM ESTOQUE
                                  </span>
                              ) : (
                                  <span style={{background:'#fee2e2', color:'#dc2626', padding:'4px 8px', borderRadius:'4px', fontSize:'11px', fontWeight:'bold'}}>
                                    ESGOTADO
                                  </span>
                              )}
                            </td>

                            {/* COLUNA 7: AÇÕES */}
                            <td style={{padding: '12px', textAlign: 'center'}}>
                              <button 
                                onClick={() => abrirModal(bem)}
                                style={{fontSize: '12px', padding: '6px 12px', cursor:'pointer', background: 'white', border:'1px solid #d1d5db', borderRadius:'4px', display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#4b5563'}}
                              >
                                <FaEdit /> Editar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))
                )}
              </tbody>
            </table>
        </div>

        {/* MODAL DE EDIÇÃO */}
        {modalAberto && (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }}>
                <div style={{
                    background: 'white', padding: '25px', borderRadius: '8px', width: '450px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                        <h3 style={{margin:0, fontSize: '18px'}}>Editar Produto: {bemEditando?.nome}</h3>
                        <button onClick={() => setModalAberto(false)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'18px', color: '#999'}}>
                            <FaTimes />
                        </button>
                    </div>

                    <form onSubmit={salvarEdicao}>
                        {/* Seção de Baixa / Venda Manual */}
                        <div style={{background: '#fff1f2', padding: '15px', borderRadius: '6px', border: '1px solid #fecdd3', marginBottom: '20px'}}>
                            <h4 style={{color:'#be123c', margin:'0 0 10px 0', fontSize:'14px'}}>Registro de Saída Manual / Baixa</h4>
                            
                            <div style={{marginBottom:'10px'}}>
                                <label style={{display:'block', fontSize:'12px', marginBottom:'5px', fontWeight: 'bold'}}>Data da Baixa</label>
                                <input 
                                    type="date" 
                                    value={editForm.data_baixa} 
                                    onChange={e => setEditForm({...editForm, data_baixa: e.target.value})}
                                    style={{width:'100%', padding:'8px', border:'1px solid #ccc', borderRadius:'4px'}}
                                />
                            </div>

                            <div style={{marginBottom:'10px'}}>
                                <label style={{display:'block', fontSize:'12px', marginBottom:'5px', fontWeight: 'bold'}}>Motivo / Observação</label>
                                <textarea 
                                    rows="2"
                                    value={editForm.obs_baixa}
                                    onChange={e => setEditForm({...editForm, obs_baixa: e.target.value})}
                                    placeholder="Ex: Produto vencido, danificado ou ajuste de estoque..."
                                    style={{width:'100%', padding:'8px', border:'1px solid #ccc', borderRadius:'4px', resize:'vertical'}}
                                ></textarea>
                            </div>
                        </div>

                        <div style={{textAlign:'right', display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                            <button 
                                type="button" 
                                onClick={() => setModalAberto(false)}
                                style={{padding:'10px 20px', border:'1px solid #ddd', background:'white', borderRadius:'4px', cursor:'pointer', fontWeight: 'bold', color: '#555'}}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                style={{padding:'10px 20px', border:'none', background:'#007bff', color:'white', borderRadius:'4px', cursor:'pointer', fontWeight:'bold'}}
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}

export default UnidadeDetalhes;