import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Legend
} from 'recharts';
import {
    FaBoxOpen, FaStore, FaWarehouse, FaLayerGroup,
    FaCashRegister, FaUsers, FaChartLine, FaPlusCircle, FaBars, FaExclamationTriangle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from './config';

// NÃO IMPORTAMOS CSS EXTERNO, USAMOS ESTILO DIRETO
// import './Dashboard.css'; 

function Dashboard() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    // --- LÓGICA DE PERMISSÃO ---
    const cargo = localStorage.getItem('user_role') || 'vendedor';
    const isGerente = cargo === 'gerente';
    // ---------------------------

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) setIsSidebarCollapsed(true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [resumo, setResumo] = useState({
        total_bens: 0,
        total_unidades: 0,
        total_salas: 0,
        total_categorias: 0
    });
    const [dadosGrafico, setDadosGrafico] = useState([]);

    const navigate = useNavigate();

    const CORES_GRAFICO = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4'];

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    useEffect(() => {
        carregarDadosReais();
    }, []);

    const carregarDadosReais = async () => {
        const token = localStorage.getItem('access_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            const res = await axios.get(`${API_BASE_URL}/api/dashboard-resumo/`, config);
            console.log("Resumo Data:", res.data);
            setResumo(res.data);
        } catch (e) { console.error("Erro resumo:", e); }

        try {
            const resGraf = await axios.get(`${API_BASE_URL}/api/grafico-vendas/`, config);
            if (resGraf.data && resGraf.data.length > 0 && resGraf.data[0].name !== 'Sem Vendas') {
                setDadosGrafico(resGraf.data);
            } else {
                setDadosGrafico([]);
            }
        } catch (e) {
            console.error("Erro gráfico:", e);
        }
    };

    // --- ESTILOS VISUAIS PARA CORRIGIR O LAYOUT ---
    const styles = {
        container: {
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: '#f3f4f6'
        },
        mainContent: {
            flex: 1,
            // ESTA É A CORREÇÃO: Empurra o conteúdo baseado no tamanho do menu
            marginLeft: isMobile ? '0px' : (isSidebarCollapsed ? '80px' : '260px'),
            padding: '30px',
            transition: 'margin-left 0.3s ease',
            overflowX: 'hidden' // Evita barra de rolagem horizontal
        },
        // Estilos dos Cards Coloridos
        gridCards: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
        },
        card: (cor1, cor2) => ({
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            background: `linear-gradient(135deg, ${cor1}, ${cor2})`,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            height: '120px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }),
        iconBg: {
            background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px'
        },
        // Estilos dos Atalhos
        gridShortcuts: {
            display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '30px'
        },
        btnShortcut: {
            background: 'white', padding: '15px 25px', borderRadius: '10px',
            border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '10px',
            cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            fontWeight: '600', color: '#374151'
        }
    };

    return (
        <div style={styles.container}>
            <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />

            <main style={styles.mainContent}>
                {isMobile && (
                    <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                        <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#374151', cursor: 'pointer', marginRight: '15px' }}>
                            <FaBars />
                        </button>
                        <h1 style={{ margin: 0, color: '#1f2937', fontSize: '20px' }}>Visão Geral</h1>
                    </div>
                )}
                {!isMobile && <h1 style={{ marginBottom: '25px', color: '#1f2937' }}>Visão Geral do Sistema</h1>}

                {/* CARDS METRICAS */}
                <div style={styles.gridCards}>
                    <div style={styles.card('#10b981', '#059669')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '12px' }}>TOTAL DE PRODUTOS</span>
                            <div style={styles.iconBg}><FaBoxOpen /></div>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{resumo.total_bens}</div>
                        <small style={{ opacity: 0.8 }}>Itens cadastrados</small>
                    </div>

                    <div style={styles.card('#ef4444', '#dc2626')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '12px' }}>LOJAS / FILIAIS</span>
                            <div style={styles.iconBg}><FaStore /></div>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{resumo.total_unidades}</div>
                        <small style={{ opacity: 0.8 }}>Pontos de venda</small>
                    </div>

                    <div style={styles.card('#3b82f6', '#2563eb')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '12px' }}>LOCAIS DE ESTOQUE</span>
                            <div style={styles.iconBg}><FaWarehouse /></div>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{resumo.total_salas}</div>
                        <small style={{ opacity: 0.8 }}>Prateleiras e Depósitos</small>
                    </div>

                    <div style={styles.card('#06b6d4', '#0891b2')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '12px' }}>DEPARTAMENTOS</span>
                            <div style={styles.iconBg}><FaLayerGroup /></div>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{resumo.total_categorias}</div>
                        <small style={{ opacity: 0.8 }}>Categorias ativas</small>
                    </div>

                    {/* CARD DE ALERTA DE ESTOQUE (NOVO) */}
                    <div style={styles.card('#f59e0b', '#d97706')}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '12px' }}>ALERTA DE ESTOQUE</span>
                            <div style={styles.iconBg}><FaBoxOpen /></div>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{resumo.alertas_estoque || 0}</div>
                        <small style={{ opacity: 0.8 }}>Itens com estoque baixo</small>
                    </div>
                </div>

                {/* ATALHOS */}
                <div style={{ marginBottom: '30px' }}>
                    <h4 style={{ marginBottom: '15px', color: '#374151' }}>Acesso Rápido</h4>
                    <div style={styles.gridShortcuts}>
                        <div style={styles.btnShortcut} onClick={() => navigate('/vendas')}>
                            <FaCashRegister color="#10b981" size={20} />
                            <span>PDV (Nova Venda)</span>
                        </div>
                        <div style={styles.btnShortcut} onClick={() => navigate('/bens')}>
                            <FaPlusCircle color="#3b82f6" size={20} />
                            <span>Ver Produtos</span>
                        </div>
                        <div style={styles.btnShortcut} onClick={() => navigate('/bens?alerta=true')}>
                            <FaExclamationTriangle color="#ef4444" size={20} />
                            <span>Estoque Baixo</span>
                        </div>

                        {isGerente && (
                            <>
                                <div style={styles.btnShortcut} onClick={() => navigate('/gestores')}>
                                    <FaUsers color="#6366f1" size={20} />
                                    <span>Gestores</span>
                                </div>
                                <div style={styles.btnShortcut} onClick={() => navigate('/financeiro')}>
                                    <FaChartLine color="#f59e0b" size={20} />
                                    <span>Financeiro</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* GRÁFICOS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        <div style={{ marginBottom: '20px', fontWeight: 'bold', color: '#374151' }}>Top Produtos Mais Vendidos</div>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={dadosGrafico}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                    <Bar dataKey="vendas" radius={[4, 4, 0, 0]} barSize={40}>
                                        {dadosGrafico.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CORES_GRAFICO[index % CORES_GRAFICO.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        <div style={{ marginBottom: '20px', fontWeight: 'bold', color: '#374151' }}>Participação nas Vendas</div>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={dadosGrafico}
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="vendas"
                                    >
                                        {dadosGrafico.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CORES_GRAFICO[index % CORES_GRAFICO.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                                    <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;