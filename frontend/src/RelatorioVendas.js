import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import './Dashboard.css';
import { FaCalendarAlt, FaMoneyBillWave, FaCreditCard, FaQrcode, FaSearch, FaEye } from 'react-icons/fa';
import API_BASE_URL from './config';

function RelatorioVendas() {
  const [vendas, setVendas] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
  const [filtroData, setFiltroData] = useState(new Date().toISOString().slice(0, 10));

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  useEffect(() => {
    carregarVendas();
  }, [filtroData]);

  const carregarVendas = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/vendas/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filtra pela data e inverte a ordem (mais recente primeiro)
      const filtradas = response.data.filter(v => v.data_venda.startsWith(filtroData));
      setVendas(filtradas.reverse());
    } catch (error) {
      console.error("Erro ao carregar vendas", error);
    }
  };

  const totais = { DINHEIRO: 0, PIX: 0, CREDITO: 0, DEBITO: 0, MUMBUCA: 0, GERAL: 0 };
  vendas.forEach(v => {
    const valor = parseFloat(v.valor_total);
    if (totais[v.forma_pagamento] !== undefined) totais[v.forma_pagamento] += valor;
    totais.GERAL += valor;
  });

  return (
    <div className={`dashboard-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      <main className={`content ${isSidebarCollapsed ? 'content-expanded' : ''}`}>
        <div className="page-header">
          <h1>Relatório de Vendas</h1>
          <p>Fechamento de caixa do dia {filtroData.split('-').reverse().join('/')}</p>
        </div>

        <div style={{ background: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <FaCalendarAlt color="#666" />
          <input type="date" value={filtroData} onChange={e => setFiltroData(e.target.value)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }} />
          <button onClick={carregarVendas} style={{ padding: '8px 15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}><FaSearch /> Filtrar</button>

          {/* BOTÃO EXPORTAR PDF (NOVO) */}
          <button onClick={async () => {
            const token = localStorage.getItem('access_token');
            try {
              const response = await axios.get(`${API_BASE_URL}/api/relatorio-vendas/`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
              });
              const url = window.URL.createObjectURL(new Blob([response.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'relatorio_vendas.pdf');
              document.body.appendChild(link);
              link.click();
            } catch (e) { alert("Erro ao gerar PDF"); }
          }} style={{ padding: '8px 15px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginLeft: 'auto' }}>
            <FaEye /> Exportar PDF
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
          {Object.entries(totais).map(([key, val]) => (
            <div key={key} style={{ background: 'white', padding: '15px', borderRadius: '8px', borderLeft: `4px solid ${key === 'GERAL' ? '#111827' : '#10b981'}`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '11px', color: '#666', fontWeight: 'bold' }}>{key}</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>R$ {val.toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <h3>Histórico Detalhado</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #eee', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Hora</th>
                <th>Pagamento</th>
                <th>Valor</th>
                <th>Itens</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px' }}>{new Date(v.criado_em).toLocaleTimeString().slice(0, 5)}</td>
                  <td><span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>{v.forma_pagamento}</span></td>
                  <td style={{ fontWeight: 'bold', color: '#059669' }}>R$ {parseFloat(v.valor_total).toFixed(2)}</td>
                  <td style={{ fontSize: '12px', color: '#666' }}>{v.itens.length} itens</td>
                </tr>
              ))}
            </tbody>
          </table>
          {vendas.length === 0 && <p style={{ textAlign: 'center', color: '#999', marginTop: '20px' }}>Nenhuma venda encontrada.</p>}
        </div>
      </main>
    </div>
  );
}
export default RelatorioVendas;