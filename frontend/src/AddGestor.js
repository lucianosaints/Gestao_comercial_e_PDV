import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaUserPlus, FaSave, FaArrowLeft, FaStore, FaIdCard, FaEnvelope, FaUser, FaLock, FaUserTag } from 'react-icons/fa';

function AddGestor() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    password: '',
    unidade: '',
    cargo: 'vendedor' // Valor padrão
  });
  const [listaUnidades, setListaUnidades] = useState([]);

  useEffect(() => {
    const carregarUnidades = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/unidades/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setListaUnidades(response.data);
            if (response.data.length > 0) setFormData(prev => ({ ...prev, unidade: response.data[0].id }));
        } catch (error) { console.error("Erro ao carregar lojas", error); }
    };
    carregarUnidades();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const dadosParaEnviar = { ...formData, password: formData.password || 'mudar123' };

    try {
      await axios.post('http://127.0.0.1:8000/api/gestores/', dadosParaEnviar, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Usuário cadastrado com sucesso!');
      navigate('/gestores');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao cadastrar. Verifique os dados.');
    }
  };

  const s = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' },
    main: { flex: 1, marginLeft: isSidebarCollapsed ? '80px' : '260px', padding: '30px', transition: 'margin-left 0.3s ease' },
    card: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', maxWidth: '600px', margin: '0 auto' },
    label: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151', fontSize: '14px' },
    inputGroup: { marginBottom: '20px' },
    inputWrapper: { display: 'flex', alignItems: 'center', position: 'relative' },
    iconInput: { position: 'absolute', left: '12px', color: '#9ca3af' },
    input: { width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize:'15px', outline: 'none' },
    select: { width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize:'15px', backgroundColor: 'white' }
  };

  return (
    <div style={s.container}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      <main style={s.main}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', maxWidth:'600px', margin:'0 auto 25px auto'}}>
            <h1 style={{margin: 0, color:'#1f2937', display:'flex', alignItems:'center', gap:'10px'}}><FaUserPlus style={{color:'#2563eb'}}/> Novo Usuário</h1>
            <button onClick={() => navigate('/gestores')} style={{background: '#6b7280', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}><FaArrowLeft /> Voltar</button>
        </div>

        <form onSubmit={handleSubmit} style={s.card}>
            {/* Campos Pessoais */}
            <div style={s.inputGroup}><label style={s.label}>Nome Completo *</label><div style={s.inputWrapper}><FaUser style={s.iconInput}/><input type="text" name="nome" required value={formData.nome} onChange={handleChange} placeholder="Ex: João da Silva" style={s.input} /></div></div>
            <div style={s.inputGroup}><label style={s.label}>CPF (Login) *</label><div style={s.inputWrapper}><FaIdCard style={s.iconInput}/><input type="text" name="cpf" required value={formData.cpf} onChange={handleChange} placeholder="Apenas números" style={s.input} /></div></div>
            <div style={s.inputGroup}><label style={s.label}>E-mail *</label><div style={s.inputWrapper}><FaEnvelope style={s.iconInput}/><input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="joao@sakura.com" style={s.input} /></div></div>
            
            {/* --- AQUI ESTÁ A NOVIDADE: O MENU DE CARGOS --- */}
            <div style={s.inputGroup}>
                <label style={s.label}>Nível de Acesso (Cargo) *</label>
                <div style={s.inputWrapper}>
                    <FaUserTag style={s.iconInput}/>
                    <select name="cargo" value={formData.cargo} onChange={handleChange} required style={s.select}>
                        <option value="vendedor">Vendedor (Limitado)</option>
                        <option value="estoque">Estoquista (Só Estoque)</option>
                        <option value="gerente">Gerente Geral (Acesso Total)</option>
                    </select>
                </div>
            </div>
            {/* ----------------------------------------------- */}

            <div style={s.inputGroup}><label style={s.label}>Vincular à Loja *</label><div style={s.inputWrapper}><FaStore style={s.iconInput}/><select name="unidade" value={formData.unidade} onChange={handleChange} required style={s.select}><option value="">Selecione...</option>{listaUnidades.map(uni => (<option key={uni.id} value={uni.id}>{uni.nome}</option>))}</select></div></div>
            <div style={s.inputGroup}><label style={s.label}>Senha (Opcional)</label><div style={s.inputWrapper}><FaLock style={s.iconInput}/><input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Padrão: mudar123" style={s.input} /></div><small style={{color:'#6b7280', fontSize:'12px', marginTop:'5px', display:'block'}}>Se deixar vazio, a senha será <b>mudar123</b></small></div>
            
            <div style={{marginTop:'10px', display:'flex', justifyContent:'flex-end'}}><button type="submit" style={{background: '#2563eb', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}><FaSave /> Salvar Usuário</button></div>
        </form>
      </main>
    </div>
  );
}
export default AddGestor;