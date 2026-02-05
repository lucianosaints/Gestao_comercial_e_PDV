import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import CadastroCliente from './CadastroCliente';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaUser, FaPhone, FaMapMarkerAlt, FaBars } from 'react-icons/fa';
import './Clientes.css'; // Novo CSS bonito
import API_BASE_URL from './config';

function Clientes() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [clientes, setClientes] = useState([]);
    const [busca, setBusca] = useState('');
    const [modalAberto, setModalAberto] = useState(false);
    const [clienteEdicao, setClienteEdicao] = useState(null);

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) setIsSidebarCollapsed(true);
        };
        window.addEventListener('resize', handleResize);
        carregarClientes();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const carregarClientes = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await axios.get(`${API_BASE_URL}/api/clientes/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClientes(response.data);
        } catch (error) {
            console.error("Erro ao carregar clientes", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir este cliente?")) return;
        const token = localStorage.getItem('access_token');
        try {
            await axios.delete(`${API_BASE_URL}/api/clientes/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            carregarClientes();
        } catch (error) {
            console.error("Erro ao excluir", error);
            alert("Erro ao excluir. Pode estar vinculado a vendas.");
        }
    };



    const clientesFiltrados = clientes.filter(c =>
        c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        c.cpf_cnpj.includes(busca) ||
        (c.telefone && c.telefone.includes(busca))
    );

    return (
        <div className="clientes-container">
            <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />

            <main className="clientes-main" style={{ marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '80px' : '260px') }}>
                <div className="clientes-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {isMobile && <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}><FaBars /></button>}
                        <h1 className="clientes-title">Clientes</h1>
                    </div>

                    <div className="clientes-controls">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Buscar por nome, CPF ou telefone..."
                                className="search-input"
                                value={busca}
                                onChange={e => setBusca(e.target.value)}
                            />
                        </div>
                        <button className="btn-add-cliente" onClick={() => { setClienteEdicao(null); setModalAberto(true); }}>
                            <FaPlus /> Novo Cliente
                        </button>
                    </div>
                </div>

                <div className="clientes-grid">
                    {clientesFiltrados.map(cliente => (
                        <div key={cliente.id} className="cliente-card">
                            <div className="card-actions">
                                <button className="btn-icon btn-edit" onClick={() => { setClienteEdicao(cliente); setModalAberto(true); }} title="Editar">
                                    <FaEdit />
                                </button>
                                <button className="btn-icon btn-delete" onClick={() => handleDelete(cliente.id)} title="Excluir">
                                    <FaTrash />
                                </button>
                            </div>

                            <div className="card-header">
                                <div className="cliente-avatar">
                                    <FaUser />
                                </div>
                                <div className="cliente-info">
                                    <h3>{cliente.nome}</h3>
                                    <span className="cliente-cpf">{cliente.cpf_cnpj}</span>
                                </div>
                            </div>

                            <div className="card-details">
                                <div className="detail-item">
                                    <FaPhone className="detail-icon" />
                                    <span>{cliente.telefone || 'Sem telefone'}</span>
                                </div>
                                <div className="detail-item">
                                    <FaMapMarkerAlt className="detail-icon" />
                                    <span>{cliente.endereco || 'Sem endereço'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {modalAberto && (
                <CadastroCliente
                    onClose={() => setModalAberto(false)}
                    aoSalvar={carregarClientes}
                    clienteEdicao={clienteEdicao}
                />
            )}
        </div>
    );
}

export default Clientes;