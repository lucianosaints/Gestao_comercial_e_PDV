import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import HistoricoModal from './HistoricoModal';
import './Dashboard.css';
import { FaEdit, FaTrash, FaPlus, FaHistory, FaSearch, FaBox, FaArrowLeft, FaBarcode, FaTag, FaBars } from 'react-icons/fa';

function Bens() {
  const navigate = useNavigate();
  const location = useLocation(); // Hook para ler URL
  const [bens, setBens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024); // Breakpoint aumentado
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const [showHistorico, setShowHistorico] = useState(false);
  const [historicoSelecionado, setHistoricoSelecionado] = useState([]);
  const [bemSelecionadoNome, setBemSelecionadoNome] = useState('');

  // --- NOVO: Estado para seleção múltipla ---
  const [selectedBens, setSelectedBens] = useState([]);

  // --- Funções de Seleção ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Seleciona todos da PÁGINA ATUAL
      const allIds = filteredBens.map(b => b.id);
      setSelectedBens(allIds);
    } else {
      setSelectedBens([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedBens.includes(id)) {
      setSelectedBens(selectedBens.filter(itemId => itemId !== id));
    } else {
      setSelectedBens([...selectedBens, id]);
    }
  };

  const handleGerarEtiquetas = async () => {
    if (selectedBens.length === 0) {
      alert("Selecione pelo menos um produto para gerar etiquetas.");
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      // Envia IDs como query param: ?ids=1,2,3
      const idsParam = selectedBens.join(',');

      const response = await axios.get(`http://127.0.0.1:8000/api/relatorios/etiquetas/?ids=${idsParam}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'etiquetas.pdf');
      document.body.appendChild(link);
      link.click();

    } catch (error) {
      console.error("Erro ao gerar etiquetas:", error);
      alert("Erro ao gerar etiquetas. Tente novamente.");
    }
  };

  useEffect(() => {
    fetchBens(1);
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarCollapsed(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [location.search]); // Recarrega se a URL mudar (ex: alerta)

  // Debounce da busca
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchBens(1);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const fetchBens = async (pagina = 1) => {
    setLoading(true);
    const token = localStorage.getItem('access_token');

    // Parâmetros de consulta
    const params = new URLSearchParams(location.search);
    const apiParams = {
      page: pagina,
      search: searchTerm,
      alerta: params.get('alerta') // Passa o alerta para o backend
    };

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/bens/', {
        headers: { Authorization: `Bearer ${token}` },
        params: apiParams
      });

      // Ajuste para resposta paginada ou lista direta (fallback)
      if (response.data.results) {
        setBens(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 50));
      } else {
        setBens(response.data); // Caso a paginação falhe ou backend antigo
      }
      setPage(pagina);

    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este produto do estoque?")) {
      const token = localStorage.getItem('access_token');
      try {
        await axios.delete(`http://127.0.0.1:8000/api/bens/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchBens();
      } catch (error) {
        alert("Erro ao excluir produto.");
      }
    }
  };

  const handleVerHistorico = async (bem) => {
    setBemSelecionadoNome(bem.nome);
    if (bem.historico) {
      setHistoricoSelecionado(bem.historico);
      setShowHistorico(true);
    } else {
      const token = localStorage.getItem('access_token');
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/bens/${bem.id}/historico/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistoricoSelecionado(res.data);
        setShowHistorico(true);
      } catch (error) {
        alert("Erro ao carregar histórico.");
      }
    }
  };

  const filteredBens = bens;

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // --- ESTILOS DE LAYOUT (GARANTIA DE NÃO QUEBRAR) ---
  const s = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' },
    mainContent: {
      flex: 1,
      marginLeft: isMobile ? '0px' : (isSidebarCollapsed ? '80px' : '260px'), // AQUI É A CHAVE
      padding: '30px',
      transition: 'margin-left 0.3s ease',
      overflowX: 'hidden'
    }
  };

  return (
    <div style={s.container}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />

      <main style={s.mainContent}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {isMobile && (
              <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#374151', cursor: 'pointer' }}>
                <FaBars />
              </button>
            )}
            <div>
              <h1 style={{ margin: 0, color: '#1f2937', fontSize: isMobile ? '20px' : '28px' }}>Gerenciar Produtos</h1>
              <p style={{ color: '#6b7280', margin: 0, fontSize: isMobile ? '12px' : '14px' }}>Controle geral de estoque e preços.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 15px', borderRadius: '5px', backgroundColor: '#6c757d', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaArrowLeft /> Voltar
            </button>
            <button onClick={() => navigate('/add-bem')} style={{ padding: '10px 15px', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaPlus /> Novo Produto
            </button>
            {/* BOTÃO DE EXPORTAR (NOVO) */}
            <button onClick={async () => {
              const token = localStorage.getItem('access_token');
              try {
                const response = await axios.get('http://127.0.0.1:8000/api/relatorio-inventario/', {
                  headers: { Authorization: `Bearer ${token}` },
                  responseType: 'blob'
                });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'inventario.xlsx');
                document.body.appendChild(link);
                link.click();
              } catch (e) { alert("Erro ao baixar relatório"); }
            }} style={{ padding: '10px 15px', borderRadius: '5px', backgroundColor: '#10b981', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaBox /> Exportar Excel
            </button>

            {/* BOTÃO DE ETIQUETAS (NOVO) */}
            {selectedBens.length > 0 && (
              <button onClick={handleGerarEtiquetas} style={{ padding: '10px 15px', borderRadius: '5px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FaBarcode /> Gerar Etiquetas ({selectedBens.length})
              </button>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
          <FaSearch style={{ color: '#007bff', marginRight: '10px' }} />
          <input
            type="text"
            placeholder="Buscar por nome ou Código de Barras (SKU)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '16px', color: '#333' }}
          />
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {loading ? <p style={{ padding: '20px' }}>Carregando estoque...</p> : filteredBens.length === 0 ? <p style={{ padding: '20px', color: '#666', fontStyle: 'italic' }}>Nenhum produto encontrado.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #007bff', textAlign: 'left', backgroundColor: '#f8f9fa', color: '#333' }}>
                  <th style={{ padding: '15px', width: '40px' }}>
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={filteredBens.length > 0 && selectedBens.length === filteredBens.length}
                    />
                  </th>
                  <th style={{ padding: '15px' }}><FaBarcode /> Cód. Barras</th>
                  <th style={{ padding: '15px' }}><FaBox /> Produto</th>
                  <th style={{ padding: '15px' }}>Loja / Estoque</th>
                  <th style={{ padding: '15px' }}><FaTag /> Preço / Status</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredBens.map((bem) => (
                  <tr key={bem.id} style={{ borderBottom: '1px solid #eee', backgroundColor: selectedBens.includes(bem.id) ? '#f3f4f6' : 'white' }}>

                    <td style={{ padding: '15px' }}>
                      <input
                        type="checkbox"
                        checked={selectedBens.includes(bem.id)}
                        onChange={() => handleSelectOne(bem.id)}
                      />
                    </td>

                    <td style={{ padding: '15px', fontFamily: 'monospace', fontWeight: 'bold', color: '#555' }}>
                      {bem.tombo || '---'}
                    </td>

                    <td style={{ padding: '15px', fontWeight: '500' }}>
                      {bem.nome}
                    </td>

                    <td style={{ padding: '15px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{bem.unidade_nome}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>📍 {bem.sala_nome || 'Estoque Geral'}</div>
                    </td>

                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: 'bold', color: '#374151' }}>
                        R$ {parseFloat(bem.valor).toFixed(2)}
                      </div>

                      {bem.quantidade > 0 ? (
                        <span style={{
                          color: '#16a34a', fontWeight: 'bold', fontSize: '11px',
                          background: '#dcfce7', padding: '2px 8px', borderRadius: '4px',
                          display: 'inline-block', marginTop: '4px'
                        }}>
                          {bem.quantidade <= (bem.estoque_minimo || 2) ? (
                            <span style={{ color: '#d97706' }}>⚠ BAIXO ({bem.quantidade})</span>
                          ) : (
                            <span>EM ESTOQUE ({bem.quantidade})</span>
                          )}
                        </span>
                      ) : (
                        <span style={{
                          color: '#dc2626', fontWeight: 'bold', fontSize: '11px',
                          background: '#fee2e2', padding: '2px 8px', borderRadius: '4px',
                          display: 'inline-block', marginTop: '4px'
                        }}>
                          ESGOTADO
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button onClick={() => handleVerHistorico(bem)} style={{ marginRight: '10px', background: '#e0f2fe', padding: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer', color: '#007bff' }} title="Histórico">
                        <FaHistory size={14} />
                      </button>
                      <button onClick={() => navigate(`/edit-bem/${bem.id}`)} style={{ marginRight: '10px', background: '#fef3c7', padding: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer', color: '#d97706' }} title="Editar">
                        <FaEdit size={14} />
                      </button>
                      <button onClick={() => handleDelete(bem.id)} style={{ background: '#fee2e2', padding: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer', color: '#dc2626' }} title="Excluir">
                        <FaTrash size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* CONTROLES DE PAGINAÇÃO */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '15px' }}>
          <button
            onClick={() => fetchBens(page - 1)}
            disabled={page === 1}
            style={{
              padding: '10px 20px', background: page === 1 ? '#e5e7eb' : 'white',
              border: '1px solid #d1d5db', borderRadius: '6px', cursor: page === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Anterior
          </button>
          <span style={{ color: '#6b7280' }}>Página {page} de {totalPages || 1}</span>
          <button
            onClick={() => fetchBens(page + 1)}
            disabled={page >= totalPages}
            style={{
              padding: '10px 20px', background: page >= totalPages ? '#e5e7eb' : 'white',
              border: '1px solid #d1d5db', borderRadius: '6px', cursor: page >= totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Próximo
          </button>
        </div>

        <HistoricoModal isOpen={showHistorico} onClose={() => setShowHistorico(false)} historico={historicoSelecionado} nomeBem={bemSelecionadoNome} />
      </main>
    </div>
  );
}

export default Bens;