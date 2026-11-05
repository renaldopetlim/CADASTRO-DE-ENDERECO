/* ==========================================================================
   1. ESTRUTURA DE DADOS E SCHEMA DO FORMULÁRIO
   ========================================================================== */
const SCHEMA = [
  ['Identificação do Cliente', [
    ['cod_cliente', 'Código do cliente'],
    ['razao_social', 'Razão Social / Nome', 'text', 'full'],
    ['doc', 'CNPJ / CPF']
  ]],
  ['1. Dados do Local de Entrega', [
    ['cep', 'CEP'],
    ['endereco', 'Endereço (Rua/Avenida)', 'text', 'full'],
    ['numero', 'Número'],
    ['complemento', 'Complemento (Sala, Apto, Casa)'],
    ['bairro', 'Bairro'],
    ['cidade', 'Cidade'],
    ['uf', 'Estado (UF)', 'select', '', ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']]
  ]]
];

const REQ = [
  'cod_cliente', 'razao_social', 'doc', 
  'cep', 'endereco', 'numero', 'bairro', 'cidade', 'uf'
];

/* ==========================================================================
   2. FUNÇÕES UTILITÁRIAS E HELPER DOM
   ========================================================================== */
const $ = (id) => document.getElementById(id);
const getValue = (id) => ($(id).value || '').trim();
const onlyDigits = (str) => str.replace(/\D/g, '');

const maskCPF = (str) => str.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
const maskCNPJ = (str) => str.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
const maskPhone = (str) => {
  const digits = onlyDigits(str).slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
};
const maskCEP = (str) => str.replace(/(\d{5})(\d{0,3})/, '$1-$2').replace(/-$/, '');

const formatDate = (str) => {
  if (!str) return '';
  const parts = str.split('T');
  const dateRev = parts[0].split('-').reverse().join('/');
  return parts.length > 1 ? `${dateRev} ${parts[1]}` : dateRev;
};

const getToday = () => {
  const tzOffset = new Date().getTimezoneOffset() * 60000;
  return new Date(Date.now() - tzOffset).toISOString().slice(0, 10);
};

/**
 * Converte a imagem da pasta assets para Base64 dinamicamente
 */
function getBase64ImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (error) => reject(error);
    img.src = url;
  });
}

/* ==========================================================================
   3. VALIDAÇÕES SENSÍVEIS (CPF / CNPJ)
   ========================================================================== */
function validateCPF(str) {
  const s = onlyDigits(str);
  if (s.length !== 11 || /^(\d)\1+$/.test(s)) return false;
  
  for (let t = 9; t < 11; t++) {
    let r = 0;
    for (let i = 0; i < t; i++) r += s[i] * (t + 1 - i);
    if ((r * 10 % 11) % 10 != s[t]) return false;
  }
  return true;
}

function validateCNPJ(str) {
  const s = onlyDigits(str);
  if (s.length !== 14 || /^(\d)\1+$/.test(s)) return false;
  
  for (let t = 12; t < 14; t++) {
    let r = 0, p = t - 7;
    for (let i = 0; i < t; i++) {
      r += s[i] * p--;
      if (p < 2) p = 9;
    }
    if ((r * 10 % 11) % 10 != s[t]) return false;
  }
  return true;
}

