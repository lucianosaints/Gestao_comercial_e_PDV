import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTruck, FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

// --- CORREÇÃO DOS IMPORTS ---
// Como o arquivo está em src/paginas/, voltamos apenas UMA vez para achar o Sidebar na src/
import Sidebar from '../Sidebar'; 
import '../Dashboard.css'; 
import API_BASE_URL from ../config';

function GerenciarFornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);

  // Estado do Formulário
  const [formData, setFormData] = useState({
    nome: '', cnpj_cpf: '', telefone: '', email: ''
  });

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  useEffect(() => {
    carregarFornecedores();
  }, []);

  const carregarFornecedores = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/fornecedores/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFornecedores(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error);
      setLoading(false);
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      if (editandoId) {
        await axios.put(`${API_BASE_URL}/api/fornecedores/${editandoId}/`, formData, config);
        alert("Fornecedor atualizado com sucesso!");
      } else {
        await axios.post(`${API_BASE_URL}/api/fornecedores/', formData, config);
        alert("Fornecedor cadastrado com sucesso!");
      }
      fecharModal();
      carregarFornecedores();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar. Verifique os dados.");
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este fornecedor?")) {
      const token = localStorage.getItem('access_token');
      try {
        await axios.delete(`${API_BASE_URL}/api/fornecedores/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        carregarFornecedores();
      } catch (error) {
        alert("Não foi possível excluir. Talvez ele tenha produtos vinculados.");
      }
    }
  };

  const abrirModal = (fornecedor = null) => {
    if (fornecedor) {
      setFormData(fornecedor);
      setEditandoId(fornecedor.id);
    } else {
      setFormData({ nome: '', cnpj_cpf: '', telefone: '', email: '' });
      setEditandoId(null);
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEditandoId(null);
  };

  // --- ESTILOS DE LAYOUT (GARANTIA DE NÃO QUEBRAR) ---
  const s = {
      container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' },
      mainContent: {
          flex: 1,
          marginLeft: isSidebarCollapsed ? '80px' : '260px', // EMPURRA O CONTEÚDO PARA NÃO FICAR EMBAIXO DO MENU
          padding: '30px',
          transition: 'margin-left 0.3s ease',
          overflowX: 'hidden'
      },
      modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      },
      modalContent: {
        background: 'white', padding: '30px', borderRadius: '12px', width: '450px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)', position: 'relative'
      },
      inputGroup: { marginBottom: '15px' },
      label: { display:'block', marginBottom:'5px', fontSize:'14px', fontWeight:'600', color:'#374151' },
      input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize:'14px' }
  };

  return (
    <div style={s.container}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      
      <main style={s.mainContent}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'25px'}}>
            <div>
                 <h1 style={{margin:0, color:'#1f2937', display:'flex', alignItems:'center', gap:'10px'}}>
                    <FaTruck style={{color:'#3b82f6'}}/> Gerenciar Fornecedores
                 </h1>
                 <p style={{margin:'5px 0 0', color:'#6b7280'}}>Cadastre seus parceiros comerciais.</p>
            </div>
            <button onClick={() => abrirModal()} style={{
                background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', 
                borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'
            }}>
                <FaPlus /> Novo Fornecedor
            </button>
        </div>

        <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead style={{background:'#f9fafb', borderBottom:'1px solid #e5e7eb'}}>
                    <tr>
                        <th style={{padding:'15px', textAlign:'left', fontSize:'13px', color:'#6b7280'}}>NOME / EMPRESA</th>
                        <th style={{padding:'15px', textAlign:'left', fontSize:'13px', color:'#6b7280'}}>CNPJ / CPF</th>
                        <th style={{padding:'15px', textAlign:'left', fontSize:'13px', color:'#6b7280'}}>CONTATO</th>
                        <th style={{padding:'15px', textAlign:'left', fontSize:'13px', color:'#6b7280'}}>EMAIL</th>
                        <th style={{padding:'15px', textAlign:'center', fontSize:'13px', color:'#6b7280'}}>AÇÕES</th>
                    </tr>
                </thead>
                <tbody>
                    {fornecedores.map(f => (
                        <tr key={f.id} style={{borderBottom:'1px solid #f3f4f6'}}>
                            <td style={{padding:'15px', fontWeight: 'bold', color:'#374151'}}>{f.nome}</td>
                            <td style={{padding:'15px', fontFamily:'monospace', color:'#4b5563'}}>{f.cnpj_cpf || '-'}</td>
                            <td style={{padding:'15px', color:'#4b5563'}}>{f.telefone || '-'}</td>
                            <td style={{padding:'15px', color:'#2563eb'}}>{f.email || '-'}</td>
                            <td style={{padding:'15px', textAlign: 'center'}}>
                                <button onClick={() => abrirModal(f)} style={{marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b'}}>
                                    <FaEdit size={18} title="Editar"/>
                                </button>
                                <button onClick={() => handleExcluir(f.id)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444'}}>
                                    <FaTrash size={18} title="Excluir"/>
                                </button>
                            </td>
                        </tr>
                    ))}
                    {fornecedores.length === 0 && !loading && (
                        <tr><td colSpan="5" style={{textAlign:'center', padding:'30px', color:'#9ca3af'}}>Nenhum fornecedor cadastrado.</td></tr>
                    )}
                </tbody>
            </table>
        </div>

        {modalAberto && (
            <div style={s.modalOverlay}>
                <div style={s.modalContent}>
                    <button onClick={fecharModal} style={{position:'absolute', top:'15px', right:'15px', background:'none', border:'none', cursor:'pointer', color:'#9ca3af'}}>
                        <FaTimes size={20}/>
                    </button>
                    
                    <h2 style={{marginTop: 0, marginBottom: '25px', color: '#111827'}}>
                        {editandoId ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                    </h2>
                    
                    <form onSubmit={handleSalvar}>
                        <div style={s.inputGroup}>
                            <label style={s.label}>Nome do Fornecedor</label>
                            <input type="text" required style={s.input} value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} />
                        </div>
                        <div style={s.inputGroup}>
                            <label style={s.label}>CNPJ ou CPF</label>
                            <input type="text" style={s.input} value={formData.cnpj_cpf} onChange={(e) => setFormData({...formData, cnpj_cpf: e.target.value})} />
                        </div>
                        <div style={s.inputGroup}>
                            <label style={s.label}>Telefone / WhatsApp</label>
                            <input type="text" style={s.input} value={formData.telefone} onChange={(e) => setFormData({...formData, telefone: e.target.value})} />
                        </div>
                        <div style={s.inputGroup}>
                            <label style={s.label}>Email</label>
                            <input type="email" style={s.input} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                        </div>

                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop:'25px'}}>
                            <button type="button" onClick={fecharModal} style={{background: '#e5e7eb', color: '#374151', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight:'bold'}}>Cancelar</button>
                            <button type="submit" style={{background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight:'bold', display:'flex', alignItems:'center', gap:'5px'}}>
                                <FaSave /> Salvar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}

export default GerenciarFornecedores;