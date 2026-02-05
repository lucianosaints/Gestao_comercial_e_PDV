import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from '../Sidebar';
import { FaSearch, FaShoppingCart, FaTrash, FaMoneyBillWave, FaCreditCard, FaBarcode, FaCheck, FaBox, FaWhatsapp, FaPrint, FaShareAlt } from 'react-icons/fa';

function PDV() {
    // Estados Globais
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // PDV começa com menu fechado para focar

    // Estados de Dados
    const [produtos, setProdutos] = useState([]);
    const [carrinho, setCarrinho] = useState([]);

    // Estados de Controle
    const [termoBusca, setTermoBusca] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalPagamentoOpen, setModalPagamentoOpen] = useState(false);

    // Dados da Venda
    const [formaPagamento, setFormaPagamento] = useState('DINHEIRO');
    const [desconto, setDesconto] = useState(0);
    const [vendaConcluida, setVendaConcluida] = useState(null); // Armazena dados da ultima venda para recibo
    const [valorPago, setValorPago] = useState(''); // Para calcular troco
    const [whatsappNumero, setWhatsappNumero] = useState(''); // Numero para envio
    const [solicitaCupom, setSolicitaCupom] = useState(false);
    const [cpfCnpj, setCpfCnpj] = useState('');

    // Estado de Paginação
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalItens, setTotalItens] = useState(0);

    const buscaInputRef = useRef(null);

    // --- INICIALIZAÇÃO E EFEITOS ---
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);

        // Carrega produtos iniciais (ou vazios)
        carregarProdutos();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Foca na busca ao abrir e sempre que limpar
    useEffect(() => {
        carregarProdutos();
    }, [paginaAtual]); // Recarrega sempre que mudar a página



    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    // --- FUNÇÕES DE API ---
    const carregarProdutos = async (termo = '') => {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            // URL Padrão = Paginada | Com Busca
            let url = `http://127.0.0.1:8000/api/bens/?page=${paginaAtual}`;
            if (termo) {
                url += `&search=${termo}`;
            }

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // DRF Paginado retorna: { count, next, previous, results: [] }
            setProdutos(response.data.results);
            setTotalItens(response.data.count);
            // Calcula total de paginas (50 itens por pagina é o padrao do backend)
            setTotalPaginas(Math.ceil(response.data.count / 50));

        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
            // Se der erro 404 na página (ex: página inexistente), volta pra 1
            if (error.response && error.response.status === 404) {
                setPaginaAtual(1);
            }
        } finally {
            setLoading(false);
        }
    };

    // --- LOGICA DO CARRINHO ---
    const adicionarAoCarrinho = (produto) => {
        const itemExistente = carrinho.find(item => item.id === produto.id);

        if (itemExistente) {
            // Se já existe, checa estoque
            if (itemExistente.quantidade + 1 > produto.quantidade) {
                alert("Estoque insuficiente!");
                return;
            }
            setCarrinho(carrinho.map(item =>
                item.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item
            ));
        } else {
            // Novo item
            if (produto.quantidade < 1) {
                alert("Produto sem estoque!");
                return;
            }
            setCarrinho([...carrinho, { ...produto, quantidade: 1 }]);
        }
        setTermoBusca(''); // Limpa busca para agilizar próximo item
    };

    const removerDoCarrinho = (id) => {
        setCarrinho(carrinho.filter(item => item.id !== id));
    };

    const alterarQuantidade = (id, novaQtd) => {
        if (novaQtd < 1) return;
        const item = carrinho.find(i => i.id === id);
        // Precisamos saber o estoque total original. O objeto 'item' tem a info do produto original?
        // Sim, copiamos todo o produto para o carrinho.
        if (novaQtd > item.quantidade_original) { // Ajuste se guardarmos estoque orig.
            // Como simplificação, usamos a qtd do produto que veio da busca, mas ela não atualiza em real-time.
            // Vamos confiar na validação do backend na hora de fechar também.
        }
        setCarrinho(carrinho.map(i => i.id === id ? { ...i, quantidade: novaQtd } : i));
    };

    // --- CÁLCULOS ---
    const subtotal = carrinho.reduce((acc, item) => acc + (parseFloat(item.valor) * item.quantidade), 0);
    const totalFinal = Math.max(0, subtotal - parseFloat(desconto || 0));
    const troco = valorPago ? Math.max(0, parseFloat(valorPago) - totalFinal) : 0;

    // --- FINALIZAR VENDA ---
    const finalizarVenda = async () => {
        if (carrinho.length === 0) return alert("Carrinho vazio!");

        const token = localStorage.getItem('access_token');
        const payload = {
            itens: carrinho.map(item => ({
                produto: item.id,
                quantidade: item.quantidade,
                preco_unitario: item.valor
            })),
            valor_total: totalFinal,
            desconto: parseFloat(desconto || 0),
            forma_pagamento: formaPagamento,
            cliente_solicitou_cupom: solicitaCupom,
            cpf_cnpj_cliente: solicitaCupom ? cpfCnpj : null
        };

        try {
            await axios.post('http://127.0.0.1:8000/api/vendas/', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Sucesso: Salvar dados para o recibo antes de limpar
            setVendaConcluida({
                itens: [...carrinho],
                subtotal: subtotal,
                desconto: parseFloat(desconto || 0),
                total: totalFinal,
                valorPago: parseFloat(valorPago || 0),
                troco: troco,
                forma_pagamento: formaPagamento,
                data: new Date()
            });

            setCarrinho([]);
            setModalPagamentoOpen(false);
            setValorPago('');
            setDesconto(0);
            setSolicitaCupom(false);
            setCpfCnpj('');
            carregarProdutos();
        } catch (error) {
            console.error(error);
            alert("Erro ao finalizar venda: " + (error.response?.data?.error || error.message));
        }
    };

    // --- FUNÇÕES DE RECIBO E WHATSAPP ---
    const gerarConteudoRecibo = () => {
        if (!vendaConcluida) return '';
        return `
            <div style="font-family: 'Courier New', monospace; font-size: 12px; width: 300px;">
                <h3 style="text-align: center; margin: 0;">SAKURA PRESENTES</h3>
                <p style="text-align: center; margin: 0; border-bottom: 1px dashed #000; padding-bottom: 5px;">
                    Rua Exemplo, 123 - Centro<br>
                    Tel: (00) 0000-0000
                </p>
                <p>Data: ${vendaConcluida.data.toLocaleString()}</p>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead><tr style="border-bottom: 1px dashed #000;">
                        <th style="text-align: left;">Item</th>
                        <th style="text-align: right;">Qtd</th>
                        <th style="text-align: right;">Val</th>
                    </tr></thead>
                    <tbody>
                        ${vendaConcluida.itens.map(i => `
                            <tr>
                                <td>${i.nome}</td>
                                <td style="text-align: right;">${i.quantidade}</td>
                                <td style="text-align: right;">${parseFloat(i.valor).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <p style="border-top: 1px dashed #000; margin-top: 5px; padding-top: 5px;">
                    <strong>Subtotal: R$ ${vendaConcluida.subtotal.toFixed(2)}</strong><br>
                    Desconto: R$ ${vendaConcluida.desconto.toFixed(2)}<br>
                    <strong>TOTAL: R$ ${vendaConcluida.total.toFixed(2)}</strong>
                </p>
                <p style="text-align: center; margin-top: 10px;">*** OBRIGADO PELA PREFERENCIA ***</p>
            </div>
        `;
    };

    const handleImprimir = () => {
        const conteudo = gerarConteudoRecibo();
        const janela = window.open('', '', 'width=400,height=600');
        janela.document.write('<html><body>' + conteudo + '</body></html>');
        janela.document.close();
        janela.print();
    };

    const handleWhatsapp = () => {
        if (!vendaConcluida) return;
        let texto = `*SAKURA PRESENTES* %0A`;
        texto += `Pedido em: ${vendaConcluida.data.toLocaleString()} %0A%0A`;
        vendaConcluida.itens.forEach(i => {
            texto += `${i.quantidade}x ${i.nome} - R$ ${parseFloat(i.valor).toFixed(2)} %0A`;
        });
        texto += `%0A*Subtotal:* R$ ${vendaConcluida.subtotal.toFixed(2)}`;
        if (vendaConcluida.desconto > 0) texto += `%0A*Desconto:* - R$ ${vendaConcluida.desconto.toFixed(2)}`;
        texto += `%0A*TOTAL:* R$ ${vendaConcluida.total.toFixed(2)}`;
        texto += `%0A%0A_Obrigado pela preferência!_`;

        const numero = whatsappNumero.replace(/\D/g, '');
        const link = numero ? `https://wa.me/55${numero}?text=${texto}` : `https://wa.me/?text=${texto}`;
        window.open(link, '_blank');
    };

    const fecharVendaConcluida = () => {
        setVendaConcluida(null);
        setWhatsappNumero('');
    };

    // --- HANDLERS ---
    const handleBuscaKeyDown = (e) => {
        if (e.key === 'Enter') {
            setPaginaAtual(1); // Reseta para primeira pagina ao buscar
            carregarProdutos(termoBusca);
        }
    };

    const mudarPagina = (novaPagina) => {
        if (novaPagina >= 1 && novaPagina <= totalPaginas) {
            setPaginaAtual(novaPagina);
        }
    };

    // --- ESTILOS ---
    const s = {
        container: { display: 'flex', height: '100vh', backgroundColor: '#e2e8f0', overflow: 'hidden' },
        main: {
            flex: 1,
            marginLeft: isSidebarCollapsed ? '80px' : '260px',
            display: 'flex',
            transition: 'all 0.3s ease',
        },
        // COLUNA ESQUERDA: PRODUTOS
        leftCol: {
            flex: 2,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            overflowY: 'auto'
        },
        searchBox: {
            background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            display: 'flex', gap: '10px'
        },
        searchInput: {
            flex: 1, padding: '15px', fontSize: '18px', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none'
        },
        gridProdutos: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '15px'
        },
        cardProduto: {
            background: 'white', padding: '15px', borderRadius: '10px', cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'transform 0.1s',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '300px'
        },

        // COLUNA DIREITA: CARRINHO
        rightCol: {
            flex: 1,
            backgroundColor: 'white',
            borderLeft: '1px solid #cbd5e1',
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '500px'
        },
        cartHeader: {
            padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc',
            display: 'flex', alignItems: 'center', gap: '10px'
        },
        cartList: {
            flex: 1, overflowY: 'auto', padding: '20px'
        },
        cartItem: {
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px', borderBottom: '1px solid #f1f5f9', marginBottom: '10px'
        },
        cartFooter: {
            padding: '20px', background: '#f1f5f9', borderTop: '1px solid #e2e8f0'
        },
        totalDisplay: {
            fontSize: '32px', fontWeight: 'bold', color: '#1e293b', textAlign: 'right', marginBottom: '20px'
        },
        btnFinalizar: {
            width: '100%', padding: '20px', background: '#10b981', color: 'white', border: 'none',
            borderRadius: '8px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer'
        },

        // MODAL
        modalOverlay: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        },
        modalContent: {
            background: 'white', padding: '30px', borderRadius: '15px', width: '500px', maxWidth: '90%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }
    };

    return (
        <div style={s.container}>
            <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />

            <div style={s.main}>
                {/* ESQUERDA: BUSCA E LISTA */}
                <div style={s.leftCol}>
                    <div style={s.searchBox}>
                        <FaBarcode size={30} color="#64748b" style={{ alignSelf: 'center' }} />
                        <input
                            ref={buscaInputRef}
                            type="text"
                            placeholder="Buscar produto (Nome ou Código de Barras)..."
                            value={termoBusca}
                            onChange={(e) => {
                                setTermoBusca(e.target.value);
                                if (e.target.value.length > 2) carregarProdutos(e.target.value);
                            }}
                            onKeyDown={handleBuscaKeyDown}
                            style={s.searchInput}
                        />
                        <button onClick={() => carregarProdutos(termoBusca)} style={{ padding: '0 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                            <FaSearch size={20} />
                        </button>
                    </div>

                    <div style={s.gridProdutos}>
                        {produtos.map(p => {
                            const isCritico = p.quantidade <= (p.estoque_minimo || 2);
                            const semEstoque = p.quantidade <= 0;
                            const corEstoque = semEstoque ? '#ef4444' : (isCritico ? '#f59e0b' : '#10b981');

                            return (
                                <div key={p.id} style={s.cardProduto} onClick={() => adicionarAoCarrinho(p)}>
                                    {/* IMAGEM DO PRODUTO */}
                                    <div style={{ width: '100%', height: '140px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '8px' }}>
                                        {p.imagem ? (
                                            <img src={p.imagem} alt={p.nome} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <FaBox size={50} color="#cbd5e1" />
                                        )}
                                    </div>

                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{p.codigo_barras || 'S/ CÓD'}</div>
                                        <div style={{
                                            fontWeight: 'bold', color: '#1e293b', lineHeight: '1.4', fontSize: '15px',
                                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                        }}>
                                            {p.nome}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginTop: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: corEstoque, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {semEstoque ? 'Esgotado' : `${p.quantidade} un.`}
                                            {isCritico && !semEstoque && <span style={{ fontSize: '10px', background: '#fef3c7', padding: '2px 5px', borderRadius: '4px', color: '#d97706' }}>Baixo</span>}
                                        </div>
                                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>
                                            R$ {parseFloat(p.valor).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* CONTROLES DE PAGINAÇÃO */}
                    <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                        <button
                            onClick={() => mudarPagina(paginaAtual - 1)}
                            disabled={paginaAtual === 1}
                            style={{ padding: '10px 20px', background: paginaAtual === 1 ? '#e2e8f0' : '#3b82f6', color: paginaAtual === 1 ? '#94a3b8' : 'white', border: 'none', borderRadius: '6px', cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                        >
                            Anterior
                        </button>

                        <span style={{ fontSize: '16px', color: '#64748b' }}>
                            Página <strong>{paginaAtual}</strong> de <strong>{totalPaginas}</strong> ({totalItens} itens)
                        </span>

                        <button
                            onClick={() => mudarPagina(paginaAtual + 1)}
                            disabled={paginaAtual === totalPaginas}
                            style={{ padding: '10px 20px', background: paginaAtual === totalPaginas ? '#e2e8f0' : '#3b82f6', color: paginaAtual === totalPaginas ? '#94a3b8' : 'white', border: 'none', borderRadius: '6px', cursor: paginaAtual === totalPaginas ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                        >
                            Próximo
                        </button>
                    </div>
                </div>

                {/* DIREITA: CARRINHO */}
                <div style={s.rightCol}>
                    <div style={s.cartHeader}>
                        <FaShoppingCart size={24} color="#334155" />
                        <h2 style={{ margin: 0, fontSize: '20px', color: '#334155' }}>Carrinho de Compras</h2>
                    </div>

                    <div style={s.cartList}>
                        {carrinho.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '50px' }}>
                                <FaShoppingCart size={50} style={{ marginBottom: '10px' }} />
                                <p>Carrinho vazio</p>
                            </div>
                        ) : (
                            carrinho.map(item => (
                                <div key={item.id} style={s.cartItem}>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{item.nome}</div>
                                        <div style={{ fontSize: '14px', color: '#64748b' }}>
                                            {item.quantidade} x R$ {parseFloat(item.valor).toFixed(2)}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                                            R$ {(item.quantidade * parseFloat(item.valor)).toFixed(2)}
                                        </div>
                                        <button onClick={() => removerDoCarrinho(item.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div style={s.cartFooter}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#64748b' }}>
                            <span>Subtotal</span>
                            <span>R$ {subtotal.toFixed(2)}</span>
                        </div>
                        <div style={s.totalDisplay}>
                            R$ {totalFinal.toFixed(2)}
                            {desconto > 0 && <div style={{ fontSize: '14px', color: '#10b981', fontWeight: 'normal' }}>(- R$ {parseFloat(desconto).toFixed(2)} desc)</div>}
                        </div>

                        <button
                            style={{ ...s.btnFinalizar, background: carrinho.length > 0 ? '#10b981' : '#cbd5e1', cursor: carrinho.length > 0 ? 'pointer' : 'not-allowed' }}
                            disabled={carrinho.length === 0}
                            onClick={() => setModalPagamentoOpen(true)}
                        >
                            <span style={{ marginRight: '10px' }}>F9</span>
                            FINALIZAR VENDA
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL DE PAGAMENTO */}
            {modalPagamentoOpen && (
                <div style={s.modalOverlay}>
                    <div style={s.modalContent}>
                        <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#1e293b' }}>Finalizar Pagamento</h2>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#64748b' }}>Forma de Pagamento</label>
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                {['DINHEIRO', 'CARTAO DEBITO', 'CARTAO CREDITO', 'PIX', 'MUMBUCA'].map(tipo => (
                                    <button
                                        key={tipo}
                                        onClick={() => setFormaPagamento(tipo)}
                                        style={{
                                            flex: '1 0 45%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1',
                                            background: formaPagamento === tipo ? '#3b82f6' : 'white',
                                            color: formaPagamento === tipo ? 'white' : '#1e293b',
                                            fontWeight: 'bold', cursor: 'pointer', fontSize: '14px'
                                        }}
                                    >
                                        {tipo}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: '#64748b' }}>Desconto (R$)</label>
                                <input
                                    type="number"
                                    value={desconto}
                                    onChange={e => setDesconto(e.target.value)}
                                    style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: '#64748b' }}>Valor Recebido (R$)</label>
                                <input
                                    type="number"
                                    value={valorPago}
                                    onChange={e => setValorPago(e.target.value)}
                                    style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                />
                            </div>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
                                <span>Total:</span>
                                <span>R$ {totalFinal.toFixed(2)}</span>
                            </div>
                            {troco > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 'bold' }}>
                                    <span>Troco:</span>
                                    <span>R$ {troco.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        {/* AREA CUPOM FISCAL */}
                        <div style={{ marginBottom: '20px', padding: '10px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: 'bold', color: '#166534', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    checked={solicitaCupom}
                                    onChange={(e) => setSolicitaCupom(e.target.checked)}
                                    style={{ width: '18px', height: '18px', accentColor: '#15803d' }}
                                />
                                Solicitar Cupom Fiscal?
                            </label>

                            {solicitaCupom && (
                                <div style={{ marginTop: '10px' }}>
                                    <input
                                        type="text"
                                        placeholder="CPF ou CNPJ (apenas números)"
                                        value={cpfCnpj}
                                        onChange={(e) => setCpfCnpj(e.target.value)}
                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #16a34a', outline: 'none' }}
                                    />
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setModalPagamentoOpen(false)} style={{ flex: 1, padding: '15px', background: '#e2e8f0', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', color: '#475569' }}>
                                CANCELAR
                            </button>
                            <button onClick={finalizarVenda} style={{ flex: 1, padding: '15px', background: '#10b981', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', color: 'white' }}>
                                <FaCheck style={{ marginRight: '5px' }} /> CONFIRMAR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL SUCESSO / OPCOES FINAIS */}
            {vendaConcluida && (
                <div style={s.modalOverlay}>
                    <div style={s.modalContent}>
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <div style={{ background: '#10b981', color: 'white', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                                <FaCheck size={30} />
                            </div>
                            <h2 style={{ color: '#10b981', margin: 0 }}>Venda Realizada!</h2>
                            <p style={{ color: '#64748b' }}>Total: R$ {vendaConcluida.total.toFixed(2)}</p>
                            {vendaConcluida.troco > 0 && <p style={{ color: '#3b82f6', fontWeight: 'bold' }}>Troco: R$ {vendaConcluida.troco.toFixed(2)}</p>}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button onClick={handleImprimir} style={{ padding: '15px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' }}>
                                <FaPrint /> Imprimir Cupom
                            </button>
                            <div style={{ marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                                <input
                                    type="text"
                                    placeholder="DDD + Número (ex: 21999999999)"
                                    value={whatsappNumero}
                                    onChange={(e) => setWhatsappNumero(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '10px', fontSize: '16px' }}
                                />
                                <button onClick={handleWhatsapp} style={{ width: '100%', padding: '15px', background: '#25d366', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <FaWhatsapp /> Enviar no WhatsApp
                                </button>
                            </div>
                            <button onClick={fecharVendaConcluida} style={{ padding: '15px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', marginTop: '10px', cursor: 'pointer' }}>
                                Nova Venda (Enter)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PDV;