function validateForm() {
  let ok = true;
  let firstInvalid = null;

  document.querySelectorAll('.msg').forEach((m) => (m.textContent = ''));
  document.querySelectorAll('input, select').forEach((i) => i.classList.remove('bad'));

  const setBad = (id, text) => {
    ok = false;
    $(id).classList.add('bad');
    $(`m_${id}`).textContent = text;
    firstInvalid = firstInvalid || $(id);
  };

  REQ.forEach((id) => {
    if (!getValue(id)) setBad(id, 'Campo obrigatório');
  });

  const docDigits = onlyDigits(getValue('doc'));
  if (docDigits) {
    const isValid = docDigits.length === 11 
      ? validateCPF(docDigits) 
      : docDigits.length === 14 
        ? validateCNPJ(docDigits) 
        : false;
        
    if (!isValid) setBad('doc', 'CPF/CNPJ inválido');
  }

  if (firstInvalid) {
    firstInvalid.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  return ok;
}

/* ==========================================================================
   4. RENDERIZAÇÃO DO FORMULÁRIO E EVENTOS
   ========================================================================== */
function renderForm() {
  $('f').innerHTML = SCHEMA.map(([title, fields]) => `
    <fieldset>
      <legend>${title}</legend>
      <div class="g">
        ${fields.map(([id, label, type, fullClass, options]) => `
          <div class="${fullClass || ''}">
            <label for="${id}">${label}${REQ.includes(id) ? ' *' : ''}</label>
            ${
              type === 'select'
                ? `<select id="${id}">
                    <option value="">Selecione...</option>
                    ${(options || []).map((opt) => `<option value="${opt}">${opt}</option>`).join('')}
                   </select>`
                : `<input id="${id}" type="${type || 'text'}" autocomplete="off">`
            }
            <div class="msg" id="m_${id}"></div>
          </div>
        `).join('')}
      </div>
    </fieldset>
  `).join('');
}

function attachInputEvents() {
  // --- MÁSCARAS ---
  $('doc').addEventListener('input', (e) => {
    const d = onlyDigits(e.target.value).slice(0, 14);
    e.target.value = d.length <= 11 ? maskCPF(d) : maskCNPJ(d);
  });

  $('cep').addEventListener('input', (e) => {
    e.target.value = maskCEP(onlyDigits(e.target.value).slice(0, 8));
  });

  ['razao_social', 'endereco', 'bairro', 'cidade', 'complemento'].forEach((id) => {
    const el = $(id);
    if(el) {
      el.addEventListener('blur', (e) => {
        e.target.value = e.target.value.toUpperCase();
      });
    }
  });
}

function resetForm() {
  document.querySelectorAll('input, select').forEach((i) => (i.value = ''));
  $('st').textContent = '';
  document.querySelectorAll('.bad').forEach((i) => i.classList.remove('bad'));
  document.querySelectorAll('.msg').forEach((m) => (m.textContent = ''));
}

/* ==========================================================================
   5. CONSTRUÇÃO DO PDF (jsPDF)
   ========================================================================== */
function buildPDF(scaleFactor, logoBase64) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  
  const W = 210, M = 14, CW = W - 2 * M;
  const COLOR_NAVY = [23, 38, 77];
  const COLOR_ORANGE = [240, 122, 10];
  const COLOR_GRAY = [90, 98, 112];
  let y = 0;

  const checkOverflow = (height) => {
    if (y + height > 272) {
      doc.addPage();
      y = 28;
    }
  };

  const renderBar = (text) => {
    checkOverflow(9.5 * scaleFactor);
    doc.setFillColor(...COLOR_NAVY);
    doc.rect(M, y, CW, 5.8 * scaleFactor, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8 * scaleFactor);
    doc.setTextColor(255, 255, 255);
    doc.text(text, M + 2.5, y + 4.1 * scaleFactor);
    y += 5.8 * scaleFactor;
  };

  const renderParagraph = (text, size = 8.8, gap = 1.8, style = 'normal', color = [40, 40, 40]) => {
    size *= scaleFactor;
    gap *= scaleFactor;
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    
    const lines = doc.splitTextToSize(text, CW);
    checkOverflow(lines.length * size * 0.38 + gap);
    doc.text(lines, M, y + 3 * scaleFactor);
    y += lines.length * size * 0.38 + gap;
  };

  const renderGrid = (items, height = 10.2) => {
    height *= scaleFactor;
    checkOverflow(height);
    
    const totalWeight = items.reduce((acc, item) => acc + (item[2] || 1), 0);
    let x = M;

    items.forEach(([label, value, weight = 1]) => {
      const colWidth = (CW * weight) / totalWeight;
      
      doc.setDrawColor(190, 198, 215);
      doc.setFillColor(245, 247, 251);
      doc.rect(x, y, colWidth, height, 'FD');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5 * scaleFactor);
      doc.setTextColor(...COLOR_NAVY);
      doc.text(label, x + 2, y + 3.2 * scaleFactor);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5 * scaleFactor);
      
      let formattedText = doc.splitTextToSize(value || '', colWidth - 4);
      if (formattedText.length > 1) {
        doc.setFontSize(7.8 * scaleFactor);
        formattedText = doc.splitTextToSize(value || '', colWidth - 4).slice(0, 2);
      }
      
      doc.setTextColor(25, 25, 25);
      doc.text(formattedText, x + 2, y + (formattedText.length > 1 ? 6.2 : 7.8) * scaleFactor);
      x += colWidth;
    });

    y += height;
  };

  // --- CABEÇALHO DO PDF ---
  doc.setFillColor(...COLOR_NAVY);
  doc.rect(0, 0, W, 23, 'F');
  doc.setFillColor(...COLOR_ORANGE);
  doc.rect(0, 23, W, 1.2, 'F');

  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', M, 2.8, 40, 17, undefined, 'FAST');
    } catch (e) {
      console.warn('Não foi possível inserir a imagem no PDF:', e);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text('DOCUMENTO DE CONTROLE COMERCIAL / LOGÍSTICO', W - M, 10, { align: 'right' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.text('Preenchimento digital · Confirmação por gov.br', W - M, 15.5, { align: 'right' });
  
  y = 33;

  // --- CORPO DO DOCUMENTO ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5 * scaleFactor);
  doc.setTextColor(...COLOR_NAVY);
  doc.text('CADASTRO DE NOVO LOCAL DE ENTREGA', W / 2, y, { align: 'center' });
  y += 7.5 * scaleFactor;

  renderGrid([
    ['CÓDIGO DO CLIENTE', getValue('cod_cliente'), 1],
    ['RAZÃO SOCIAL / NOME', getValue('razao_social'), 3],
    ['CNPJ / CPF', getValue('doc'), 1.5]
  ]);
  y += 1.8 * scaleFactor;

  renderBar('1. DADOS DO LOCAL DE ENTREGA');
  y += 0.8 * scaleFactor;
  renderParagraph('Endereço exato onde a mercadoria será entregue.');
  
  renderGrid([
    ['CEP', getValue('cep'), 1],
    ['ENDEREÇO (RUA/AVENIDA)', getValue('endereco'), 2.5],
    ['NÚMERO', getValue('numero'), 0.8],
    ['COMPLEMENTO', getValue('complemento'), 1.2]
  ]);
  renderGrid([
    ['BAIRRO', getValue('bairro'), 1.5],
    ['CIDADE', getValue('cidade'), 1.5],
    ['ESTADO (UF)', getValue('uf'), 0.8]
  ]);
  y += 1.8 * scaleFactor;

  renderBar('2. DECLARAÇÃO DE RESPONSABILIDADE E CIÊNCIA');
  y += 0.8 * scaleFactor;
  
  const nomeCliente = getValue('razao_social') || '_________________________';
  const docCliente = getValue('doc') || '_________________________';
  
  renderParagraph(`Eu, ${nomeCliente}, inscrito(a) sob o CPF/CNPJ nº ${docCliente}, declaro, para todos os fins de direito e perante a São Paulo Distribuidora de Materiais de Construção LTDA, que:`);
  
  y += 2 * scaleFactor;
  renderParagraph('1. Estou ciente de que o endereço de entrega fornecido no item 1 é diferente do meu endereço constante no cadastro fiscal oficial (Receita Federal/Sintegra).', 8.5, 1.2);
  renderParagraph('2. Assumo total responsabilidade pela veracidade, validade e exatidão do endereço de entrega divergente fornecido acima.', 8.5, 1.2);
  renderParagraph('3. Autorizo, expressamente, a São Paulo Distribuidora de Materiais de Construção LTDA a emitir a Nota Fiscal Eletrônica (NF-e) com as informações do Grupo G (Identificação do Local de Entrega) conforme os dados fornecidos no item 1.', 8.5, 1.2);
  renderParagraph('4. Comprometo-me a arcar com quaisquer custos adicionais (frete, armazenagem, taxas, etc.) decorrentes de insucesso na entrega causado por inexatidão, insuficiência ou alteração dos dados do local de entrega fornecidos neste documento.', 8.5, 1.2);
  renderParagraph('5. Isento a São Paulo Distribuidora de Materiais de Construção LTDA de qualquer responsabilidade fiscal, tributária ou logística decorrente desta divergência de endereço.', 8.5, 2.0);

  // --- BLOCO DE ASSINATURA GOV.BR ---
  renderBar('ASSINATURA DO CLIENTE');
  y += 0.8 * scaleFactor;

  const dataAtual = new Date();
  const optionsDate = { day: '2-digit', month: 'long', year: 'numeric' };
  const dataFormatada = dataAtual.toLocaleDateString('pt-BR', optionsDate);
  renderParagraph(`Emitido em: ${dataFormatada}`, 8.5, 2.0, 'italic', COLOR_GRAY);

  const govBoxHeight = 22 * scaleFactor;
  checkOverflow(govBoxHeight + 2);
  doc.setDrawColor(...COLOR_GRAY);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.rect(M, y + 0.5 * scaleFactor, CW, govBoxHeight);
  doc.setLineDashPattern([], 0);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5 * scaleFactor);
  doc.setTextColor(...COLOR_GRAY);
  doc.text('Espaço reservado para a assinatura eletrônica gov.br do CLIENTE', W / 2, y + (govBoxHeight / 2) - 1.5, { align: 'center' });
  
  doc.setFont('helvetica', 'bold');
  doc.text(nomeCliente, W / 2, y + (govBoxHeight / 2) + 2.5, { align: 'center' });
  doc.text(docCliente, W / 2, y + (govBoxHeight / 2) + 6.5, { align: 'center' });
  
  y += govBoxHeight + 3.5 * scaleFactor;
  renderParagraph('Validade jurídica (Lei nº 14.063/2020) · autenticidade em validar.iti.gov.br · assinatura apenas na via digital.', 7.4, 1.5, 'normal', COLOR_GRAY);

  // --- RODAPÉ FIXO ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...COLOR_ORANGE);
    doc.setLineWidth(0.4);
    doc.line(M, 283, W - M, 283);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.0);
    doc.setTextColor(...COLOR_GRAY);
    doc.text('Distribuidora São Paulo · CNPJ 13.424.484/0001-48 · Setor Logístico / Comercial', M, 287);
    doc.text(`Documento válido após assinatura gov.br.   ${i}/${totalPages}`, W - M, 287, { align: 'right' });
  }

  return doc;
}

