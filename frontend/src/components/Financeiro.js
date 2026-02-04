import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar from '../Sidebar';
import { FaCheckCircle, FaPlus, FaTrash, FaCalendarAlt } from 'react-icons/fa';

function Financeiro() {
    // Detecta Mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);

    const [despesas, setDespesas] = useState([]);
    // Usa data LOCAL para evitar problemas de fuso horário
    const [mesFiltro, setMesFiltro] = useState(() => {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        return `${ano}-${mes}`;
    });

    const [novaDespesa, setNovaDespesa] = useState({
        descricao: '',
        numero_documento: '',
        valor: '',
        data_vencimento: '',
        tipo: 'MERCADORIA',
        situacao: 'PENDENTE'
    });

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
    const API_URL = 'http://127.0.0.1:8000/api/despesas/';

    // Monitora redimensionamento da tela
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            // No mobile, a sidebar sempre começa fechada (só ícones)
            if (mobile) setIsSidebarCollapsed(true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const carregarDespesas = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDespesas(response.data);
        } catch (error) {
            console.error("Erro ao carregar despesas.", error);
        }
    }, []);

    useEffect(() => {
        carregarDespesas();
    }, [carregarDespesas]);

    const despesasFiltradas = despesas.filter(d => {
        if (!mesFiltro) return true;
        return d.data_vencimento.startsWith(mesFiltro);
    });

    const totalPagar = despesasFiltradas.filter(d => d.situacao === 'PENDENTE').reduce((acc, curr) => acc + parseFloat(curr.valor), 0);
    const totalPago = despesasFiltradas.filter(d => d.situacao === 'PAGO').reduce((acc, curr) => acc + parseFloat(curr.valor), 0);

    const handleInputChange = (e) => {
        setNovaDespesa({ ...novaDespesa, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        const dadosParaEnviar = {
            ...novaDespesa,
            valor: parseFloat(novaDespesa.valor).toFixed(2),
            numero_documento: novaDespesa.numero_documento || null
        };

        try {
            await axios.post(API_URL, dadosParaEnviar, { headers: { Authorization: `Bearer ${token}` } });
            alert("Despesa salva com sucesso!");
            setNovaDespesa({ descricao: '', numero_documento: '', valor: '', data_vencimento: '', tipo: 'MERCADORIA', situacao: 'PENDENTE' });
            carregarDespesas();
        } catch (error) {
            alert("Erro ao salvar despesa.");
        }

    };

    const marcarComoPago = async (id) => {
        const token = localStorage.getItem('access_token');
        try {
            await axios.patch(`${API_URL}${id}/`, { situacao: 'PAGO' }, { headers: { Authorization: `Bearer ${token}` } });
            carregarDespesas();
        } catch (error) { alert("Erro ao atualizar."); }
    };

    const excluirDespesa = async (id) => {
        if (!window.confirm("Apagar esta despesa?")) return;
        const token = localStorage.getItem('access_token');
        try {
            await axios.delete(`${API_URL}${id}/`, { headers: { Authorization: `Bearer ${token}` } });
            carregarDespesas();
        } catch (error) { alert("Erro ao excluir."); }
    };

    // --- ESTILOS DINÂMICOS ---
    const s = {
        container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' },
        main: {
            flex: 1,
            marginLeft: isSidebarCollapsed ? '80px' : '260px',
            padding: isMobile ? '15px' : '30px', // Menos padding no mobile
            transition: 'all 0.3s ease',
            width: '100%',
            overflowX: 'hidden'
        },
        // Header empilha no mobile
        header: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row', // <--- MUDANÇA CHAVE
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            marginBottom: '20px',
            gap: '15px'
        },
        filterBox: {
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'white', padding: '10px', borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            width: isMobile ? '100%' : 'auto' // Filtro largura total no mobile
        },
        card: {
            flex: 1,
            minWidth: isMobile ? '100%' : '250px', // Card ocupa linha inteira no mobile
            padding: '20px', borderRadius: '10px', background: 'white',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '5px'
        },
        // Formulário empilha no mobile
        form: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row', // <--- MUDANÇA CHAVE
            gap: '15px',
            flexWrap: 'wrap',
            alignItems: isMobile ? 'stretch' : 'flex-end'
        },
        // Input ocupa 100% no mobile
        inputGroup: {
            flex: isMobile ? 'auto' : 1,
            minWidth: isMobile ? '100%' : 'auto'
        },
        input: {
            width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '15px'
        }
    };

    return (
        <div style={s.container}>
            <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />

            <main style={s.main}>
                {/* CABEÇALHO */}
                <div style={s.header}>
                    <h1 style={{ margin: 0, color: '#1f2937', fontSize: isMobile ? '22px' : '28px' }}>Controle Financeiro</h1>
                    <div style={s.filterBox}>
                        <FaCalendarAlt color="#6b7280" />
                        <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 'bold' }}>Mês:</span>
                        <input type="month" value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)} style={{ border: 'none', outline: 'none', color: '#374151', fontWeight: 'bold', flex: 1 }} />
                        {mesFiltro && <button onClick={() => setMesFiltro('')} style={{ border: 'none', background: 'none', color: '#ef4444', fontWeight: 'bold' }}>X</button>}
                    </div>

                    <button onClick={async () => {
                        const token = localStorage.getItem('access_token');
                        try {
                            // Passa o filtro de mês para a API se ele existir
                            const params = mesFiltro ? `?mes=${mesFiltro}` : '';
                            const response = await axios.get(`http://127.0.0.1:8000/api/relatorio-financeiro/${params}`, {
                                headers: { Authorization: `Bearer ${token}` },
                                responseType: 'blob'
                            });
                            const url = window.URL.createObjectURL(new Blob([response.data]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', `financeiro_${mesFiltro || 'geral'}.xlsx`);
                            document.body.appendChild(link);
                            link.click();
                        } catch (e) { alert("Erro ao baixar relatório"); }
                    }} style={{
                        padding: '10px 15px', borderRadius: '10px', backgroundColor: '#10b981', color: 'white',
                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold'
                    }}>
                        Exportar Excel
                    </button>
                </div>

                {/* CARDS */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                    <div style={{ ...s.card, borderLeft: '5px solid #ef4444' }}>
                        <span style={{ color: '#6b7280', fontWeight: 'bold', fontSize: '12px' }}>A PAGAR</span>
                        <span style={{ fontSize: '24px', color: '#ef4444', fontWeight: 'bold' }}>R$ {totalPagar.toFixed(2)}</span>
                    </div>
                    <div style={{ ...s.card, borderLeft: '5px solid #10b981' }}>
                        <span style={{ color: '#6b7280', fontWeight: 'bold', fontSize: '12px' }}>PAGO</span>
                        <span style={{ fontSize: '24px', color: '#10b981', fontWeight: 'bold' }}>R$ {totalPago.toFixed(2)}</span>
                    </div>
                </div>

                {/* FORMULÁRIO RESPONSIVO */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginTop: 0, color: '#374151', display: 'flex', alignItems: 'center', gap: '10px' }}><FaPlus size={14} /> Nova Despesa</h3>

                    <form onSubmit={handleSubmit} style={s.form}>

                        <div style={{ ...s.inputGroup, flex: 2 }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Descrição</label>
                            <input type="text" name="descricao" required value={novaDespesa.descricao} onChange={handleInputChange} style={s.input} />
                        </div>

                        <div style={s.inputGroup}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Nº Doc</label>
                            <input type="text" name="numero_documento" value={novaDespesa.numero_documento} onChange={handleInputChange} placeholder="Ex: 12345" style={s.input} />
                        </div>

                        <div style={s.inputGroup}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Valor (R$)</label>
                            <input type="number" name="valor" step="0.01" required value={novaDespesa.valor} onChange={handleInputChange} style={s.input} />
                        </div>

                        <div style={s.inputGroup}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Vencimento</label>
                            <input type="date" name="data_vencimento" required value={novaDespesa.data_vencimento} onChange={handleInputChange} style={s.input} />
                        </div>

                        <div style={s.inputGroup}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Categoria</label>
                            <select name="tipo" value={novaDespesa.tipo} onChange={handleInputChange} style={{ ...s.input, backgroundColor: 'white' }}>
                                <option value="MERCADORIA">Mercadoria / Fornecedor</option>
                                <option value="AGUA">Água</option>
                                <option value="LUZ">Luz / Energia</option>
                                <option value="INTERNET">Internet</option>
                                <option value="ALUGUEL">Aluguel</option>
                                <option value="FUNCIONARIOS">Funcionários</option>
                                <option value="MANUTENCAO">Manutenção</option>
                                <option value="IMPOSTOS">Impostos</option>
                                <option value="OUTRO">Outros</option>
                            </select>
                        </div>

                        <div style={s.inputGroup}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Situação</label>
                            <select name="situacao" value={novaDespesa.situacao} onChange={handleInputChange} style={{ ...s.input, backgroundColor: 'white' }}>
                                <option value="PENDENTE">Pendente</option>
                                <option value="PAGO">Pago</option>
                            </select>
                        </div>

                        <button type="submit" style={{ padding: '12px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: isMobile ? '100%' : 'auto' }}>
                            Salvar
                        </button>
                    </form>
                </div>

                {/* TABELA COM SCROLL */}
                <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <tr>
                                <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', color: '#6b7280' }}>DESCRIÇÃO</th>
                                <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', color: '#6b7280' }}>CATEGORIA</th>
                                <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', color: '#6b7280' }}>VENCIMENTO</th>
                                <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', color: '#6b7280' }}>VALOR</th>
                                <th style={{ padding: '15px', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>STATUS</th>
                                <th style={{ padding: '15px', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {despesasFiltradas.length > 0 ? (
                                despesasFiltradas.map(d => (
                                    <tr key={d.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '15px', fontWeight: '500' }}>{d.descricao}</td>
                                        <td style={{ padding: '15px', fontSize: '12px', color: '#6b7280' }}>
                                            {d.tipo === 'MERCADORIA' ? '📦 Mercadoria' :
                                                d.tipo === 'AGUA' ? '💧 Água' :
                                                    d.tipo === 'LUZ' ? '⚡ Luz' :
                                                        d.tipo === 'INTERNET' ? '🌐 Internet' :
                                                            d.tipo === 'ALUGUEL' ? '🏠 Aluguel' :
                                                                d.tipo === 'FUNCIONARIOS' ? '👥 Equipe' :
                                                                    d.tipo}
                                        </td>
                                        <td style={{ padding: '15px' }}>{d.data_vencimento ? new Date(d.data_vencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}</td>
                                        <td style={{ padding: '15px', fontWeight: 'bold' }}>R$ {parseFloat(d.valor).toFixed(2)}</td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            <span style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', background: d.situacao === 'PAGO' ? '#dcfce7' : '#fee2e2', color: d.situacao === 'PAGO' ? '#166534' : '#991b1b' }}>
                                                {d.situacao}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                            {d.situacao === 'PENDENTE' && (
                                                <button onClick={() => marcarComoPago(d.id)} style={{ marginRight: '10px', border: 'none', background: 'none', color: '#059669', cursor: 'pointer' }}><FaCheckCircle size={18} /></button>
                                            )}
                                            <button onClick={() => excluirDespesa(d.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><FaTrash size={16} /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#999' }}>Nenhuma conta encontrada.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

export default Financeiro;