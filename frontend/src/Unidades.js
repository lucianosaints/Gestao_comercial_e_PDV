import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import {
    FaStore, FaMapMarkerAlt, FaPlus, FaArrowLeft, FaTrash, FaBuilding, FaBars
} from 'react-icons/fa';
import './Unidades.css';
import API_BASE_URL from './config';

function Unidades() {
    const [unidades, setUnidades] = useState([]);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) setIsSidebarCollapsed(true);
        };
        window.addEventListener('resize', handleResize);
        carregarUnidades();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const carregarUnidades = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await axios.get(`${API_BASE_URL}/api/unidades/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnidades(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Erro ao carregar unidades", error);
            setLoading(false);
        }
    };

    const deletarUnidade = async (id) => {
        if (window.confirm("Tem certeza que deseja excluir esta loja?")) {
            const token = localStorage.getItem('access_token');
            try {
                await axios.delete(`${API_BASE_URL}/api/unidades/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                carregarUnidades();
            } catch (error) {
                alert("Erro ao excluir. Verifique se existem produtos vinculados.");
            }
        }
    };

    return (
        <div className="unidades-container">
            <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />

            <main className="unidades-main" style={{ marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '80px' : '260px') }}>

                {/* CABEÇALHO */}
                <div className="unidades-header">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {isMobile && <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}><FaBars /></button>}
                            <h1 className="unidades-title">
                                Lojas & Filiais
                            </h1>
                        </div>
                        <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '15px' }}>Gerencie os pontos de venda da sua rede.</p>
                    </div>

                    <div className="unidades-controls">
                        <button onClick={() => navigate('/dashboard')} className="btn-back">
                            <FaArrowLeft /> Voltar
                        </button>
                        <button onClick={() => navigate('/add-unidade')} className="btn-add-unidade">
                            <FaPlus /> Nova Loja
                        </button>
                    </div>
                </div>

                {/* LOADING STATE */}
                {loading && <p style={{ textAlign: 'center', color: '#64748b' }}>Carregando lojas...</p>}

                {/* EMPTY STATE */}
                {unidades.length === 0 && !loading && (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', background: 'white', borderRadius: '20px' }}>
                        <FaStore size={60} style={{ opacity: 0.2, marginBottom: '20px' }} />
                        <h3>Nenhuma loja cadastrada</h3>
                        <p>Clique em "Nova Loja" para começar.</p>
                    </div>
                )}

                {/* GRID DE CARDS */}
                <div className="unidades-grid">
                    {unidades.map(unidade => (
                        <div key={unidade.id} className="unidade-card">

                            <div className="card-header">
                                <div className="unidade-icon-box">
                                    <FaStore />
                                </div>
                                <div className="unidade-info">
                                    <h3>{unidade.nome}</h3>
                                    <span className="unidade-id">ID: #{unidade.id}</span>
                                </div>
                            </div>

                            <div className="card-details">
                                <div className="detail-item">
                                    <FaMapMarkerAlt className="detail-icon" />
                                    <span>{unidade.endereco || 'Endereço não informado'}</span>
                                </div>
                            </div>

                            <div className="card-footer">
                                <button
                                    className="btn-action btn-view"
                                    onClick={() => navigate(`/unidades/${unidade.id}`)}
                                    title="Ver Estoque da Loja"
                                >
                                    <FaBuilding /> Ver Estoque
                                </button>
                                <button
                                    className="btn-action btn-delete"
                                    onClick={() => deletarUnidade(unidade.id)}
                                    title="Excluir Loja"
                                >
                                    <FaTrash /> Excluir
                                </button>
                            </div>

                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
}

export default Unidades;