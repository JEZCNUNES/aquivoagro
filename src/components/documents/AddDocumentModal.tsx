import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DocumentCategory,
  PropertyDocSubtype,
  DocumentStatus,
  PaymentMethod,
} from '../../types';
import {
  X,
  UploadCloud,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  Tractor,
  DollarSign,
  FileText,
} from 'lucide-react';
import {
  formatFileSize,
  getTodayIso,
  parseCurrencyToCents,
  formatCurrency,
} from '../../utils/formatters';

interface FileQueueItem {
  file: File;
  name: string;
  size: number;
  type: 'pdf' | 'jpg' | 'png' | 'xml';
  dataUrl?: string;
  isDuplicateSuspect: boolean;
  // Form fields
  title: string;
  category: DocumentCategory;
  propertySubtype?: PropertyDocSubtype;
  propertyId: string;
  partyId?: string;
  equipmentId?: string;
  issueDate: string;
  valueStr: string;
  invoiceNumber: string;
  accessKey: string;
  cropSeason: string;
  costCenter: string;
  tagsStr: string;
  expirationDate: string;
  notes: string;
  status: DocumentStatus;
  // Linked transaction
  createFinancialEntry: boolean;
  financialType: 'expense' | 'income';
  financialDueDate: string;
  financialPaymentMethod: PaymentMethod;
  financialStatus: 'open' | 'paid';
}

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  'Notas fiscais de compras',
  'Notas fiscais de vendas',
  'Veículos',
  'Máquinas e implementos',
  'Peças e manutenção',
  'Combustíveis',
  'Insumos agrícolas',
  'Contratos e arrendamentos',
  'Documentos da propriedade',
  'Comprovantes de pagamento',
  'Financiamentos e seguros',
  'Outros',
];

const PROPERTY_SUBTYPES: PropertyDocSubtype[] = [
  'CAR',
  'CCIR',
  'ITR',
  'Matrícula',
  'Escritura',
  'Outros documentos',
];

