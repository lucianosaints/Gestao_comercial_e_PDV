import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../Sidebar'; // Se estiver na pasta src, use './Sidebar'
import { FaCalendarAlt, FaSearch, FaMoneyBillWave, FaCreditCard, FaQrcode } from 'react-icons/fa';
import API_BASE_URL from '../config';

function RelatorioVendas() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
  const [vendas, setVendas] = useState([]);
  const [resumo, setResumo] = useState({ pix: 0, dinheiro: 0, credito: 0, debito: 0, mumbuca: 0 });
  const [filtroData, setFiltroData] = useState(new Date().toISOString().split('T')[0]);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  useEffect(() => {
    carregarVendas();
  }, [filtroData]);

  const carregarVendas = async () => {
    const token = localStorage.getItem('access_token');
    try {
      // Busca as vendas filtradas pela data
      const response = await axios.get(`${API_BASE_URL}/api/vendas/?data=${filtroData}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendas(response.data);
      calcularResumo(response.data);
    } catch (error) {
      console.error("Erro ao carregar relatório", error);
    }
  };

  const calcularResumo = (dados) => {
    const novoResumo = { pix: 0, dinheiro: 0, credito: 0, debito: 0, mumbuca: 0 };
    
    dados.forEach(venda => {
        const valor = parseFloat(venda.valor_total || 0);
        const tipo = (venda.forma_pagamento || '').toUpperCase().trim();
        
        if (tipo === 'PIX') novoResumo.pix += valor;
        else if (tipo === 'DINHEIRO') novoResumo.dinheiro += valor;
        // Suporte para 'CREDITO' (antigo) e 'CARTAO CREDITO' (novo)
        else if (tipo === 'CREDITO' || tipo === 'CARTAO CREDITO' || tipo.includes('CREDITO')) novoResumo.credito += valor;
        // Suporte para 'DEBITO' (antigo) e 'CARTAO DEBITO' (novo)
        else if (tipo === 'DEBITO' || tipo === 'CARTAO DEBITO' || tipo.includes('DEBITO')) novoResumo.debito += valor;
        else if (tipo === 'MUMBUCA') novoResumo.mumbuca += valor;
    });
    setResumo(novoResumo);
  };

  // --- ESTILOS VISUAIS (CORREÇÃO DA MARGEM) ---
  const s = {
      container: {
          display: 'flex',
          minHeight: '100vh',
          backgroundColor: '#f3f4f6'
      },
      mainContent: {
          flex: 1,
          // AQUI ESTÁ A CORREÇÃO: Empurra o conteúdo
          marginLeft: isSidebarCollapsed ? '80px' : '260px', 
          padding: '30px',
          transition: 'margin-left 0.3s ease'
      },
      header: {
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px',
          background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
      },
      cardGrid: {
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px'
      },
      card: (color) => ({
          background: color, color: 'white', padding: '20px', borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', height: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
      })
  };

  return (
    <div style={s.container}>
      {/* Ajuste o import do Sidebar conforme sua pasta */}
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      
      <main style={s.mainContent}>
        
        <div style={s.header}>
            <div>
                <h1 style={{margin: 0, color:'#1f2937'}}>Relatório de Vendas</h1>
                <p style={{margin:'5px 0 0', color:'#6b7280'}}>Consolidado do dia</p>
            </div>
            <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                <FaCalendarAlt color="#6b7280"/>
                <input 
                    type="date" 
                    value={filtroData} 
                    onChange={(e) => setFiltroData(e.target.value)}
                    style={{padding:'10px', borderRadius:'6px', border:'1px solid #d1d5db'}}
                />
                <button onClick={carregarVendas} style={{padding:'10px 20px', background:'#2563eb', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'bold'}}>
                    <FaSearch /> Filtrar
                </button>
            </div>
        </div>

        {/* CARDS DE RESUMO */}
        <div style={s.cardGrid}>
            <div style={s.card('#00b894')}>
                <div style={{display:'flex', justifyContent:'space-between'}}><span style={{fontWeight:'bold'}}>PIX</span> <FaQrcode/></div>
                <div style={{fontSize:'24px', fontWeight:'bold'}}>R$ {resumo.pix.toFixed(2)}</div>
            </div>
            <div style={s.card('#009432')}>
                <div style={{display:'flex', justifyContent:'space-between'}}><span style={{fontWeight:'bold'}}>DINHEIRO</span> <FaMoneyBillWave/></div>
                <div style={{fontSize:'24px', fontWeight:'bold'}}>R$ {resumo.dinheiro.toFixed(2)}</div>
            </div>
            <div style={s.card('#ff9f43')}>
                <div style={{display:'flex', justifyContent:'space-between'}}><span style={{fontWeight:'bold'}}>CRÉDITO</span> <FaCreditCard/></div>
                <div style={{fontSize:'24px', fontWeight:'bold'}}>R$ {resumo.credito.toFixed(2)}</div>
            </div>
            <div style={s.card('#8e44ad')}>
                <div style={{display:'flex', justifyContent:'space-between'}}><span style={{fontWeight:'bold'}}>DÉBITO</span> <FaCreditCard/></div>
                <div style={{fontSize:'24px', fontWeight:'bold'}}>R$ {resumo.debito.toFixed(2)}</div>
            </div>
             <div style={s.card('#ea2027')}>
                <div style={{display:'flex', justifyContent:'space-between'}}><span style={{fontWeight:'bold'}}>MUMBUCA</span> <span style={{fontWeight:'900'}}>M</span></div>
                <div style={{fontSize:'24px', fontWeight:'bold'}}>R$ {resumo.mumbuca.toFixed(2)}</div>
            </div>
        </div>

        {/* TABELA DETALHADA */}
        <div style={{background:'white', borderRadius:'10px', overflow:'hidden', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead style={{background:'#f9fafb', borderBottom:'1px solid #e5e7eb'}}>
                    <tr>
                        <th style={{padding:'15px', textAlign:'left', color:'#6b7280', fontSize:'12px'}}>ID</th>
                        <th style={{padding:'15px', textAlign:'left', color:'#6b7280', fontSize:'12px'}}>DATA/HORA</th>
                        <th style={{padding:'15px', textAlign:'left', color:'#6b7280', fontSize:'12px'}}>PAGAMENTO</th>
                        <th style={{padding:'15px', textAlign:'center', color:'#6b7280', fontSize:'12px'}}>ITENS</th>
                        <th style={{padding:'15px', textAlign:'right', color:'#6b7280', fontSize:'12px'}}>VALOR</th>
                    </tr>
                </thead>
                <tbody>
                    {vendas.map(venda => (
                        <tr key={venda.id} style={{borderBottom:'1px solid #f3f4f6'}}>
                            <td style={{padding:'15px', fontWeight:'bold'}}>#{venda.id}</td>
                            <td style={{padding:'15px', color:'#4b5563'}}>
                                {new Date(venda.data_venda).toLocaleString('pt-BR')}
                            </td>
                            <td style={{padding:'15px'}}>
                                <span style={{
                                    padding:'5px 10px', borderRadius:'15px', fontSize:'11px', fontWeight:'bold',
                                    background:'#e0f2fe', color:'#0369a1'
                                }}>
                                    {venda.forma_pagamento}
                                </span>
                            </td>
                            <td style={{padding:'15px', textAlign:'center', color:'#4b5563'}}>
                                {venda.itens ? venda.itens.length : 0} item(s)
                            </td>
                            <td style={{padding:'15px', textAlign:'right', fontWeight:'bold', color:'#059669'}}>
                                R$ {parseFloat(venda.valor_total).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                    {vendas.length === 0 && (
                        <tr>
                            <td colSpan="5" style={{padding:'30px', textAlign:'center', color:'#9ca3af'}}>Nenhuma venda encontrada nesta data.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

      </main>
    </div>
  );
}

export default RelatorioVendas;