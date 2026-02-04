import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Clientes.css'; // Usando estilos do módulo Clientes
import './AddBem.css'; // Fallback para inputs padrao
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaMapMarkerAlt, FaSave, FaTimes } from 'react-icons/fa';

function CadastroCliente({ onClose, aoSalvar, clienteEdicao }) {
    const [nome, setNome] = useState('');
    const [cpfCnpj, setCpfCnpj] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [endereco, setEndereco] = useState('');

    useEffect(() => {
        if (clienteEdicao) {
            setNome(clienteEdicao.nome);
            setCpfCnpj(clienteEdicao.cpf_cnpj);
            setTelefone(clienteEdicao.telefone || '');
            setEmail(clienteEdicao.email || '');
            setEndereco(clienteEdicao.endereco || '');
        }
    }, [clienteEdicao]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');

        const dados = { nome, cpf_cnpj: cpfCnpj, telefone, email, endereco };

        try {
            if (clienteEdicao) {
                await axios.put(`http://127.0.0.1:8000/api/clientes/${clienteEdicao.id}/`, dados, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Cliente atualizado com sucesso!");
            } else {
                await axios.post('http://127.0.0.1:8000/api/clientes/', dados, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Cliente cadastrado com sucesso!");
            }
            aoSalvar();
            onClose();
        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
            const msgErro = error.response?.data?.cpf_cnpj ? "Este CPF/CNPJ já está cadastrado." :
                (error.response?.data?.detail || "Erro ao salvar. Verifique os dados.");
            alert(msgErro);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content animate-slide-up">
                <div className="modal-header" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '22px', color: '#1e293b', margin: 0 }}>{clienteEdicao ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                    <button className="close-btn" onClick={onClose} style={{ background: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTimes color="#64748b" /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label><FaUser /> Nome Completo *</label>
                        <input type="text" value={nome} onChange={e => setNome(e.target.value)} required />
                    </div>

                    <div className="form-group-row">
                        <div className="form-group half">
                            <label><FaIdCard /> CPF / CNPJ *</label>
                            <input type="text" value={cpfCnpj} onChange={e => setCpfCnpj(e.target.value)} required />
                        </div>
                        <div className="form-group half">
                            <label><FaPhone /> Telefone / WhatsApp</label>
                            <input type="text" value={telefone} onChange={e => setTelefone(e.target.value)} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label><FaEnvelope /> Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label><FaMapMarkerAlt /> Endereço</label>
                        <textarea value={endereco} onChange={e => setEndereco(e.target.value)} rows="2"></textarea>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-salvar"><FaSave /> Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CadastroCliente;
