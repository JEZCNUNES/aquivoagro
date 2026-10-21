import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  X,
  FileText,
  Tractor,
  DollarSign,
  Users,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface GlobalSearchResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchResultsModal: React.FC<GlobalSearchResultsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    globalSearchQuery,
    setGlobalSearchQuery,
    documents,
    equipment,
    transactions,
    parties,
    setActiveTab,
    setViewingDocument,
    setActiveEquipmentDetailId,
  } = useApp();

  const query = globalSearchQuery.trim().toLowerCase();

  const results = useMemo(() => {
    if (!query) {
      return {
        matchedDocs: [],
        matchedEquipment: [],
        matchedTxs: [],
        matchedParties: [],
        total: 0,
      };
    }

    const matchedDocs = documents.filter(
      (d) =>
        d.title.toLowerCase().includes(query) ||
        d.originalFileName.toLowerCase().includes(query) ||
        (d.invoiceNumber && d.invoiceNumber.toLowerCase().includes(query)) ||
        d.tags.some((t) => t.toLowerCase().includes(query)) ||
        (d.accessKey && d.accessKey.includes(query))
    );

    const matchedEquipment = equipment.filter(
      (e) =>
        e.name.toLowerCase().includes(query) ||
        e.brand.toLowerCase().includes(query) ||
        e.model.toLowerCase().includes(query) ||
        e.plateOrSerial.toLowerCase().includes(query)
    );

    const matchedTxs = transactions.filter(
      (t) =>
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
    );

    const matchedParties = parties.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query)
    );

    const total =
      matchedDocs.length +
      matchedEquipment.length +
      matchedTxs.length +
      matchedParties.length;

    return {
      matchedDocs,
      matchedEquipment,
      matchedTxs,
      matchedParties,
      total,
    };
  }, [query, documents, equipment, transactions, parties]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content wide"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '80vh' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <Search size={20} color="var(--primary)" />
            <input
              type="text"
              autoFocus
              className="form-input"
              style={{ border: 'none', fontSize: '16px', padding: '6px 0' }}
              placeholder="Digite o nome de uma nota, máquina, fornecedor ou despesa..."
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={onClose} className="btn-icon-round">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          {!query ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
              Digite termos como <strong>"trator"</strong>, <strong>"diesel"</strong>, <strong>"filtro"</strong>, <strong>"soja"</strong> ou números de nota fiscal para localizar registros instantaneamente.
            </div>
          ) : results.total === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
              Nenhum resultado encontrado para "<strong>{globalSearchQuery}</strong>".
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Documentos */}
              {results.matchedDocs.length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-dark)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={16} /> Documentos ({results.matchedDocs.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {results.matchedDocs.slice(0, 5).map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => {
                          onClose();
                          setViewingDocument(doc);
                        }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          backgroundColor: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-main)' }}>
                            {doc.title}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                            {doc.category} • {formatDate(doc.issueDate)} {doc.valueCents ? `• ${formatCurrency(doc.valueCents)}` : ''}
                          </div>
                        </div>
                        <ChevronRight size={16} color="var(--text-subtle)" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Máquinas e Veículos */}
              {results.matchedEquipment.length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-dark)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tractor size={16} /> Veículos e Máquinas ({results.matchedEquipment.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {results.matchedEquipment.map((eq) => (
                      <div
                        key={eq.id}
                        onClick={() => {
                          onClose();
                          setActiveTab('equipment');
                          setActiveEquipmentDetailId(eq.id);
                        }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          backgroundColor: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-main)' }}>
                            {eq.name}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                            {eq.brand} • {eq.model} • Série/Placa: {eq.plateOrSerial}
                          </div>
                        </div>
                        <ChevronRight size={16} color="var(--text-subtle)" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lançamentos Financeiros */}
              {results.matchedTxs.length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-dark)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={16} /> Lançamentos Financeiros ({results.matchedTxs.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {results.matchedTxs.slice(0, 5).map((tx) => (
                      <div
                        key={tx.id}
                        onClick={() => {
                          onClose();
                          setActiveTab('financial');
                        }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          backgroundColor: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-main)' }}>
                            {tx.description}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                            {tx.category} • Vencimento: {formatDate(tx.dueDate)} • Status: {tx.status === 'paid' ? 'Pago' : 'Em Aberto'}
                          </div>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: tx.type === 'income' ? '#16A34A' : '#DC2626' }}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amountCents)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fornecedores e Clientes */}
              {results.matchedParties.length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-dark)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={16} /> Fornecedores e Clientes ({results.matchedParties.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {results.matchedParties.map((party) => (
                      <div
                        key={party.id}
                        onClick={() => {
                          onClose();
                          setActiveTab('parties');
                        }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          backgroundColor: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-main)' }}>
                            {party.name}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                            {party.type === 'supplier' ? 'Fornecedor' : party.type === 'client' ? 'Cliente' : 'Fornecedor/Cliente'} • {party.city} - {party.state}
                          </div>
                        </div>
                        <ChevronRight size={16} color="var(--text-subtle)" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
