import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Equipment } from '../../types';
import {
  X,
  Tractor,
  FileText,
  DollarSign,
  Wrench,
  Fuel,
  Shield,
  Plus,
  Calendar,
  Building2,
  ExternalLink,
} from 'lucide-react';
import {
  formatCurrency,
  formatDate,
  formatFileSize,
} from '../../utils/formatters';
import { calculateEquipmentSpending } from '../../utils/calculations';
import { StatusBadge } from '../common/Badge';

interface EquipmentDetailModalProps {
  equipmentId: string | null;
  onClose: () => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  equipmentId,
  onClose,
}) => {
  const {
    equipment,
    documents,
    transactions,
    properties,
    setViewingDocument,
    openAddDocModalWithDefaults,
  } = useApp();

  const eq = equipment.find((e) => e.id === equipmentId);

  // Gastos calculados separados por: Aquisição, Peças/Manutenção, Combustível, Outros
  const spending = useMemo(() => {
    if (!eq) return null;
    return calculateEquipmentSpending(eq.id, transactions, equipment);
  }, [eq, transactions, equipment]);

  // Documentos vinculados
  const linkedDocs = useMemo(() => {
    if (!eq) return [];
    return documents.filter((d) => d.equipmentId === eq.id && d.status !== 'archived');
  }, [eq, documents]);

  // Lançamentos financeiros vinculados
  const linkedTxs = useMemo(() => {
    if (!eq) return [];
    return transactions.filter((t) => t.equipmentId === eq.id);
  }, [eq, transactions]);

  // Histórico cronológico unificado
  const unifiedTimeline = useMemo(() => {
    const list: {
      id: string;
      date: string;
      type: 'document' | 'expense';
      title: string;
      category: string;
      amountCents?: number;
      rawDoc?: any;
    }[] = [];

    linkedDocs.forEach((d) => {
      list.push({
        id: `timeline-doc-${d.id}`,
        date: d.issueDate,
        type: 'document',
        title: d.title,
        category: d.category,
        amountCents: d.valueCents,
        rawDoc: d,
      });
    });

    linkedTxs.forEach((t) => {
      // evita duplicar se já exibido pelo doc correspondente
      if (!t.documentId) {
        list.push({
          id: `timeline-tx-${t.id}`,
          date: t.paymentDate || t.dueDate,
          type: 'expense',
          title: t.description,
          category: t.category,
          amountCents: t.amountCents,
        });
      }
    });

    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [linkedDocs, linkedTxs]);

  if (!eq || !spending) return null;

  const prop = properties.find((p) => p.id === eq.propertyId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content wide"
        onClick={(e) => e.stopPropagation()}
        style={{ height: '90vh' }}
      >
        {/* Cabeçalho */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Tractor size={24} />
            </div>
            <div>
              <div className="modal-title">{eq.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {eq.brand} • {eq.model} • Ano {eq.year} • Placa/Série: {eq.plateOrSerial}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon-round" title="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '24px' }}>
          {/* Indicadores Separados de Custo do Equipamento */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
              marginBottom: '24px',
            }}
          >
            <div className="kpi-card">
              <span className="kpi-label">Valor de Aquisição</span>
              <div className="kpi-value" style={{ fontSize: '18px' }}>
                {formatCurrency(spending.acquisitionCents)}
              </div>
              <div className="kpi-footer">Custo histórico do bem</div>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">Peças & Manutenção</span>
              <div className="kpi-value" style={{ fontSize: '18px', color: '#DC2626' }}>
                {formatCurrency(spending.maintenanceCents)}
              </div>
              <div className="kpi-footer">Revisões, filtros e oficina</div>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">Combustível / Óleo</span>
              <div className="kpi-value" style={{ fontSize: '18px', color: '#D97706' }}>
                {formatCurrency(spending.fuelCents)}
              </div>
              <div className="kpi-footer">Diesel e lubrificantes</div>
            </div>

            <div className="kpi-card highlight">
              <span className="kpi-label">Gasto Total Acumulado</span>
              <div className="kpi-value" style={{ fontSize: '18px', color: 'var(--primary-dark)' }}>
                {formatCurrency(spending.totalCents)}
              </div>
              <div className="kpi-footer">Aquisição + manutenções</div>
            </div>
          </div>

          {/* Dados Cadastrais e Botão de Ação Rápida */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                <strong>Propriedade:</strong> {prop?.name} ({prop?.city} - {prop?.state})
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                <strong>Data de Aquisição:</strong> {formatDate(eq.acquisitionDate)}
              </div>
              {eq.notes && (
                <div style={{ fontSize: '12.5px', color: 'var(--text-subtle)', marginTop: '4px' }}>
                  <em>{eq.notes}</em>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                onClose();
                openAddDocModalWithDefaults(eq.id, eq.propertyId);
              }}
              className="btn btn-primary btn-sm"
              id="btn-add-doc-for-machine"
            >
              <Plus size={15} /> Adicionar nota fiscal para este trator
            </button>
          </div>

          {/* Lista de Notas Fiscais e Documentos Deste Equipamento */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '12px' }}>
              Notas Fiscais e Documentos Vinculados ({linkedDocs.length})
            </h3>
            {linkedDocs.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-subtle)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                Nenhum documento anexado a este equipamento ainda.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {linkedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      onClose();
                      setViewingDocument(doc);
                    }}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={18} color="var(--primary)" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-main)' }}>
                          {doc.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                          {doc.category} • Emissão: {formatDate(doc.issueDate)} {doc.invoiceNumber ? `• NF ${doc.invoiceNumber}` : ''}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {doc.valueCents && (
                        <span style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: '13.5px' }}>
                          {formatCurrency(doc.valueCents)}
                        </span>
                      )}
                      <ExternalLink size={15} color="var(--text-subtle)" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Histórico Cronológico */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '12px' }}>
              Histórico Cronológico de Despesas e Manutenções
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {unifiedTimeline.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar size={15} color="var(--text-subtle)" />
                    <span style={{ fontSize: '12.5px', color: 'var(--text-subtle)' }}>
                      {formatDate(item.date)}
                    </span>
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {item.title}
                    </span>
                  </div>
                  {item.amountCents && (
                    <span style={{ fontWeight: 700, color: '#DC2626', fontSize: '13.5px' }}>
                      -{formatCurrency(item.amountCents)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
