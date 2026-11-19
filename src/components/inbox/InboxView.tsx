import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentRecord } from '../../types';
import {
  Inbox,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Link2,
  FileText,
  Eye,
  Check,
  Trash2,
  ArrowRight,
  Filter,
  Sparkles,
  ShieldCheck,
  Building2,
  Tractor,
} from 'lucide-react';
import { formatCurrencyBRL, formatDateBR } from '../../utils/formatters';

type InboxSubTab = 'all' | 'new' | 'unclassified' | 'unlinked' | 'validation' | 'duplicates';

export const InboxView: React.FC = () => {
  const {
    documents,
    properties,
    equipment,
    validateDocument,
    linkDocumentToEntity,
    resolveDuplicateDocument,
    setPreviewFile,
    setViewingDocument,
    reliabilityMetrics,
    showToast,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<InboxSubTab>('all');
  const [selectedDocForLink, setSelectedDocForLink] = useState<DocumentRecord | null>(null);
  const [targetEntityType, setTargetEntityType] = useState<'property' | 'equipment'>('property');
  const [targetEntityId, setTargetEntityId] = useState<string>('');

  // Itens da Caixa de Entrada
  const inboxDocs = documents.filter((doc) => {
    return (
      doc.status === 'pending' ||
      doc.validationStatus === 'draft' ||
      doc.validationStatus === 'pending_validation' ||
      doc.isDuplicateSuspect ||
      !doc.propertyId
    );
  });

  const newDocs = inboxDocs.filter(
    (d) => d.validationStatus === 'draft' && !d.isDuplicateSuspect
  );
  const unclassifiedDocs = inboxDocs.filter(
    (d) => d.category === 'Outros' || d.tags.includes('Aguardando Classificação')
  );
  const unlinkedDocs = inboxDocs.filter(
    (d) => !d.propertyId && (!d.links || d.links.length === 0)
  );
  const awaitingValidationDocs = inboxDocs.filter(
    (d) => d.validationStatus === 'pending_validation' && !d.isDuplicateSuspect
  );
  const duplicateDocs = inboxDocs.filter((d) => d.isDuplicateSuspect);

  const getFilteredList = () => {
    switch (activeSubTab) {
      case 'new':
        return newDocs;
      case 'unclassified':
        return unclassifiedDocs;
      case 'unlinked':
        return unlinkedDocs;
      case 'validation':
        return awaitingValidationDocs;
      case 'duplicates':
        return duplicateDocs;
      default:
        return inboxDocs;
    }
  };

  const currentList = getFilteredList();

  const handleApplyLink = () => {
    if (!selectedDocForLink || !targetEntityId) {
      showToast('Selecione uma propriedade ou máquina para vincular.');
      return;
    }

    if (targetEntityType === 'property') {
      const prop = properties.find((p) => p.id === targetEntityId);
      if (prop) {
        linkDocumentToEntity(selectedDocForLink.id, {
          entityType: 'property',
          entityId: prop.id,
          entityName: prop.name,
          relationType: 'Imóvel Principal',
          isPrimary: true,
        });
      }
    } else {
      const eq = equipment.find((e) => e.id === targetEntityId);
      if (eq) {
        linkDocumentToEntity(selectedDocForLink.id, {
          entityType: 'equipment',
          entityId: eq.id,
          entityName: eq.name,
          relationType: 'Máquina Vinculada',
          isPrimary: true,
        });
      }
    }

    setSelectedDocForLink(null);
    setTargetEntityId('');
  };

  return (
    <div className="content-container">
      {/* Cabeçalho */}
      <div className="view-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="view-title">Caixa de Entrada Operacional</h1>
            <span
              style={{
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary-dark)',
                fontSize: '11.5px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '12px',
                border: '1px solid var(--primary-border)',
              }}
            >
              Backoffice LSA
            </span>
          </div>
          <p className="view-subtitle">
            Fila transitória de arquivos recebidos. Todo arquivo deve ser identificado, vinculado e validado antes de alimentar indicadores oficiais.
          </p>
        </div>

        {/* Indicador de Saúde da Fila */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#FFFFFF',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor:
                reliabilityMetrics.criticalIssuesCount === 0 ? '#DCFCE7' : '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color:
                reliabilityMetrics.criticalIssuesCount === 0 ? '#166534' : '#B45309',
            }}
          >
            <Inbox size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-subtle)', fontWeight: 600 }}>
              ITENS NA FILA OPERACIONAL
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
              {inboxDocs.length} pendente(s)
            </div>
          </div>
        </div>
      </div>

      {/* Sub-abas da Caixa de Entrada conforme Seção 4 do Documento */}
      <div className="tabs-container" style={{ marginBottom: '20px' }}>
        <button
          className={`tab-btn ${activeSubTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('all')}
        >
          Todos na Entrada ({inboxDocs.length})
        </button>
        <button
          className={`tab-btn ${activeSubTab === 'new' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('new')}
        >
          Novos / Não Tratados ({newDocs.length})
        </button>
        <button
          className={`tab-btn ${activeSubTab === 'unclassified' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('unclassified')}
        >
          Aguardando Classificação ({unclassifiedDocs.length})
        </button>
        <button
          className={`tab-btn ${activeSubTab === 'unlinked' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('unlinked')}
        >
          Aguardando Vínculo ({unlinkedDocs.length})
        </button>
        <button
          className={`tab-btn ${activeSubTab === 'validation' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('validation')}
        >
          Aguardando Validação ({awaitingValidationDocs.length})
        </button>
        <button
          className={`tab-btn ${activeSubTab === 'duplicates' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('duplicates')}
          style={{
            color: duplicateDocs.length > 0 ? '#DC2626' : undefined,
          }}
        >
          Possível Duplicidade ({duplicateDocs.length})
        </button>
      </div>

      {/* Alerta de Governança LSA */}
      <div
        style={{
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <ShieldCheck size={20} color="#16A34A" />
        <div style={{ fontSize: '12.5px', color: '#166534' }}>
          <strong>Regra LSA P-06 (Porta de Qualidade):</strong> Rascunhos e documentos pendentes na Caixa de Entrada não entram nos relatórios oficiais até serem conferidos e validados pelo operador.
        </div>
      </div>

      {/* Lista de Registros da Fila */}
      {currentList.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            color: 'var(--text-subtle)',
          }}
        >
          <CheckCircle2 size={44} color="#22C55E" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
            Nenhum documento pendente nesta fila!
          </h3>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>
            Todos os arquivos desta categoria foram devidamente validados e publicados.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentList.map((doc) => {
            const isDuplicate = doc.isDuplicateSuspect;
            const isUnlinked = !doc.propertyId && (!doc.links || doc.links.length === 0);

            return (
              <div
                key={doc.id}
                className="card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  borderLeft: isDuplicate
                    ? '4px solid #EF4444'
                    : isUnlinked
                    ? '4px solid #F59E0B'
                    : '4px solid #3B82F6',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isDuplicate
                        ? '#FEE2E2'
                        : isUnlinked
                        ? '#FEF3C7'
                        : '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isDuplicate
                        ? '#DC2626'
                        : isUnlinked
                        ? '#D97706'
                        : '#2563EB',
                      flexShrink: 0,
                    }}
                  >
                    {isDuplicate ? (
                      <AlertTriangle size={20} />
                    ) : isUnlinked ? (
                      <Link2 size={20} />
                    ) : (
                      <FileText size={20} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h4
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          margin: 0,
                        }}
                      >
                        {doc.title}
                      </h4>
                      {isDuplicate && (
                        <span
                          style={{
                            backgroundColor: '#FEE2E2',
                            color: '#991B1B',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          Suspeita de Duplicidade
                        </span>
                      )}
                      {isUnlinked && (
                        <span
                          style={{
                            backgroundColor: '#FEF3C7',
                            color: '#92400E',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          Sem Vínculo
                        </span>
                      )}
                      <span
                        style={{
                          backgroundColor: '#F3F4F6',
                          color: '#4B5563',
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        Via {doc.source?.toUpperCase() || 'UPLOAD'}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-subtle)',
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span>Arquivo: <code>{doc.originalFileName}</code></span>
                      <span>Recebido: {formatDateBR(doc.createdAt)}</span>
                      {doc.valueCents ? (
                        <span>Valor: <strong>{formatCurrencyBRL(doc.valueCents)}</strong></span>
                      ) : null}
                      <span>Categoria: {doc.category}</span>
                    </div>

                    {doc.notes && (
                      <div
                        style={{
                          fontSize: '11.5px',
                          color: 'var(--text-muted)',
                          marginTop: '4px',
                          fontStyle: 'italic',
                        }}
                      >
                        Obs: {doc.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações Operacionais */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setPreviewFile(doc)}
                    title="Pré-visualizar arquivo"
                  >
                    <Eye size={15} />
                    <span>Prévia</span>
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setViewingDocument(doc)}
                    title="Abrir detalhes e metadados completos"
                  >
                    <span>Dossiê</span>
                  </button>

                  {isUnlinked && (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ borderColor: '#F59E0B', color: '#B45309' }}
                      onClick={() => setSelectedDocForLink(doc)}
                    >
                      <Link2 size={15} />
                      <span>Vincular</span>
                    </button>
                  )}

                  {isDuplicate ? (
                    <>
                      <button
                        className="btn btn-sm"
                        style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
                        onClick={() => resolveDuplicateDocument(doc.id, 'discard')}
                        title="Descartar arquivo duplicado"
                      >
                        <Trash2 size={15} />
                        <span>Descartar</span>
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => resolveDuplicateDocument(doc.id, 'keep')}
                        title="Manter arquivo mesmo assim"
                      >
                        <span>Manter</span>
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => validateDocument(doc.id)}
                      title="Validar e Publicar documento no acervo"
                    >
                      <Check size={15} strokeWidth={2.5} />
                      <span>Validar & Publicar</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Rápido de Vinculação de Documento (DOC-03) */}
      {selectedDocForLink && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Vincular Documento a Entidade</h3>
              <button className="btn-icon" onClick={() => setSelectedDocForLink(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Associe <strong>"{selectedDocForLink.title}"</strong> ao seu contexto primário para torná-lo consultável no respectivo dossiê.
              </p>

              <div className="form-group">
                <label className="form-label">Tipo de Entidade</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${targetEntityType === 'property' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => {
                      setTargetEntityType('property');
                      setTargetEntityId('');
                    }}
                  >
                    <Building2 size={15} />
                    Propriedade Rural
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${targetEntityType === 'equipment' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => {
                      setTargetEntityType('equipment');
                      setTargetEntityId('');
                    }}
                  >
                    <Tractor size={15} />
                    Máquina / Veículo
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Selecione o Destino</label>
                <select
                  className="form-select"
                  value={targetEntityId}
                  onChange={(e) => setTargetEntityId(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {targetEntityType === 'property'
                    ? properties.map((prop) => (
                        <option key={prop.id} value={prop.id}>
                          {prop.name} ({prop.city}/{prop.state})
                        </option>
                      ))
                    : equipment.map((eq) => (
                        <option key={eq.id} value={eq.id}>
                          {eq.name} — {eq.brand} ({eq.year})
                        </option>
                      ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedDocForLink(null)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleApplyLink}>
                Confirmar Vínculo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