function buildAutoFitPDF(logoBase64) {
  for (let k = 1.15; k >= 0.60; k -= 0.01) {
    const pdfDoc = buildPDF(k, logoBase64);
    if (pdfDoc.getNumberOfPages() === 1) return pdfDoc;
  }
  return buildPDF(0.60, logoBase64);
}

/* ==========================================================================
   6. INICIALIZAÇÃO E EVENTOS
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  renderForm();
  attachInputEvents();
  resetForm();

  $('clr').onclick = resetForm;

  $('go').onclick = async () => {
    const statusEl = $('st');
    statusEl.style.color = '';

    if (!validateForm()) {
      statusEl.style.color = 'var(--err)';
      statusEl.textContent = 'Corrija os campos destacados.';
      return;
    }

    try {
      statusEl.textContent = 'Gerando PDF...';

      let logoBase64 = null;
      try {
        logoBase64 = await getBase64ImageFromUrl('assets/logo.png');
      } catch (e) {
        console.warn('Não foi possível carregar a imagem assets/logo.png. Gerando sem logo.', e);
      }

      const pdfDoc = buildAutoFitPDF(logoBase64);
      const cleanCliente = getValue('cod_cliente').replace(/[^\w-]+/g, '_');
      const filename = `Cadastro_Entrega_${cleanCliente}.pdf`;

      let downloadsAPI = null;
      try {
        if (typeof claude !== 'undefined' && claude.use) {
          downloadsAPI = await claude.use('downloads');
        }
      } catch (e) {}

      if (downloadsAPI) {
        await downloadsAPI.save({
          filename: filename,
          data: pdfDoc.output('blob')
        });
        statusEl.style.color = 'var(--ok)';
        statusEl.textContent = 'PDF gerado. Agora é só assinar no gov.br.';
      } else {
        pdfDoc.save(filename);
        statusEl.style.color = 'var(--ok)';
        statusEl.textContent = 'PDF gerado com sucesso!';
      }
    } catch (err) {
      statusEl.style.color = 'var(--err)';
      statusEl.textContent = (err && err.code === 'declined')
        ? 'Download cancelado.'
        : `Não foi possível gerar o PDF: ${err.message || err}`;
    }
  };
});