import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentRecord, DocumentCategory } from '../../types';
import {
  X,
  FileText,
  Eye,
  Download,
  Archive,
  RotateCcw,
  Tractor,
  DollarSign,
  Building2,
  Calendar,
  Tag,
  Edit2,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  formatDate,
  formatCurrency,
  formatFileSize,
  parseCurrencyToCents,
} from '../../utils/formatters';
import { StatusBadge } from '../common/Badge';

export const DocumentDetailDrawer: React.FC = () => {
  const {
    viewingDocument,
    setViewingDocument,
    updateDocument,
    archiveDocument,
    restoreDocument,
    properties,
    equipment,
    parties,
    transactions,
    setActiveTab,
    setActiveEquipmentDetailId,
    setPreviewFile,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<DocumentCategory>('Notas fiscais de compras');
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState('');

  if (!viewingDocument) return null;

  const doc = viewingDocument;
  const linkedProp = properties.find((p) => p.id === doc.propertyId);
  const linkedEq = equipment.find((e) => e.id === doc.equipmentId);
  const linkedParty = parties.find((p) => p.id === doc.partyId);
  const linkedTx = transactions.find((t) => t.id === doc.linkedFinancialId || t.documentId === doc.id);

  const startEdit = () => {
    setEditTitle(doc.title);
    setEditCategory(doc.category);
    setEditNotes(doc.notes);
    setEditTags(doc.tags.join(', '));
    setIsEditing(true);
  };

  const saveEdit = () => {
    updateDocument(doc.id, {
      title: editTitle,
      category: editCategory,
      notes: editNotes,
      tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setViewingDocument({
      ...doc,
      title: editTitle,
      category: editCategory,
      notes: editNotes,
      tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setIsEditing(false);
  };

  return (
    <div className="drawer-overlay" onClick={() => setViewingDocument(null)}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <div className="modal-title" style={{ fontSize: '16px' }}>
                Detalhes do Documento
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {doc.originalFileName}
              </div>
            </div>
          </div>
          <button
            onClick={() => setViewingDocument(null)}
            className="btn-icon-round"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px' }}>
          {/* Status e Ações Rápidas de topo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px',
            }}
          >
            <StatusBadge status={doc.status} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setPreviewFile(doc)}
                className="btn btn-outline-green btn-sm"
                title="Pré-visualizar arquivo"
              >
                <Eye size={14} /> Ver Arquivo
              </button>
              {doc.fileDataUrl && (
                <a
                  href={doc.fileDataUrl}
                  download={doc.originalFileName}
                  className="btn btn-secondary btn-sm"
                  title="Baixar arquivo da sessão"
                >
                  <Download size={14} />
                </a>
              )}
            </div>
          </div>

          {/* Modo Edição vs Visualização */}
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">Título</label>
                <input
                  type="text"
                  className="form-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Categoria</label>
                <select
                  className="form-select"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as DocumentCategory)}
                >
                  <option value="Notas fiscais de compras">Notas fiscais de compras</option>
                  <option value="Notas fiscais de vendas">Notas fiscais de vendas</option>
                  <option value="Peças e manutenção">Peças e manutenção</option>
                  <option value="Combustíveis">Combustíveis</option>
                  <option value="Insumos agrícolas">Insumos agrícolas</option>
                  <option value="Documentos da propriedade">Documentos da propriedade</option>
                  <option value="Contratos e arrendamentos">Contratos e arrendamentos</option>
                  <option value="Financiamentos e seguros">Financiamentos e seguros</option>
                  <option value="Comprovantes de pagamento">Comprovantes de pagamento</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  className="form-input"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Observações</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={saveEdit} className="btn btn-primary btn-sm">
                  <Save size={14} /> Salvar Alterações
                </button>
                <button onClick={() => setIsEditing(false)} className="btn btn-secondary btn-sm">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary-dark)' }}>
                  {doc.title}
                </h3>
                <button
                  onClick={startEdit}
                  className="btn-icon-round"
                  style={{ width: '30px', height: '30px' }}
                  title="Editar dados"
                >
                  <Edit2 size={14} />
                </button>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-subtle)' }}>
                {doc.category} {doc.propertySubtype ? `• ${doc.propertySubtype}` : ''}
              </div>
            </div>
          )}

          {/* Vínculos Principais em Destaque */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {/* Propriedade */}
            <div
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={18} color="var(--primary)" />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Propriedade Vinculada
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {linkedProp ? `${linkedProp.name} (${linkedProp.city} - ${linkedProp.state})` : 'Não especificada'}
                  </div>
                </div>
              </div>
            </div>

            {/* Máquina ou Veículo Vinculado */}
            {linkedEq ? (
              <div
                onClick={() => {
                  setViewingDocument(null);
                  setActiveTab('equipment');
                  setActiveEquipmentDetailId(linkedEq.id);
                }}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--primary-border)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                title="Clique para abrir o histórico completo desta máquina"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Tractor size={18} color="var(--primary)" />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--primary-dark)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Máquina Vinculada (Patrimônio)
                    </div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--primary-dark)' }}>
                      {linkedEq.name}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      Série/Placa: {linkedEq.plateOrSerial}
                    </div>
                  </div>
                </div>
                <ExternalLink size={16} color="var(--primary)" />
              </div>
            ) : (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--border-color)',
                  fontSize: '12.5px',
                  color: 'var(--text-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Tractor size={16} /> Nenhuma máquina ou veículo associado
              </div>
            )}

            {/* Lançamento Financeiro Vinculado */}
            {linkedTx ? (
              <div
                onClick={() => {
                  setViewingDocument(null);
                  setActiveTab('financial');
                }}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                }}
                title="Clique para ir ao módulo Financeiro"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <DollarSign size={18} color="var(--primary)" />
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Lançamento Financeiro Integrado
                    </div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {linkedTx.description}
                    </div>
                    <div style={{ fontSize: '12px', color: linkedTx.type === 'income' ? '#16A34A' : '#DC2626', fontWeight: 700 }}>
                      {linkedTx.type === 'income' ? '+' : '-'}{formatCurrency(linkedTx.amountCents)} ({linkedTx.status === 'paid' ? 'Pago' : 'Em Aberto'})
                    </div>
                  </div>
                </div>
                <ExternalLink size={16} color="var(--text-subtle)" />
              </div>
            ) : (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--border-color)',
                  fontSize: '12.5px',
                  color: 'var(--text-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <DollarSign size={16} /> Sem lançamento financeiro vinculado
              </div>
            )}
          </div>

          {/* Tabela de Metadados Detalhados */}
          <div
            style={{
              backgroundColor: '#F9FAFB',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              fontSize: '13px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              border: '1px solid var(--border-color)',
              marginBottom: '20px',
            }}
          >
            {doc.valueCents !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Valor Registrado:</span>
                <span style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{formatCurrency(doc.valueCents)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Data de Emissão:</span>
              <span>{formatDate(doc.issueDate)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Data de Inclusão:</span>
              <span>{formatDate(doc.createdAt)}</span>
            </div>
            {doc.invoiceNumber && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Número da Nota:</span>
                <span style={{ fontWeight: 600 }}>{doc.invoiceNumber}</span>
              </div>
            )}
            {doc.accessKey && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Chave de Acesso:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', wordBreak: 'break-all' }}>{doc.accessKey}</span>
              </div>
            )}
            {doc.cropSeason && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Safra / Ciclo:</span>
                <span>{doc.cropSeason}</span>
              </div>
            )}
            {doc.expirationDate && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Data de Validade:</span>
                <span style={{ fontWeight: 600, color: '#D97706' }}>{formatDate(doc.expirationDate)}</span>
              </div>
            )}
            {linkedParty && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fornecedor / Cliente:</span>
                <span>{linkedParty.name}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {doc.tags && doc.tags.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle)', marginBottom: '8px' }}>
                TAGS DO DOCUMENTO
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {doc.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '11.5px',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--primary-dark)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--primary-border)',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Observações */}
          {doc.notes && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle)', marginBottom: '4px' }}>
                OBSERVAÇÕES
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-main)', backgroundColor: '#F8FAFC', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                {doc.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer com Arquivamento */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div>
            {doc.status === 'archived' ? (
              <button
                onClick={() => {
                  restoreDocument(doc.id);
                  setViewingDocument({ ...doc, status: 'organized' });
                }}
                className="btn btn-outline-green btn-sm"
              >
                <RotateCcw size={14} /> Restaurar Documento
              </button>
            ) : (
              <button
                onClick={() => {
                  archiveDocument(doc.id);
                  setViewingDocument({ ...doc, status: 'archived' });
                }}
                className="btn btn-secondary btn-sm"
              >
                <Archive size={14} /> Arquivar
              </button>
            )}
          </div>
          <button
            onClick={() => setViewingDocument(null)}
            className="btn btn-secondary btn-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
