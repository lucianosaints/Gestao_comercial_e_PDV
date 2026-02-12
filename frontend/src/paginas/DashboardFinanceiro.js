import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../Sidebar';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { FaArrowUp, FaArrowDown, FaMoneyBillWave, FaChartPie, FaShoppingCart } from 'react-icons/fa';
import API_BASE_URL from '../config';

function DashboardFinanceiro() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) setIsSidebarCollapsed(true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('access_token');
            try {
                const response = await axios.get(`${API_BASE_URL}/api/dashboard-financeiro/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(response.data);
            } catch (error) {
                console.error("Erro ao carregar dashboard", error);
                window.debugError = error.message + (error.response ? ` (Status: ${error.response.status} - ${JSON.stringify(error.response.data)})` : "");
                setData(null); // Ensure data is null to trigger error view
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    // --- ESTILOS ---
    const s = {
        container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' },
        main: {
            flex: 1,
            marginLeft: isSidebarCollapsed ? '80px' : '260px',
            padding: isMobile ? '15px' : '30px',
            transition: 'all 0.3s ease',
            width: '100%',
        },
        header: { marginBottom: '30px' },
        title: { fontSize: '28px', color: '#1e293b', margin: 0 },
        subtitle: { color: '#64748b', fontSize: '14px' },

        kpiGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: '20px',
            marginBottom: '30px'
        },
        kpiCard: {
            background: 'white', padding: '20px', borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            borderLeft: '4px solid transparent' // placeholder
        },
        kpiLabel: { fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' },
        kpiValue: { fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginTop: '5px' },

        chartGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
            gap: '20px',
            marginBottom: '30px'
        },
        chartCard: {
            background: 'white', padding: '20px', borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            minHeight: '400px',
            display: 'flex', flexDirection: 'column'
        },
        chartTitle: { fontSize: '16px', fontWeight: 'bold', color: '#334155', marginBottom: '20px' }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Carregando...</div>;
    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Carregando...</div>;
    if (!data) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px', color: '#ef4444' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Erro ao carregar dados</h2>
            <p style={{ fontSize: '16px' }}>{window.debugError || "Verifique sua conexão ou contate o suporte."}</p>
        </div>
    );

    const { kpis, grafico_mensal, grafico_pizza, top_produtos } = data;

    return (
        <div style={s.container}>
            <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
            <main style={s.main}>
                <div style={s.header}>
                    <h1 style={s.title}>Dashboard Financeiro</h1>
                    <span style={s.subtitle}>Visão estratégica dos últimos 6 meses</span>
                </div>

                {/* KPIs */}
                <div style={s.kpiGrid}>
                    <div style={{ ...s.kpiCard, borderLeftColor: '#3b82f6' }}>
                        <div style={s.kpiLabel}>Receita Total (6 meses)</div>
                        <div style={s.kpiValue}>R$ {kpis.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <FaArrowUp color="#3b82f6" style={{ marginTop: '10px' }} />
                    </div>

                    <div style={{ ...s.kpiCard, borderLeftColor: '#ef4444' }}>
                        <div style={s.kpiLabel}>Despesas Totais (6 meses)</div>
                        <div style={{ ...s.kpiValue, color: '#ef4444' }}>R$ {kpis.despesa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <FaArrowDown color="#ef4444" style={{ marginTop: '10px' }} />
                    </div>

                    <div style={{ ...s.kpiCard, borderLeftColor: kpis.saldo >= 0 ? '#10b981' : '#ef4444' }}>
                        <div style={s.kpiLabel}>Lucro Operacional</div>
                        <div style={{ ...s.kpiValue, color: kpis.saldo >= 0 ? '#10b981' : '#ef4444' }}>
                            R$ {kpis.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <FaMoneyBillWave color={kpis.saldo >= 0 ? '#10b981' : '#ef4444'} style={{ marginTop: '10px' }} />
                    </div>

                    <div style={{ ...s.kpiCard, borderLeftColor: '#f59e0b' }}>
                        <div style={s.kpiLabel}>Ticket Médio</div>
                        <div style={s.kpiValue}>R$ {kpis.ticket_medio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <FaShoppingCart color="#f59e0b" style={{ marginTop: '10px' }} />
                    </div>
                </div>

                {/* GRÁFICOS */}
                <div style={s.chartGrid}>
                    {/* BARRAS: Receita x Despesa */}
                    <div style={s.chartCard}>
                        <div style={s.chartTitle}>Fluxo de Caixa Mensal</div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={grafico_mensal}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="mes" fontSize={12} />
                                <YAxis fontSize={12} />
                                <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                                <Legend />
                                <Bar dataKey="receita" name="Receita" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="despesa" name="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* PIZZA: Categorias de Despesa */}
                    <div style={s.chartCard}>
                        <div style={s.chartTitle}>Despesas por Categoria</div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={grafico_pizza}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {grafico_pizza.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* TOP PRODUTOS */}
                <div style={s.chartCard}>
                    <div style={s.chartTitle}>Top 5 Produtos Mais Vendidos</div>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {top_produtos.map((p, index) => (
                            <li key={index} style={{
                                display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                                borderBottom: '1px solid #f1f5f9'
                            }}>
                                <span style={{ color: '#334155' }}>
                                    <span style={{ fontWeight: 'bold', color: '#cbd5e1', marginRight: '10px' }}>#{index + 1}</span>
                                    {p.nome}
                                </span>
                                <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>{p.qtd} unid.</span>
                            </li>
                        ))}
                    </ul>
                </div>

            </main>
        </div>
    );
}

export default DashboardFinanceiro;