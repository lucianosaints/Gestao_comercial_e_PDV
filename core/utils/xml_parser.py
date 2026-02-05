import xml.etree.ElementTree as ET

def parse_nfe_xml(xml_content):
    """
    Parsea o conteúdo XML de uma NFe e retorna um dicionário com os dados.
    Espera receber bytes ou string.
    """
    try:
        if isinstance(xml_content, str):
            # Se for string, converte para bytes (utf-8) ou parseia direto
            root = ET.fromstring(xml_content)
        else:
            root = ET.fromstring(xml_content)
        
        # Namespaces da NFe são chatos. O padrão é {http://www.portalfiscal.inf.br/nfe}
        ns = {'nfe': 'http://www.portalfiscal.inf.br/nfe'}
        
        # Tenta encontrar a tag infNFe (pode estar dentro de NFe)
        inf_nfe = root.find('.//nfe:infNFe', ns)
        if inf_nfe is None:
            # Tenta sem namespace se falhar (alguns XMLs vêm sem)
            inf_nfe = root.find('.//infNFe')
            if inf_nfe is None:
                return {"error": "Formato de NFe inválido (tag infNFe não encontrada)"}
            ns = {} # Reseta namespace

        # --- 1. DADOS DA NOTA ---
        ide = inf_nfe.find('nfe:ide', ns) or inf_nfe.find('ide')
        numero_nota = ide.find('nfe:nNF', ns).text if ide.find('nfe:nNF', ns) is not None else ide.find('nNF').text
        data_emissao = ide.find('nfe:dhEmi', ns).text if ide.find('nfe:dhEmi', ns) is not None else ide.find('dhEmi').text

        # --- 2. FORNECEDOR (EMITENTE) ---
        emit = inf_nfe.find('nfe:emit', ns) or inf_nfe.find('emit')
        cnpj_emit = emit.find('nfe:CNPJ', ns).text if emit.find('nfe:CNPJ', ns) is not None else emit.find('CNPJ').text
        nome_emit = emit.find('nfe:xNome', ns).text if emit.find('nfe:xNome', ns) is not None else emit.find('xNome').text

        # --- 3. ITENS (PRODUTOS) ---
        itens = []
        for det in (inf_nfe.findall('nfe:det', ns) or inf_nfe.findall('det')):
            prod = det.find('nfe:prod', ns) or det.find('prod')
            
            # Dados do produto
            codigo = prod.find('nfe:cProd', ns).text if prod.find('nfe:cProd', ns) is not None else prod.find('cProd').text
            nome = prod.find('nfe:xProd', ns).text if prod.find('nfe:xProd', ns) is not None else prod.find('xProd').text
            
            # Tenta pegar EAN (cEAN) - Às vezes vem 'SEM GTIN'
            ean = prod.find('nfe:cEAN', ns).text if prod.find('nfe:cEAN', ns) is not None else prod.find('cEAN').text
            if ean == 'SEM GTIN':
                ean = codigo # Usa o código interno se não tiver EAN
            
            qtd = float(prod.find('nfe:qCom', ns).text if prod.find('nfe:qCom', ns) is not None else prod.find('qCom').text)
            valor_unit = float(prod.find('nfe:vUnCom', ns).text if prod.find('nfe:vUnCom', ns) is not None else prod.find('vUnCom').text)
            
            itens.append({
                "codigo_fabricante": codigo,
                "ean": ean,
                "nome": nome,
                "quantidade": qtd,
                "valor_unitario": valor_unit
            })

        return {
            "numero": numero_nota,
            "data_emissao": data_emissao,
            "fornecedor": {
                "cnpj": cnpj_emit,
                "nome": nome_emit
            },
            "itens": itens
        }

    except Exception as e:
        return {"error": str(e)}