export const AddDocumentModal: React.FC = () => {
  const {
    isAddDocModalOpen,
    setIsAddDocModalOpen,
    properties,
    equipment,
    parties,
    documents,
    selectedPropertyId,
    addDocument,
  } = useApp();

  const [step, setStep] = useState<number>(1);
  const [fileQueue, setFileQueue] = useState<FileQueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAddDocModalOpen) return null;

  const currentPropId =
    selectedPropertyId !== 'all' ? selectedPropertyId : properties[0]?.id || '';

  const handleClose = () => {
    setIsAddDocModalOpen(false);
    setStep(1);
    setFileQueue([]);
    setCurrentIndex(0);
    setErrorMsg(null);
  };

  const processFiles = (files: FileList | File[]) => {
    setErrorMsg(null);
    const newItems: FileQueueItem[] = [];

    Array.from(files).forEach((file) => {
      // Validação de tamanho
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setErrorMsg(`O arquivo "${file.name}" ultrapassa o limite de 20 MB.`);
        return;
      }

      // Validação de formato
      const ext = file.name.split('.').pop()?.toLowerCase();
      let detectedType: 'pdf' | 'jpg' | 'png' | 'xml' | null = null;
      if (ext === 'pdf') detectedType = 'pdf';
      else if (ext === 'jpg' || ext === 'jpeg') detectedType = 'jpg';
      else if (ext === 'png') detectedType = 'png';
      else if (ext === 'xml') detectedType = 'xml';

      if (!detectedType) {
        setErrorMsg(`O formato .${ext} não é compatível. Formatos aceitos: PDF, JPG, PNG e XML.`);
        return;
      }

      // Detecção de duplicata por nome e tamanho com documentos existentes
      const isDuplicate = documents.some(
        (d) =>
          d.originalFileName.toLowerCase() === file.name.toLowerCase() &&
          d.fileSizeBytes === file.size
      );

      // Leitura para dataUrl local na sessão
      const reader = new FileReader();
      const item: FileQueueItem = {
        file,
        name: file.name,
        size: file.size,
        type: detectedType,
        isDuplicateSuspect: isDuplicate,
        title: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        category: 'Notas fiscais de compras',
        propertyId: currentPropId,
        issueDate: getTodayIso(),
        valueStr: '',
        invoiceNumber: '',
        accessKey: '',
        cropSeason: 'Safra 2026/2027',
        costCenter: '',
        tagsStr: '',
        expirationDate: '',
        notes: '',
        status: 'organized',
        createFinancialEntry: true,
        financialType: 'expense',
        financialDueDate: getTodayIso(),
        financialPaymentMethod: 'Boleto Bancário',
        financialStatus: 'open',
      };

      reader.onload = (e) => {
        item.dataUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      newItems.push(item);
    });

    if (newItems.length > 0) {
      setFileQueue((prev) => [...prev, ...newItems]);
      setStep(2);
    }
  };

  const loadSampleFile = () => {
    setErrorMsg(null);
    const sampleItem: FileQueueItem = {
      file: new File(['Exemplo de Nota Fiscal de Peças Trator'], 'NFe_55990_Pecas_Trator_JD.pdf', { type: 'application/pdf' }),
      name: 'NFe_55990_Pecas_Trator_JD.pdf',
      size: 345000,
      type: 'pdf',
      isDuplicateSuspect: false,
      title: 'NF 55990 - Bomba Hidráulica Trator John Deere',
      category: 'Peças e manutenção',
      propertyId: currentPropId,
      equipmentId: 'eq-1',
      partyId: 'party-1',
      issueDate: getTodayIso(),
      valueStr: '3.500,00',
      invoiceNumber: '55990',
      accessKey: '51241009876543000188550010000559901005599018',
      cropSeason: 'Safra 2026/2027',
      costCenter: 'Oficina Mecânica',
      tagsStr: 'Trator, Hidráulico, Reposição',
      expirationDate: '',
      notes: 'Bomba hidráulica adquirida para substituição no Trator John Deere 6110M.',
      status: 'organized',
      createFinancialEntry: true,
      financialType: 'expense',
      financialDueDate: getTodayIso(),
      financialPaymentMethod: 'Boleto Bancário',
      financialStatus: 'open',
    };
    setFileQueue([sampleItem]);
    setStep(2);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const updateCurrentItem = (updates: Partial<FileQueueItem>) => {
    setFileQueue((prev) =>
      prev.map((item, idx) => (idx === currentIndex ? { ...item, ...updates } : item))
    );
  };

  const currentItem = fileQueue[currentIndex];

  const handleFinish = () => {
    fileQueue.forEach((item) => {
      const valueCents = item.valueStr ? parseCurrencyToCents(item.valueStr) : undefined;
      const tags = item.tagsStr
        ? item.tagsStr.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      let txPayload = undefined;
      if (item.createFinancialEntry && valueCents && valueCents > 0) {
        txPayload = {
          description: `NF ${item.invoiceNumber || ''} - ${item.title}`.trim(),
          type: item.financialType,
          amountCents: valueCents,
          category:
            item.category === 'Combustíveis'
              ? 'Combustível e Lubrificantes'
              : item.category === 'Peças e manutenção'
              ? 'Peças e Manutenção'
              : item.category === 'Insumos agrícolas'
              ? 'Insumos e Defensivos'
              : 'Outras Despesas',
          dueDate: item.financialDueDate || item.issueDate,
          paymentMethod: item.financialPaymentMethod,
          status: item.financialStatus,
          paymentDate: item.financialStatus === 'paid' ? getTodayIso() : undefined,
        };
      }

      addDocument(
        {
          title: item.title,
          originalFileName: item.name,
          fileType: item.type,
          fileSizeBytes: item.size,
          category: item.category,
          propertySubtype:
            item.category === 'Documentos da propriedade'
              ? item.propertySubtype || 'Outros documentos'
              : undefined,
          propertyId: item.propertyId,
          partyId: item.partyId || undefined,
          equipmentId: item.equipmentId || undefined,
          issueDate: item.issueDate,
          valueCents,
          invoiceNumber: item.invoiceNumber || undefined,
          accessKey: item.accessKey || undefined,
          cropSeason: item.cropSeason || undefined,
          costCenter: item.costCenter || undefined,
          tags,
          notes: item.notes,
          expirationDate: item.expirationDate || undefined,
          status: item.status,
          fileDataUrl: item.dataUrl,
          isSimulated: false,
        },
        txPayload
      );
    });

    handleClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content wide"
        onClick={(e) => e.stopPropagation()}
        style={{ height: '90vh' }}
      >
        {/* Header do Wizard */}
        <div className="modal-header">
          <div>
            <div className="modal-title">Adicionar Documentos</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Etapa {step} de 7 • Inclusão na memória da sessão
            </div>
          </div>
          <button onClick={handleClose} className="btn-icon-round">
            <X size={18} />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: '4px', backgroundColor: '#E5E7EB', width: '100%' }}>
          <div
            style={{
              height: '100%',
              backgroundColor: 'var(--primary)',
              width: `${(step / 7) * 100}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Corpo do Wizard */}
        <div className="modal-body">
          {errorMsg && (
            <div
              style={{
                backgroundColor: '#FEE2E2',
                border: '1px solid #FCA5A5',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                color: '#991B1B',
                fontSize: '13px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ETAPA 1: Seleção de Arquivos */}
          {step === 1 && (
            <div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-xl)',
                  backgroundColor: dragOver ? 'var(--bg-tertiary)' : '#F9FAFB',
                  padding: '48px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <UploadCloud size={32} />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '6px' }}>
                  Arraste e solte seus arquivos aqui
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Ou clique para selecionar arquivos do seu computador ou celular
                </p>
                <div
                  style={{
                    display: 'inline-flex',
                    gap: '12px',
                    fontSize: '12px',
                    color: 'var(--text-subtle)',
                    backgroundColor: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <span>Formatos: <strong>PDF, JPG, PNG, XML</strong></span>
                  <span>•</span>
                  <span>Limite: <strong>20 MB</strong> por arquivo</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.xml"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files) processFiles(e.target.files);
                  }}
                />
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    loadSampleFile();
                  }}
                  className="btn btn-outline-green"
                  id="btn-use-sample-file"
                >
                  <FileText size={16} /> Carregar Nota Fiscal de Exemplo (Demonstração)
                </button>
              </div>

              <div
                style={{
                  marginTop: '16px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--primary-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  fontSize: '12.5px',
                  color: 'var(--primary-dark)',
                }}
              >
                <strong>Nota sobre privacidade e armazenamento:</strong> Os arquivos selecionados são processados exclusivamente na memória do navegador para esta demonstração. Nenhum documento é enviado para a nuvem nesta etapa.
              </div>
            </div>
          )}

          {/* ETAPA 2: Conferência e Duplicatas */}
          {step === 2 && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '12px' }}>
                Arquivos Selecionados ({fileQueue.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {fileQueue.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FileCheck size={24} color="var(--primary)" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                          {formatFileSize(item.size)} • {item.type.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {item.isDuplicateSuspect && (
                        <span
                          style={{
                            fontSize: '11px',
                            color: '#92400E',
                            backgroundColor: '#FEF3C7',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <AlertTriangle size={13} /> Possível duplicata (mesmo nome e tamanho)
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setFileQueue((prev) => prev.filter((_, i) => i !== idx));
                          if (fileQueue.length <= 1) setStep(1);
                        }}
                        className="btn-icon-round"
                        style={{ width: '32px', height: '32px' }}
                        title="Remover arquivo"
                      >
                        <Trash2 size={16} color="#DC2626" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ETAPA 3: Preenchimento dos dados do documento */}
          {step === 3 && currentItem && (
            <div>
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-dark)' }}>
                  Dados do Documento: {currentItem.name}
                </h3>
                {fileQueue.length > 1 && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Arquivo {currentIndex + 1} de {fileQueue.length}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Título de Identificação *</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentItem.title}
                  onChange={(e) => updateCurrentItem({ title: e.target.value })}
                  placeholder="Ex: NF-e 48291 - Peças Trator John Deere"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Data de Emissão *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={currentItem.issueDate}
                    onChange={(e) => updateCurrentItem({ issueDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Valor (R$, opcional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={currentItem.valueStr}
                    onChange={(e) => updateCurrentItem({ valueStr: e.target.value })}
                    placeholder="Ex: 4.850,00"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Número da Nota (opcional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={currentItem.invoiceNumber}
                    onChange={(e) => updateCurrentItem({ invoiceNumber: e.target.value })}
                    placeholder="Ex: 48291"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Chave de Acesso (44 dígitos, opcional)</label>
                  <input
                    type="text"
                    className="form-input"
                    maxLength={44}
                    value={currentItem.accessKey}
                    onChange={(e) => updateCurrentItem({ accessKey: e.target.value })}
                    placeholder="5124..."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Safra / Ciclo</label>
                  <select
                    className="form-select"
                    value={currentItem.cropSeason}
                    onChange={(e) => updateCurrentItem({ cropSeason: e.target.value })}
                  >
                    <option value="Safra 2026/2027">Safra 2026/2027</option>
                    <option value="Safra 2025/2026">Safra 2025/2026</option>
                    <option value="Geral">Sem safra específica</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={currentItem.tagsStr}
                    onChange={(e) => updateCurrentItem({ tagsStr: e.target.value })}
                    placeholder="Ex: Trator, Revisão 500h, Garantia"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Observações</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={currentItem.notes}
                  onChange={(e) => updateCurrentItem({ notes: e.target.value })}
                  placeholder="Informações adicionais para controle..."
                />
              </div>
            </div>
          )}

          {/* ETAPA 4: Categoria e Propriedade */}
          {step === 4 && currentItem && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '16px' }}>
                Classificação e Propriedade
              </h3>

              <div className="form-group">
                <label className="form-label">Propriedade Rural Vinculada *</label>
                <select
                  className="form-select"
                  value={currentItem.propertyId}
                  onChange={(e) => updateCurrentItem({ propertyId: e.target.value })}
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.city} - {p.state})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Categoria do Documento *</label>
                <select
                  className="form-select"
                  value={currentItem.category}
                  onChange={(e) =>
                    updateCurrentItem({
                      category: e.target.value as DocumentCategory,
                    })
                  }
                >
                  {DOCUMENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subtipo de documento de propriedade se aplicável */}
              {currentItem.category === 'Documentos da propriedade' && (
                <div className="form-group" style={{ backgroundColor: 'var(--bg-tertiary)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                  <label className="form-label">Classificação da Propriedade (CAR, CCIR, Matrícula etc.)</label>
                  <select
                    className="form-select"
                    value={currentItem.propertySubtype || 'CAR'}
                    onChange={(e) =>
                      updateCurrentItem({
                        propertySubtype: e.target.value as PropertyDocSubtype,
                      })
                    }
                  >
                    {PROPERTY_SUBTYPES.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-subtle)', marginTop: '6px' }}>
                    * Esta classificação serve para organização interna e não realiza validação governamental oficial.
                  </p>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Data de Validade (quando aplicável)</label>
                <input
                  type="date"
                  className="form-input"
                  value={currentItem.expirationDate}
                  onChange={(e) => updateCurrentItem({ expirationDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status de Organização Documental</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="docStatus"
                      checked={currentItem.status === 'organized'}
                      onChange={() => updateCurrentItem({ status: 'organized' })}
                    />
                    <span>Organizado</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="docStatus"
                      checked={currentItem.status === 'pending'}
                      onChange={() => updateCurrentItem({ status: 'pending' })}
                    />
                    <span>Pendente de Classificação</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 5: Vínculo com Veículo/Máquina e Fornecedor */}
          {step === 5 && currentItem && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '16px' }}>
                Conexão com Patrimônio e Fornecedores
              </h3>

              <div
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--primary-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <Tractor size={24} color="var(--primary)" />
                <div style={{ fontSize: '13px', color: 'var(--primary-dark)' }}>
                  <strong>Diferencial AgroArquivo:</strong> Vincule esta nota fiscal diretamente a um trator, colheitadeira ou implemento. Todos os custos e histórico ficarão integrados!
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Vincular a um Veículo ou Máquina (opcional)</label>
                <select
                  className="form-select"
                  value={currentItem.equipmentId || ''}
                  onChange={(e) => updateCurrentItem({ equipmentId: e.target.value || undefined })}
                >
                  <option value="">Nenhum veículo/máquina vinculado</option>
                  {equipment.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} • {eq.brand} ({eq.plateOrSerial})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Fornecedor ou Cliente (opcional)</label>
                <select
                  className="form-select"
                  value={currentItem.partyId || ''}
                  onChange={(e) => updateCurrentItem({ partyId: e.target.value || undefined })}
                >
                  <option value="">Selecione ou deixe em branco</option>
                  {parties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.city} - {p.state})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ETAPA 6: Lançamento Financeiro Vinculado */}
          {step === 6 && currentItem && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '14px' }}>
                Lançamento Financeiro Integrado
              </h3>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  marginBottom: '16px',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={currentItem.createFinancialEntry}
                    onChange={(e) => updateCurrentItem({ createFinancialEntry: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                  />
                  <span>Criar lançamento financeiro a partir deste documento</span>
                </label>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', marginLeft: '28px' }}>
                  A criação do lançamento exige escolha explícita. Adicionar uma nota não significa que ela foi quitada automaticamente.
                </p>
              </div>

              {currentItem.createFinancialEntry && (
                <div style={{ backgroundColor: '#F9FAFB', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Tipo de Lançamento</label>
                      <select
                        className="form-select"
                        value={currentItem.financialType}
                        onChange={(e) => updateCurrentItem({ financialType: e.target.value as 'expense' | 'income' })}
                      >
                        <option value="expense">Despesa (Conta a Pagar)</option>
                        <option value="income">Receita (Conta a Receber)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Data de Vencimento *</label>
                      <input
                        type="date"
                        className="form-input"
                        value={currentItem.financialDueDate}
                        onChange={(e) => updateCurrentItem({ financialDueDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Forma de Pagamento Prevista</label>
                      <select
                        className="form-select"
                        value={currentItem.financialPaymentMethod}
                        onChange={(e) => updateCurrentItem({ financialPaymentMethod: e.target.value as PaymentMethod })}
                      >
                        <option value="Boleto Bancário">Boleto Bancário</option>
                        <option value="Pix">Pix</option>
                        <option value="Transferência Bancária">Transferência Bancária</option>
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Dinheiro">Dinheiro</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Situação do Lançamento</label>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="finStatus"
                            checked={currentItem.financialStatus === 'open'}
                            onChange={() => updateCurrentItem({ financialStatus: 'open' })}
                          />
                          <span>Em Aberto (Previsto)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="finStatus"
                            checked={currentItem.financialStatus === 'paid'}
                            onChange={() => updateCurrentItem({ financialStatus: 'paid' })}
                          />
                          <span>Já Quitado (Realizado)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ETAPA 7: Revisão e Confirmação */}
          {step === 7 && currentItem && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary-dark)' }}>
                  Pronto para Confirmar a Inclusão
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Revise o resumo antes de registrar na sessão demonstrativa.
                </p>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  fontSize: '13.5px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div><strong>Documento:</strong> {currentItem.title}</div>
                <div><strong>Arquivo:</strong> {currentItem.name} ({formatFileSize(currentItem.size)})</div>
                <div><strong>Categoria:</strong> {currentItem.category}</div>
                <div>
                  <strong>Propriedade:</strong> {properties.find((p) => p.id === currentItem.propertyId)?.name}
                </div>
                {currentItem.equipmentId && (
                  <div>
                    <strong>Máquina Vinculada:</strong> {equipment.find((e) => e.id === currentItem.equipmentId)?.name}
                  </div>
                )}
                {currentItem.valueStr && (
                  <div>
                    <strong>Valor do Documento:</strong> {formatCurrency(parseCurrencyToCents(currentItem.valueStr))}
                  </div>
                )}
                {currentItem.createFinancialEntry && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', color: 'var(--primary-dark)' }}>
                    <strong>Lançamento Financeiro:</strong> {currentItem.financialType === 'expense' ? 'Conta a Pagar' : 'Conta a Receber'} ({currentItem.financialStatus === 'paid' ? 'Já Quitado' : 'Em Aberto'})
                  </div>
                )}
              </div>

              <div
                style={{
                  marginTop: '16px',
                  backgroundColor: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  fontSize: '12px',
                  color: '#92400E',
                }}
              >
                <strong>Lembrete da demonstração:</strong> Os dados adicionados ficam salvos apenas na memória desta sessão no seu navegador e serão descartados ao recarregar a página.
              </div>
            </div>
          )}
        </div>

        {/* Footer com botões de navegação */}
        <div className="modal-footer">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="btn btn-secondary"
            >
              <ArrowLeft size={16} /> Voltar
            </button>
          )}

          {step < 7 ? (
            <button
              onClick={() => {
                if (step === 1 && fileQueue.length === 0) {
                  loadSampleFile();
                  return;
                }
                if (step === 2 && fileQueue.length === 0) {
                  setErrorMsg('Adicione ao menos um arquivo válido para prosseguir.');
                  return;
                }
                setStep((s) => s + 1);
              }}
              className="btn btn-primary"
              id="btn-wizard-next"
            >
              Avançar <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={handleFinish} className="btn btn-primary" id="btn-confirm-add-doc">
              <CheckCircle2 size={16} /> Confirmar Inclusão na Demonstração
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
