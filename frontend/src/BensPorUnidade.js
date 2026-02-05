import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaArrowLeft, FaBarcode, FaBoxOpen, FaExclamationTriangle, FaBars } from 'react-icons/fa';
import './Unidades.css'; // Reutilizando os estilos
import API_BASE_URL from './config';

function BensPorUnidade() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bens, setBens] = useState([]);
  const [unidadeNome, setUnidadeNome] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarCollapsed(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const carregarDados = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      setLoading(true);
      setErro(null);

      // 1. Busca o nome da unidade
      const resUnidade = await axios.get(`${API_BASE_URL}/api/unidades/${id}/`, config);
      setUnidadeNome(resUnidade.data.nome);

      // 2. Busca os produtos (Fallback pattern)
      try {
        const resBens = await axios.get(`${API_BASE_URL}/api/unidades/${id}/bens/`, config);
        setBens(resBens.data.results || resBens.data); // Suporte a paginacao
      } catch (e) {
        const resBensAlt = await axios.get(`${API_BASE_URL}/api/bens/?unidade=${id}`, config);
        setBens(resBensAlt.data.results || resBensAlt.data);
      }
    } catch (error) {
      console.error("Erro ao carregar estoque:", error);
      setErro("Não foi possível carregar os dados desta unidade.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  return (
    <div className="unidades-container">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />

      <main className="unidades-main" style={{ marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '80px' : '260px') }}>

        {/* HEADER */}
        <div className="unidades-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {isMobile && <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}><FaBars /></button>}
              <h1 className="unidades-title">
                {unidadeNome || "Estoque da Loja"}
              </h1>
            </div>
            <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Itens disponíveis nesta unidade.</p>
          </div>

          <div className="unidades-controls">
            <button onClick={() => navigate('/unidades')} className="btn-back">
              <FaArrowLeft /> Voltar
            </button>
          </div>
        </div>

        {/* LOADING & ERROR */}
        {loading && <p style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>Carregando estoque...</p>}

        {erro && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444', background: 'white', borderRadius: '12px' }}>
            <FaExclamationTriangle size={30} style={{ marginBottom: '10px' }} />
            <p>{erro}</p>
            <button onClick={carregarDados} className="btn-back" style={{ margin: '10px auto' }}>Tentar Novamente</button>
          </div>
        )}

        {/* LISTA DE BENS */}
        {!loading && !erro && (
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            {bens.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '13px' }}>PRODUTO</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '13px' }}>STATUS</th>
                    <th style={{ padding: '16px', textAlign: 'right', color: '#64748b', fontSize: '13px' }}>QTD</th>
                    <th style={{ padding: '16px', textAlign: 'right', color: '#64748b', fontSize: '13px' }}>VALOR TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {bens.map(item => {
                    const isCritico = item.quantidade <= (item.estoque_minimo || 2);
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>{item.nome}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FaBarcode /> {item.codigo_barras || 'S/N'}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            background: isCritico ? '#fef2f2' : '#dcfce7',
                            color: isCritico ? '#ef4444' : '#166534',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700'
                          }}>
                            {isCritico ? 'CRÍTICO' : 'DISPONÍVEL'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', color: isCritico ? '#ef4444' : '#334155' }}>
                          {item.quantidade}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', color: '#10b981' }}>
                          R$ {(parseFloat(item.valor || 0) * item.quantidade).toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                <FaBoxOpen size={40} style={{ opacity: 0.3, marginBottom: '15px' }} />
                <p>Nenhum produto encontrado nesta loja.</p>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

export default BensPorUnidade;