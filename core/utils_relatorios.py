import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import openpyxl
from openpyxl.styles import Font

def gerar_pdf_vendas(vendas):
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    p.setFont("Helvetica-Bold", 16)
    p.drawString(100, 750, "Relatório de Vendas - Patri-Tech")
    
    p.setFont("Helvetica", 12)
    y = 700
    p.drawString(100, y, "ID | Data | Valor Total | Forma Pagamento")
    y -= 20
    
    for venda in vendas:
        data_fmt = venda.data_venda.strftime('%d/%m/%Y %H:%M')
        p.drawString(100, y, f"{venda.id} | {data_fmt} | R$ {venda.valor_total} | {venda.forma_pagamento}")
        y -= 20
        if y < 50:
            p.showPage()
            y = 750
            
    p.showPage()
    p.save()
    buffer.seek(0)
    return buffer

def gerar_excel_inventario(bens):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Inventário"
    
    headers = ["ID", "Nome", "Categoria", "Unidade", "Sala", "Valor", "Quantidade", "Situação"]
    ws.append(headers)
    
    for celula in ws[1]:
        celula.font = Font(bold=True)
        
    for bem in bens:
        ws.append([
            bem.id,
            bem.nome,
            bem.categoria.nome if bem.categoria else "-",
            bem.unidade.nome if bem.unidade else "-",
            bem.sala.nome if bem.sala else "-",
            float(bem.valor) if bem.valor else 0.0,
            bem.quantidade,
            bem.situacao
        ])
        
    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer


def gerar_excel_despesas(despesas):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Relatório Financeiro"
    
    headers = ["ID", "Descrição", "Categoria", "Valor (R$)", "Vencimento", "Status", "Fornecedor"]
    ws.append(headers)
    
    # Estilo do cabeçalho
    for celula in ws[1]:
        celula.font = Font(bold=True)
        
    for d in despesas:
        status = d.situacao
        venc = d.data_vencimento.strftime('%d/%m/%Y') if d.data_vencimento else "-"
        
        ws.append([
            d.id,
            d.descricao,
            d.get_tipo_display(), # Usa o nome legível ('Despesa Fixa' ao invés de 'FIXA')
            float(d.valor),
            venc,
            status,
            d.fornecedor.nome if d.fornecedor else "-"
        ])
        
    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer
