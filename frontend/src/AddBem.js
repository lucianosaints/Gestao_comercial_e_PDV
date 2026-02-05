import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaBox, FaSave, FaArrowLeft, FaTruck, FaCamera } from 'react-icons/fa';
import API_BASE_URL from './config';

function AddBem() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);

  // Estados para as listas
  const [unidades, setUnidades] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [salas, setSalas] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  // Estado para ver a imagem na hora
  const [previewImagem, setPreviewImagem] = useState(null);

  // Estado do Formulário
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    codigo_barras: '',
    valor: '',
    quantidade: 1,
    unidade: '',
    categoria: '',
    sala: '',
    fornecedor: '',
    imagem: null,
    preco_custo: '',
    margem_lucro: ''
  });

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const [resUnidades, resCategorias, resSalas, resFornecedores] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/unidades/', config),
        axios.get(`${API_BASE_URL}/api/categorias/', config),
        axios.get(`${API_BASE_URL}/api/salas/', config),
        axios.get(`${API_BASE_URL}/api/fornecedores/', config)
      ]);

      setUnidades(resUnidades.data);
      setCategorias(resCategorias.data);
      setSalas(resSalas.data);
      setFornecedores(resFornecedores.data);
    } catch (error) {
      console.error("Erro ao carregar listas:", error);
    }
  };

  const calcularPrecoFinal = (custo, margem) => {
    const valorCusto = parseFloat(custo) || 0;
    const valorMargem = parseFloat(margem) || 0;
    const precoFinal = valorCusto + (valorCusto * (valorMargem / 100));
    return precoFinal.toFixed(2);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    // --- LÓGICA ESPECIAL PARA A IMAGEM ---
    if (name === 'imagem') {
        const arquivo = files[0];
        setFormData({ ...formData, imagem: arquivo });
        
        if (arquivo) {
            setPreviewImagem(URL.createObjectURL(arquivo));
        } else {
            setPreviewImagem(null);
        }
    }
    // --- LÓGICA PARA UNIDADE (Limpar sala) ---
    else if (name === 'unidade') {
        setFormData({ ...formData, unidade: value, sala: '' });
    } 
    // --- LÓGICA DE PREÇO ---
    else if (name === 'preco_custo' || name === 'margem_lucro') {
        const novoCusto = name === 'preco_custo' ? value : formData.preco_custo;
        const novaMargem = name === 'margem_lucro' ? value : formData.margem_lucro;
        setFormData({
            ...formData,
            [name]: value,
            valor: calcularPrecoFinal(novoCusto, novaMargem)
        });
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    
    const data = new FormData();
    for (const key in formData) {
        if (formData[key] !== null && formData[key] !== '') {
            data.append(key, formData[key]);
        }
    }

    try {
      await axios.post(`${API_BASE_URL}/api/bens/', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Produto cadastrado com sucesso!');
      navigate('/bens');
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert('Erro ao salvar produto. Verifique os campos.');
    }
  };

  // --- ESTILOS DE LAYOUT (A CORREÇÃO QUE FALTAVA) ---
  const s = {
      container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' },
      mainContent: {
          flex: 1,
          marginLeft: isSidebarCollapsed ? '80px' : '260px', // AQUI ESTÁ O SEGREDO
          padding: '30px',
          transition: 'margin-left 0.3s ease',
          overflowX: 'hidden'
      },
      // Mantive seus estilos de formulário originais abaixo para não quebrar o design
      formCard: {
          background:'white', padding:'30px', borderRadius:'12px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'
      },
      input: {
          width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '5px'
      },
      label: {
          fontWeight: 'bold', fontSize: '14px', color: '#374151'
      }
  };

  return (
    <div style={s.container}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />
      
      <main style={s.mainContent}>
        <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'20px'}}>
            <button onClick={() => navigate('/bens')} style={{border:'none', background:'none', fontSize:'20px', cursor:'pointer', color:'#6b7280'}}>
                <FaArrowLeft />
            </button>
            <h1 style={{fontSize:'24px', margin:0, color: '#1f2937'}}>Cadastrar Novo Produto</h1>
        </div>

        <form onSubmit={handleSubmit} style={s.formCard}>
            
            <h3 style={{color:'#3b82f6', marginBottom:'15px', display:'flex', alignItems:'center', gap:'8px'}}>
                <FaBox /> Dados do Produto
            </h3>
            
            <div style={{display:'flex', gap:'20px', marginBottom:'20px', flexWrap:'wrap'}}>
                <div style={{flex: 2, minWidth:'250px'}}>
                    <label style={s.label}>Nome do Produto</label>
                    <input type="text" name="nome" style={s.input} placeholder="Ex: Camiseta Anime X" required value={formData.nome} onChange={handleChange} />
                </div>
                <div style={{flex: 1, minWidth:'150px'}}>
                    <label style={s.label}>Código de Barras / SKU</label>
                    <input type="text" name="codigo_barras" style={s.input} placeholder="Escaneie ou digite..." value={formData.codigo_barras} onChange={handleChange} />
                </div>
            </div>

            {/* --- CAMPO DE IMAGEM --- */}
            <div style={{marginBottom: '25px'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '2px dashed #cbd5e1', justifyContent:'center'}}>
                    <div style={{textAlign:'center'}}>
                        <FaCamera size={30} color="#64748b" style={{marginBottom:'10px'}} />
                        <div style={{color: '#475569', fontWeight: '600'}}>Clique aqui para enviar uma foto</div>
                        <div style={{fontSize:'12px', color:'#94a3b8'}}>Formatos: JPG, PNG</div>
                    </div>
                    <input 
                        type="file" name="imagem" accept="image/*" 
                        onChange={handleChange} style={{display: 'none'}} 
                    />
                </label>
                
                {previewImagem && (
                    <div style={{marginTop: '15px', display: 'flex', justifyContent: 'center', background:'#f1f5f9', padding:'10px', borderRadius:'8px'}}>
                        <img src={previewImagem} alt="Pré-visualização" style={{maxWidth: '200px', maxHeight: '200px', borderRadius: '4px', objectFit:'contain'}} />
                    </div>
                )}
            </div>

            <div style={{background:'#eff6ff', padding:'20px', borderRadius:'8px', marginBottom:'25px', border:'1px solid #dbeafe'}}>
                <h4 style={{margin:'0 0 15px 0', color:'#1e40af'}}>Formação de Preço</h4>
                <div style={{display:'flex', gap:'20px', flexWrap:'wrap', alignItems:'flex-end'}}>
                    <div style={{flex:1}}>
                        <label style={s.label}>Preço de Custo (R$)</label>
                        <input type="number" name="preco_custo" style={s.input} placeholder="0,00" value={formData.preco_custo} onChange={handleChange} />
                    </div>
                    <div style={{flex:1}}>
                        <label style={s.label}>Margem de Lucro (%)</label>
                        <input type="number" name="margem_lucro" style={s.input} placeholder="Ex: 50, 100..." value={formData.margem_lucro} onChange={handleChange} />
                    </div>
                    <div style={{flex:1}}>
                        <label style={{...s.label, color:'#059669'}}>Preço Final de Venda (R$)</label>
                        <input 
                            type="number" name="valor" 
                            style={{...s.input, borderColor:'#10b981', background:'#ecfdf5', fontWeight:'bold', color:'#064e3b'}}
                            value={formData.valor} onChange={handleChange} required 
                        />
                    </div>
                </div>
            </div>

            <h3 style={{color:'#3b82f6', marginBottom:'15px', marginTop:'30px', display:'flex', alignItems:'center', gap:'8px'}}>
                <FaTruck /> Estoque e Origem
            </h3>

            <div style={{display:'flex', gap:'20px', marginBottom:'20px', flexWrap:'wrap'}}>
                <div style={{flex: 1, minWidth:'200px'}}>
                    <label style={s.label}>Fornecedor</label>
                    <select name="fornecedor" style={s.input} value={formData.fornecedor} onChange={handleChange}>
                        <option value="">Selecione o Fornecedor...</option>
                        {fornecedores.map(f => (
                            <option key={f.id} value={f.id}>{f.nome}</option>
                        ))}
                    </select>
                </div>

                <div style={{flex: 1, minWidth:'200px'}}>
                    <label style={s.label}>Loja / Filial</label>
                    <select name="unidade" style={s.input} required value={formData.unidade} onChange={handleChange}>
                        <option value="">Selecione...</option>
                        {unidades.map(u => (
                            <option key={u.id} value={u.id}>{u.nome}</option>
                        ))}
                    </select>
                </div>

                <div style={{flex: 1, minWidth:'200px'}}>
                    <label style={s.label}>Localização (Prateleira)</label>
                    <select name="sala" style={s.input} value={formData.sala} onChange={handleChange}>
                        <option value="">Selecione a Loja primeiro</option>
                        {salas
                            .filter(s => s.unidade.toString() === formData.unidade.toString())
                            .map(s => <option key={s.id} value={s.id}>{s.nome}</option>)
                        }
                    </select>
                </div>
            </div>

            <div style={{display:'flex', gap:'20px', marginBottom:'20px'}}>
                <div style={{flex: 1}}>
                    <label style={s.label}>Categoria</label>
                    <select name="categoria" style={s.input} required value={formData.categoria} onChange={handleChange}>
                        <option value="">Selecione...</option>
                        {categorias.map(c => (
                            <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                    </select>
                </div>
                <div style={{flex: 1}}>
                    <label style={s.label}>Qtd. em Estoque</label>
                    <input type="number" name="quantidade" style={s.input} required value={formData.quantidade} onChange={handleChange} />
                </div>
            </div>

            <hr style={{margin:'30px 0', border:'0', borderTop:'1px solid #e5e7eb'}}/>

            <div style={{display:'flex', justifyContent:'flex-end'}}>
                <button type="submit" style={{
                    background:'#2563eb', color:'white', padding:'12px 25px', borderRadius:'8px', border:'none', 
                    fontSize:'16px', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px'
                }}>
                    <FaSave /> Salvar Produto
                </button>
            </div>
        </form>
      </main>
    </div>
  );
}

export default AddBem;