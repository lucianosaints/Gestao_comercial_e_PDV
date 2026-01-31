import React from 'react';
import './Ticket.css';
import { FaPrint, FaTimes } from 'react-icons/fa';

const TicketView = ({ venda, onClose }) => {
  if (!venda) return null;

  return (
    <div className="ticket-overlay">
      <div className="ticket-paper">
        
        {/* CABEÇALHO DA LOJA */}
        <div className="ticket-header">
          <h3 style={{margin:0, fontSize:'16px'}}>SAKURA SYSTEM</h3>
          <small>Rua das Flores, 123</small><br/>
          <small>CNPJ: 00.000.000/0001-00</small>
        </div>

        <div className="ticket-divider"></div>

        {/* INFO DA VENDA */}
        <div style={{fontSize: '11px', textAlign:'center'}}>
          <strong>CUPOM NÃO FISCAL</strong><br/>
          Venda #{venda.id || '---'}<br/>
          Data: {new Date().toLocaleString('pt-BR')}
        </div>

        <div className="ticket-divider"></div>

        {/* LISTA DE ITENS */}
        <div style={{marginBottom: '10px'}}>
            {venda.itens.map((item, index) => {
                // Tenta ler o nome e valor de diferentes lugares para garantir que funcione
                const nomeProduto = item.nome || item.produto_nome || "Produto Sem Nome";
                const precoUnitario = item.valor || item.preco_unitario || 0;
                
                return (
                    <div key={index} className="ticket-item">
                        <span>{item.quantidade}x {nomeProduto}</span>
                        <span>R$ {(parseFloat(precoUnitario) * item.quantidade).toFixed(2)}</span>
                    </div>
                );
            })}
        </div>

        <div className="ticket-divider"></div>

        {/* TOTAIS */}
        <div className="ticket-total">
            <span>TOTAL</span>
            <span>R$ {parseFloat(venda.valor_total).toFixed(2)}</span>
        </div>
        
        <div style={{fontSize: '11px', marginTop:'5px'}}>
            Pagamento: {venda.forma_pagamento}
        </div>

        <div className="ticket-divider"></div>
        <div style={{textAlign: 'center', fontSize: '10px', marginTop:'10px'}}>
            OBRIGADO PELA PREFERÊNCIA!<br/>
            VOLTE SEMPRE.
        </div>

        {/* BOTÕES DE AÇÃO */}
        <div className="ticket-actions">
            <button onClick={() => window.print()} style={{background:'#2563eb', color:'white', border:'none', padding:'10px', borderRadius:'5px', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'}}>
                <FaPrint /> Imprimir
            </button>
            <button onClick={onClose} style={{background:'#ef4444', color:'white', border:'none', padding:'10px', borderRadius:'5px', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'}}>
                <FaTimes /> Fechar
            </button>
        </div>

      </div>
    </div>
  );
};

export default TicketView;