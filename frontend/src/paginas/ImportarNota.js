import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import Sidebar from '../Sidebar';
import { FaCloudUploadAlt, FaCheck, FaTimes, FaBox, FaExclamationTriangle } from 'react-icons/fa';
import API_BASE_URL from ../config';

function ImportarNota() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
    const [arquivo, setArquivo] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mensagem, setMensagem] = useState(null);

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    const onDrop = (acceptedFiles) => {
        setArquivo(acceptedFiles[0]);
        enviarArquivo(acceptedFiles[0]);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/xml': ['.xml'] },
        multiple: false
    });

    const enviarArquivo = async (file) => {
        setLoading(true);
        setMensagem(null);
        const formData = new FormData();
        formData.append('arquivo', file);
        formData.append('acao', 'preview');

        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post(`${API_BASE_URL}/api/importar-xml/', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setPreviewData(response.data);
        } catch (error) {
            console.error(error);
            setMensagem({ tipo: 'erro', texto: 'Erro ao ler arquivo XML: ' + (error.response?.data?.error || error.message) });
            setArquivo(null);
        } finally {
            setLoading(false);
        }
    };

    const confirmarImportacao = async () => {
        if (!previewData) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post(`${API_BASE_URL}/api/importar-xml/', previewData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMensagem({ tipo: 'sucesso', texto: `Sucesso! ${response.data.salvos} itens salvos/atualizados.` });
            setPreviewData(null);
            setArquivo(null);
        } catch (error) {
            console.error(error);
            setMensagem({ tipo: 'erro', texto: 'Erro ao confirmar importação.' });
        } finally {
            setLoading(false);
        }
    };

    // Atualiza preço sugerido na tabela
    const atualizarPrecoPreview = (index, novoValor) => {
        const novosItens = [...previewData.itens];
        novosItens[index].novo_preco_venda = novoValor;
        setPreviewData({ ...previewData, itens: novosItens });
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            <Sidebar isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />

            <main style={{ flex: 1, padding: '20px', marginLeft: isSidebarCollapsed ? '80px' : '260px', transition: 'margin 0.3s' }}>
                <h1 style={{ color: '#1e293b' }}>Importar Nota Fiscal (XML)</h1>
                <p style={{ color: '#64748b' }}>Arraste o XML da NFe para dar entrada no estoque automaticamente.</p>

                {mensagem && (
                    <div style={{ padding: '15px', borderRadius: '8px', marginBottom: '20px', background: mensagem.tipo === 'erro' ? '#fee2e2' : '#dcfce7', color: mensagem.tipo === 'erro' ? '#991b1b' : '#166534', fontWeight: 'bold' }}>
                        {mensagem.texto}
                    </div>
                )}

                {!previewData ? (
                    <div {...getRootProps()} style={{
                        border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '50px', textAlign: 'center',
                        background: isDragActive ? '#e0f2fe' : 'white', cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                        <input {...getInputProps()} />
                        <FaCloudUploadAlt size={50} color={isDragActive ? '#3b82f6' : '#94a3b8'} />
                        <p style={{ fontSize: '18px', color: '#64748b', marginTop: '10px' }}>
                            {isDragActive ? 'Solte o arquivo aqui...' : 'Arraste o XML aqui, ou clique para selecionar'}
                        </p>
                        {loading && <p style={{ color: '#3b82f6' }}>Processando arquivo...</p>}
                    </div>
                ) : (
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '18px' }}>Nota {previewData.nota.numero}</h2>
                                <span style={{ color: '#64748b' }}>Fornecedor: {previewData.nota.fornecedor.nome} ({previewData.nota.fornecedor.cnpj})</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => { setPreviewData(null); setArquivo(null); }}
                                    style={{ padding: '10px 20px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmarImportacao}
                                    disabled={loading}
                                    style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'wait' : 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FaCheck /> Confirmar Entrada
                                </button>
                            </div>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '14px', textAlign: 'left' }}>
                                    <th style={{ padding: '10px' }}>Status</th>
                                    <th style={{ padding: '10px' }}>Produto (XML)</th>
                                    <th style={{ padding: '10px' }}>EAN</th>
                                    <th style={{ padding: '10px' }}>Qtd (Nota)</th>
                                    <th style={{ padding: '10px' }}>Custo (Un)</th>
                                    <th style={{ padding: '10px' }}>Venda (Sugerido)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.itens.map((item, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '10px' }}>
                                            {item.status === 'NOVO' ?
                                                <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>NOVO</span> :
                                                <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>ATUALIZAR</span>
                                            }
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            <div style={{ fontWeight: 'bold' }}>{item.nome_xml}</div>
                                            {item.status === 'ATUALIZAR' && <div style={{ fontSize: '12px', color: '#64748b' }}>No sistema: {item.nome_sistema} (Estoque: {item.estoque_atual})</div>}
                                        </td>
                                        <td style={{ padding: '10px', fontSize: '13px', color: '#64748b' }}>{item.ean}</td>
                                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{item.qtd_xml}</td>
                                        <td style={{ padding: '10px' }}>R$ {item.valor_custo_xml.toFixed(2)}</td>
                                        <td style={{ padding: '10px' }}>
                                            <input
                                                type="number"
                                                value={item.novo_preco_venda || item.sugestao_venda || item.valor_venda_atual}
                                                onChange={(e) => atualizarPrecoPreview(idx, e.target.value)}
                                                style={{ width: '80px', padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}

export default ImportarNota;