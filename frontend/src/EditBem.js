import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaBox, FaSave, FaArrowLeft, FaTruck, FaCamera, FaSpinner } from 'react-icons/fa';
// Não dependemos mais do CSS externo para o layout principal
import './Dashboard.css'; 
import API_BASE_URL from './config';

function EditBem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para as listas
  const [unidades, setUnidades] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [salas, setSalas] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);

  // Estados Imagem
  const [previewUrl, setPreviewUrl] = useState(null);
  const [novaImagemFile, setNovaImagemFile] = useState(null);

  // Estado Formulário
  const [formData, setFormData] = useState({
    nome: '', descricao: '', codigo_barras: '', valor: '', quantidade: 0,
    unidade: '', categoria: '', sala: '', fornecedor: '',
    preco_custo: '', margem_lucro: ''
  });

  // Função de Carga
  const carregarDados = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      setIsLoading(true);
      const [resUni, resCat, resSalas, resForn] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/unidades/`, config),
        axios.get(`${API_BASE_URL}/api/categorias/`, config),
        axios.get(`${API_BASE_URL}/api/salas/`, config),
        axios.get(`${API_BASE_URL}/api/fornecedores/`, config)
      ]);

      setUnidades(resUni.data);
      setCategorias(resCat.data);
      setSalas(resSalas.data);
      setFornecedores(resForn.data);

      const response = await axios.get(`${API_BASE_URL}/api/bens/${id}/`, config);
      const produto = response.data;

      setFormData({
        nome: produto.nome,
        descricao: produto.descricao || '',
        codigo_barras: produto.codigo_barras || '',
        valor: produto.valor,
        quantidade: produto.quantidade,
        unidade: produto.unidade,
        categoria: produto.categoria,
        sala: produto.sala || '',
        fornecedor: produto.fornecedor || '',
        preco_custo: produto.preco_custo || '',
        margem_lucro: produto.margem_lucro || ''
      });

      if (produto.imagem) {
          const imgUrl = produto.imagem.startsWith('http') ? produto.imagem : `${API_BASE_URL}${produto.imagem}`;
          setPreviewUrl(imgUrl);
      }

    } catch (error) {
      console.error("Erro ao carregar produto:", error);
      alert("Erro ao carregar dados do produto.");
      navigate('/bens');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const calcularPrecoFinal = (custo, margem) => {
    const valorCusto = parseFloat(custo) || 0;
    const valorMargem = parseFloat(margem) || 0;
    return (valorCusto + (valorCusto * (valorMargem / 100))).toFixed(2);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'imagem') {
        const arquivo = files[0];
        if (arquivo) {
            setNovaImagemFile(arquivo);
            setPreviewUrl(URL.createObjectURL(arquivo));
        }
    } else if (name === 'unidade') {
        setFormData({ ...formData, unidade: value, sala: '' });
    } else if (name === 'preco_custo' || name === 'margem_lucro') {
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
        if (formData[key] !== null && formData[key] !== undefined) {
            data.append(key, formData[key]);
        }
    }

    if (novaImagemFile) {
        data.append('imagem', novaImagemFile);
    }

    try {
      await axios.put(`${API_BASE_URL}/api/bens/${id}/`, data, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
      });
      alert('Produto atualizado com sucesso!');
      navigate('/bens');
    } catch (error) {
      console.error("Erro ao atualizar:", error.response ? error.response.data : error);
      alert('Erro ao atualizar produto.');
    }
  };

  // --- ESTILOS DE LAYOUT (A CORREÇÃO MÁGICA) ---
  const s = {
      container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' },
      mainContent: {
          flex: 1,
          marginLeft: isSidebarCollapsed ? '80px' : '260px', // AQUI GARANTE QUE NÃO FICA EM CIMA
          padding: '30px',
          transition: 'margin-left 0.3s ease',
          overflowX: 'hidden'
      }
  };

  if (isLoading) {
      return <div style={{display:'flex', justifyContent:'center', marginTop:'50px'}}><FaSpinner className="spinner" size={30}/> Carregando...</div>;
  }

  return (
    <div style={s.container}>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      
      <main style={s.mainContent}>
        <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'20px'}}>
            <button onClick={() => navigate('/bens')} style={{border:'none', background:'none', fontSize:'20px', cursor:'pointer', color:'#6b7280'}}>
                <FaArrowLeft />
            </button>
            <h1 style={{fontSize:'24px', margin:0, color: '#1f2937'}}>Editar Produto</h1>
        </div>

        <form onSubmit={handleSubmit} style={{background:'white', padding:'30px', borderRadius:'12px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
            
            <h3 style={{color:'#3b82f6', marginBottom:'15px', display:'flex', alignItems:'center', gap:'8px'}}>
                <FaBox /> Dados Principais
            </h3>
            
            <div style={{display:'flex', gap:'20px', marginBottom:'20px', flexWrap:'wrap'}}>
                <div style={{flex: 2, minWidth:'250px'}}>
                    <label className="form-label">Nome do Produto</label>
                    <input type="text" name="nome" className="form-input" required value={formData.nome} onChange={handleChange} />
                </div>
                <div style={{flex: 1, minWidth:'150px'}}>
                    <label className="form-label">Código de Barras / SKU</label>
                    <input type="text" name="codigo_barras" className="form-input" value={formData.codigo_barras} onChange={handleChange} />
                </div>
            </div>

            {/* ÁREA DA IMAGEM */}
            <div style={{marginBottom: '25px'}}>
                <label className="form-label" style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color:'#374151'}}>Imagem do Produto</label>
                
                <div style={{display:'flex', gap:'20px', alignItems:'flex-start', flexWrap:'wrap'}}>
                    <label style={{flex: 1, minWidth:'200px', display: 'flex', flexDirection:'column', alignItems: 'center', gap: '10px', cursor: 'pointer', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '2px dashed #cbd5e1', justifyContent:'center', textAlign:'center', transition:'all 0.2s'}}>
                        <FaCamera size={30} color="#64748b" />
                        <div style={{color: '#475569', fontWeight: '600'}}>
                            {previewUrl ? "Clique para alterar a foto" : "Clique para adicionar uma foto"}
                        </div>
                        <input type="file" name="imagem" accept="image/*" onChange={handleChange} style={{display: 'none'}} />
                    </label>

                    {previewUrl && (
                        <div style={{flex: 1, minWidth:'200px', display: 'flex', justifyContent: 'center', alignItems:'center', background:'#f1f5f9', padding:'10px', borderRadius:'8px', border:'1px solid #e2e8f0', height:'150px'}}>
                            <img src={previewUrl} alt="Preview" style={{maxWidth: '100%', maxHeight: '100%', borderRadius: '4px', objectFit:'contain'}} />
                        </div>
                    )}
                </div>
            </div>

            {/* FORMAÇÃO DE PREÇO */}
            <div style={{background:'#eff6ff', padding:'20px', borderRadius:'8px', marginBottom:'25px', border:'1px solid #dbeafe'}}>
                <h4 style={{margin:'0 0 15px 0', color:'#1e40af'}}>Formação de Preço</h4>
                <div style={{display:'flex', gap:'20px', flexWrap:'wrap', alignItems:'flex-end'}}>
                    <div style={{flex:1}}>
                        <label className="form-label">Preço de Custo (R$)</label>
                        <input type="number" name="preco_custo" className="form-input" value={formData.preco_custo} onChange={handleChange} />
                    </div>
                    <div style={{flex:1}}>
                        <label className="form-label">Margem de Lucro (%)</label>
                        <input type="number" name="margem_lucro" className="form-input" value={formData.margem_lucro} onChange={handleChange} />
                    </div>
                    <div style={{flex:1}}>
                        <label className="form-label" style={{color:'#059669', fontWeight:'bold'}}>Preço Final (R$)</label>
                        <input type="number" name="valor" className="form-input" style={{borderColor:'#10b981', background:'#ecfdf5', fontWeight:'bold', color:'#064e3b'}} value={formData.valor} onChange={handleChange} required />
                    </div>
                </div>
            </div>

            <h3 style={{color:'#3b82f6', marginBottom:'15px', marginTop:'30px', display:'flex', alignItems:'center', gap:'8px'}}>
                <FaTruck /> Estoque e Origem
            </h3>

            <div style={{display:'flex', gap:'20px', marginBottom:'20px', flexWrap:'wrap'}}>
                 <div style={{flex: 1, minWidth:'200px'}}>
                    <label className="form-label">Fornecedor</label>
                    <select name="fornecedor" className="form-input" value={formData.fornecedor} onChange={handleChange}>
                        <option value="">Selecione...</option>
                        {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                    </select>
                </div>
                <div style={{flex: 1, minWidth:'200px'}}>
                    <label className="form-label">Loja / Filial</label>
                    <select name="unidade" className="form-input" required value={formData.unidade} onChange={handleChange}>
                        <option value="">Selecione...</option>
                        {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                    </select>
                </div>
                <div style={{flex: 1, minWidth:'200px'}}>
                    <label className="form-label">Localização</label>
                    <select name="sala" className="form-input" value={formData.sala} onChange={handleChange}>
                        <option value="">Selecione a Loja primeiro</option>
                        {salas.filter(s => s.unidade.toString() === formData.unidade.toString()).map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                    </select>
                </div>
            </div>

            <div style={{display:'flex', gap:'20px', marginBottom:'20px'}}>
                <div style={{flex: 1}}>
                    <label className="form-label">Categoria</label>
                    <select name="categoria" className="form-input" required value={formData.categoria} onChange={handleChange}>
                        <option value="">Selecione...</option>
                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                </div>
                <div style={{flex: 1}}>
                    <label className="form-label">Qtd. em Estoque</label>
                    <input type="number" name="quantidade" className="form-input" required value={formData.quantidade} onChange={handleChange} />
                </div>
            </div>

            <hr style={{margin:'30px 0', border:'0', borderTop:'1px solid #e5e7eb'}}/>

            <div style={{display:'flex', justifyContent:'flex-end'}}>
                <button type="submit" style={{
                    background:'#2563eb', color:'white', padding:'12px 25px', borderRadius:'8px', border:'none', 
                    fontSize:'16px', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px'
                }}>
                    <FaSave /> Atualizar Produto
                </button>
            </div>
        </form>
      </main>
    </div>
  );
}

export default EditBem;