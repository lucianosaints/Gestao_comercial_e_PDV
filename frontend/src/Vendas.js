import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- CORREÇÃO DAS IMPORTAÇÕES ---
import Sidebar from './Sidebar';               // Procura na MESMA pasta (src/)
import TicketView from './components/TicketView'; // Procura DENTRO da pasta components

import { 
  FaShoppingCart, FaSearch, FaPlus, FaMinus, FaTimes, 
  FaMoneyBillWave, FaBarcode, FaBox, FaTrash, FaCreditCard, FaQrcode 
} from 'react-icons/fa';

function Vendas() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [busca, setBusca] = useState('');
  const [total, setTotal] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState('DINHEIRO');

  const [vendaFinalizada, setVendaFinalizada] = useState(null);
  const [mostrarTicket, setMostrarTicket] = useState(false);

  const getImageUrl = (path) => {
      if (!path) return null;
      if (path.startsWith('http')) return path;
      return `http://127.0.0.1:8000${path}`;
  };

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleCart = () => setIsCartOpen(!isCartOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsSidebarCollapsed(true);
    };
    window.addEventListener('resize', handleResize);
    carregarProdutos();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const novoTotal = carrinho.reduce((acc, item) => acc + (parseFloat(item.valor) * item.quantidade), 0);
    setTotal(novoTotal);
  }, [carrinho]);

  const carregarProdutos = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/bens/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ativos = response.data.filter(p => !p.data_baixa);
      setProdutos(ativos);
    } catch (error) { console.error("Erro produtos", error); }
  };

  const adicionarAoCarrinho = (produto) => {
    if (produto.quantidade <= 0) return; 

    const itemExistente = carrinho.find(item => item.id === produto.id);
    const estoqueAtual = produto.quantidade || 0;
    const qtdNoCarrinho = itemExistente ? itemExistente.quantidade : 0;

    if (qtdNoCarrinho + 1 > estoqueAtual) {
        alert(`Estoque insuficiente! Apenas ${estoqueAtual} disponíveis.`);
        return;
    }

    if (itemExistente) {
      setCarrinho(carrinho.map(item => 
        item.id === produto.id ? {...item, quantidade: item.quantidade + 1} : item
      ));
    } else {
      setCarrinho([...carrinho, { ...produto, quantidade: 1 }]);
      setIsCartOpen(true); 
    }
  };

  const removerDoCarrinho = (produtoId) => {
      setCarrinho(carrinho.filter(item => item.id !== produtoId));
      if (carrinho.length === 1) setIsCartOpen(false);
  };

  const alterarQuantidade = (produtoId, delta) => {
      setCarrinho(carrinho.map(item => {
          if (item.id === produtoId) {
              const novaQtd = item.quantidade + delta;
              const originalProd = produtos.find(p => p.id === produtoId);
              
              if (delta > 0 && novaQtd > originalProd.quantidade) {
                  alert("Limite de estoque atingido");
                  return item;
              }
              return novaQtd > 0 ? { ...item, quantidade: novaQtd } : item;
          }
          return item;
      }));
  };

  const finalizarVenda = async () => {
    if (carrinho.length === 0) return alert("Carrinho vazio!");
    
    if(!window.confirm(`Finalizar venda de R$ ${total.toFixed(2)} usando ${formaPagamento}?`)) return;

    const token = localStorage.getItem('access_token');
    try {
      const dadosVenda = {
        valor_total: total,
        forma_pagamento: formaPagamento,
        itens: carrinho.map(item => ({
          produto: item.id, quantidade: item.quantidade, preco_unitario: item.valor
        }))
      };
      
      const response = await axios.post('http://127.0.0.1:8000/api/vendas/', dadosVenda, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const dadosTicket = {
          id: response.data.id,
          valor_total: total,
          forma_pagamento: formaPagamento,
          itens: carrinho
      };

      setVendaFinalizada(dadosTicket);
      setMostrarTicket(true);

      setCarrinho([]);
      setIsCartOpen(false);
      carregarProdutos(); 
    } catch (error) {
       console.error(error);
       alert("Erro ao finalizar venda.");
    }
  };

  const fecharTicket = () => {
      setMostrarTicket(false);
      setVendaFinalizada(null);
  };

  // --- ESTILOS VISUAIS ---
  const s = {
      container: {
          display: 'flex',
          minHeight: '100vh',
          backgroundColor: '#f3f4f6'
      },
      mainContent: {
          flex: 1,
          marginLeft: isSidebarCollapsed ? '80px' : '260px', // MARGEM CORRIGIDA
          padding: '30px',
          transition: 'margin-left 0.3s ease',
          overflowX: 'hidden'
      },
      grid: { 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
          gap: '20px', paddingBottom: '100px' 
      },
      card: (qtd) => ({
          background: 'white', borderRadius: '12px', padding: '15px', 
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb',
          transition: 'all 0.2s', cursor: qtd > 0 ? 'pointer' : 'default',
          opacity: qtd > 0 ? 1 : 0.6, height: '100%', position: 'relative', overflow: 'hidden'
      }),
      fab: {
          position: 'fixed', bottom: '30px', right: '30px',
          background: '#059669', color: 'white', padding: '15px 25px', borderRadius: '50px',
          display: 'flex', alignItems: 'center', gap: '10px',
          boxShadow: '0 4px 20px rgba(5, 150, 105, 0.4)', cursor: 'pointer', border: 'none', zIndex: 100,
          fontSize: '16px', fontWeight: 'bold'
      },
      cartDrawer: {
          position: 'fixed', top: 0, right: 0, height: '100%', width: '400px', maxWidth: '90%',
          background: 'white', zIndex: 200, boxShadow: '-5px 0 25px rgba(0,0,0,0.1)',
          transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex', flexDirection: 'column'
      },
      backdrop: {
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.4)', zIndex: 199,
          display: isCartOpen ? 'block' : 'none'
      },
      paymentBtn: (ativo, cor) => ({
          flex: '1 0 30%', padding: '10px', border: `1px solid ${ativo ? cor : '#ddd'}`, 
          background: ativo ? `${cor}20` : 'white', 
          color: ativo ? cor : '#666', borderRadius: '6px', cursor: 'pointer',
          fontWeight: 'bold', fontSize: '13px', display: 'flex', flexDirection: 'column', 
          alignItems: 'center', gap: '5px', transition: 'all 0.2s'
      })
  };

  return (
    <div style={s.container}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      
      <main style={s.mainContent}>
        
        <div style={{marginBottom: '20px'}}>
            <h1 style={{margin: 0, color:'#1f2937'}}>Frente de Caixa</h1>
            <p style={{color: '#6b7280'}}>Selecione os produtos para venda</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
            <FaSearch color="#9ca3af" size={18} />
            <input 
                type="text" placeholder="Buscar produto..." value={busca} onChange={(e) => setBusca(e.target.value)}
                style={{ border: 'none', width: '100%', marginLeft: '15px', fontSize: '16px', outline: 'none' }}
            />
            <FaBarcode color="#64748b" size={24} style={{cursor:'pointer', opacity:0.7}} />
        </div>

        <div style={s.grid}>
            {produtos.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase())).map(produto => (
                <div key={produto.id} style={s.card(produto.quantidade)} onClick={() => adicionarAoCarrinho(produto)}>
                    
                    <div style={{
                        width: '100%', height: '140px', background: '#f8fafc', borderRadius: '8px', marginBottom: '10px', 
                        display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
                    }}>
                        {produto.imagem ? (
                            <img 
                                src={getImageUrl(produto.imagem)} 
                                alt={produto.nome} 
                                style={{width: '100%', height: '100%', objectFit: 'contain'}} 
                            />
                        ) : (
                            <FaBox size={40} color="#cbd5e1" />
                        )}
                    </div>

                    <div>
                        <span style={{fontSize: '11px', fontWeight: 'bold', color: produto.quantidade > 0 ? '#15803d' : '#b91c1c', background: produto.quantidade > 0 ? '#dcfce7' : '#fee2e2', padding: '4px 8px', borderRadius: '4px'}}>
                            {produto.quantidade > 0 ? `${produto.quantidade} UN` : 'ESGOTADO'}
                        </span>
                        <h3 style={{ fontSize: '15px', color: '#1f2937', margin: '8px 0', height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {produto.nome}
                        </h3>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>
                            R$ {parseFloat(produto.valor).toFixed(2)}
                        </div>
                        <button disabled={produto.quantidade <= 0} style={{ background: produto.quantidade > 0 ? '#ecfdf5' : '#f3f4f6', color: produto.quantidade > 0 ? '#059669' : '#9ca3af', border: 'none', padding: '8px', borderRadius: '6px', cursor: produto.quantidade > 0 ? 'pointer' : 'not-allowed'}}>
                            <FaPlus />
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {carrinho.length > 0 && (
            <button style={s.fab} onClick={toggleCart}>
                <FaShoppingCart size={20} />
                <span>{carrinho.reduce((acc, i) => acc + i.quantidade, 0)} itens</span>
                <span style={{background:'rgba(255,255,255,0.3)', width:'1px', height:'15px'}}></span>
                <span>R$ {total.toFixed(2)}</span>
            </button>
        )}

        <div style={s.backdrop} onClick={toggleCart}></div>
        <div style={s.cartDrawer}>
            <div style={{padding:'20px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#f9fafb'}}>
                <h2 style={{margin:0, fontSize:'20px', display:'flex', alignItems:'center', gap:'10px'}}><FaShoppingCart color="#059669" /> Cesta</h2>
                <button onClick={toggleCart} style={{background:'none', border:'none', cursor:'pointer', fontSize:'20px', color:'#6b7280'}}><FaTimes /></button>
            </div>

            <div style={{flex:1, overflowY:'auto', padding:'20px'}}>
                {carrinho.map(item => (
                    <div key={item.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #f3f4f6'}}>
                        <div style={{width: '50px', height: '50px', borderRadius: '6px', overflow: 'hidden', marginRight: '15px', border: '1px solid #eee'}}>
                             {item.imagem ? (
                                <img src={getImageUrl(item.imagem)} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> 
                             ) : (
                                <div style={{width: '100%', height: '100%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <FaBox size={20} color="#cbd5e1" />
                                </div>
                             )}
                        </div>

                        <div style={{flex:1}}>
                            <div style={{fontWeight:'bold', fontSize:'14px', color:'#374151'}}>{item.nome}</div>
                            <div style={{fontSize:'12px', color:'#6b7280'}}>R$ {item.valor} un.</div>
                        </div>
                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                            <button onClick={() => alterarQuantidade(item.id, -1)} style={{width:'24px', height:'24px', borderRadius:'4px', border:'1px solid #ddd', background:'white', cursor:'pointer'}}><FaMinus size={10}/></button>
                            <span style={{fontWeight:'bold', fontSize:'14px'}}>{item.quantidade}</span>
                            <button onClick={() => alterarQuantidade(item.id, 1)} style={{width:'24px', height:'24px', borderRadius:'4px', border:'1px solid #ddd', background:'white', cursor:'pointer'}}><FaPlus size={10}/></button>
                        </div>
                        <div style={{marginLeft:'10px', textAlign:'right'}}>
                            <div style={{fontWeight:'bold', color:'#059669'}}>R$ {(item.valor * item.quantidade).toFixed(2)}</div>
                            <FaTrash size={12} color="#ef4444" style={{cursor:'pointer', marginTop:'4px'}} onClick={() => removerDoCarrinho(item.id)} />
                        </div>
                    </div>
                ))}
            </div>

            <div style={{padding:'20px', borderTop:'1px solid #eee', background:'#fff'}}>
                <p style={{margin:'0 0 10px 0', fontWeight:'bold', fontSize:'14px', color:'#4b5563'}}>Forma de Pagamento:</p>
                <div style={{display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap'}}>
                    <button onClick={() => setFormaPagamento('DINHEIRO')} style={s.paymentBtn(formaPagamento === 'DINHEIRO', '#16a34a')}>
                        <FaMoneyBillWave size={18}/> Dinheiro
                    </button>
                    <button onClick={() => setFormaPagamento('PIX')} style={s.paymentBtn(formaPagamento === 'PIX', '#0891b2')}>
                        <FaQrcode size={18}/> Pix
                    </button>
                    <button onClick={() => setFormaPagamento('CREDITO')} style={s.paymentBtn(formaPagamento === 'CREDITO', '#2563eb')}>
                        <FaCreditCard size={18}/> Crédito
                    </button>
                    <button onClick={() => setFormaPagamento('DEBITO')} style={s.paymentBtn(formaPagamento === 'DEBITO', '#ea580c')}>
                        <FaCreditCard size={18}/> Débito
                    </button>
                    <button onClick={() => setFormaPagamento('MUMBUCA')} style={s.paymentBtn(formaPagamento === 'MUMBUCA', '#be123c')}>
                        <span style={{fontSize:'16px', fontWeight:'900'}}>M</span> Mumbuca
                    </button>
                </div>

                <div style={{display:'flex', justifyContent:'space-between', fontSize:'20px', fontWeight:'bold', marginBottom:'20px'}}>
                    <span>Total</span>
                    <span>R$ {total.toFixed(2)}</span>
                </div>
                
                <button onClick={finalizarVenda} style={{width:'100%', padding:'15px', background:'#059669', color:'white', border:'none', borderRadius:'8px', fontSize:'18px', fontWeight:'bold', cursor:'pointer', display:'flex', justifyContent:'center', alignItems:'center', gap:'10px'}}>
                    <FaMoneyBillWave /> Finalizar Venda
                </button>
            </div>
        </div>

        {mostrarTicket && (
            <TicketView 
                venda={vendaFinalizada} 
                onClose={fecharTicket} 
            />
        )}

      </main>
    </div>
  );
}

export default Vendas;