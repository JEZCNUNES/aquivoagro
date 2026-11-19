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
  Building2,
  FileSignature,
  ShoppingCart,
  ShieldCheck,
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
    properties,
    contracts,
    purchases,
    insurance,
    setActiveTab,
    setViewingDocument,
    setActiveEquipmentDetailId,
    setActivePropertyDetailId,
  } = useApp();

  const query = globalSearchQuery.trim().toLowerCase();

  const results = useMemo(() => {
    if (!query) {
      return {
        matchedProperties: [],
        matchedContracts: [],
        matchedDocs: [],
        matchedEquipment: [],
        matchedPurchases: [],
        matchedInsurance: [],
        matchedTxs: [],
        matchedParties: [],
        total: 0,
      };
    }

    const matchedProperties = properties.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query) ||
        p.responsible.toLowerCase().includes(query)
    );

    const matchedContracts = contracts.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.numberRef.toLowerCase().includes(query) ||
        c.contractType.toLowerCase().includes(query) ||
        c.primaryContext.name.toLowerCase().includes(query)
    );

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

    const matchedPurchases = purchases.filter(
      (pur) =>
        pur.orderNumber.toLowerCase().includes(query) ||
        pur.supplierName.toLowerCase().includes(query) ||
        pur.category.toLowerCase().includes(query) ||
        pur.items.some((i) => i.productName.toLowerCase().includes(query))
    );

    const matchedInsurance = insurance.filter(
      (ins) =>
        ins.policyNumber.toLowerCase().includes(query) ||
        ins.insurerName.toLowerCase().includes(query) ||
        ins.coveredItems.some((c) => c.toLowerCase().includes(query))
    );

    const matchedTxs = transactions.filter(
      (t) =>
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
    );

    const matchedParties = parties.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query) ||
        (p.taxId && p.taxId.includes(query))
    );

    const total =
      matchedProperties.length +
      matchedContracts.length +
      matchedDocs.length +
      matchedEquipment.length +
      matchedPurchases.length +
      matchedInsurance.length +
      matchedTxs.length +
      matchedParties.length;

    return {
      matchedProperties,
      matchedContracts,
      matchedDocs,
      matchedEquipment,
      matchedPurchases,
      matchedInsurance,
      matchedTxs,
      matchedParties,
      total,
    };
  }, [query, properties, contracts, documents, equipment, purchases, insurance, transactions, parties]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container wide"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '85vh', maxWidth: '780px', display: 'flex', flexDirection: 'column' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            <Search size={20} color="var(--primary)" />
            <input
              type="text"
              autoFocus
              className="global-search-input"
              style={{
                width: '100%',
                fontSize: '15px',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                padding: '4px 0',
              }}
              placeholder="Digite para buscar fazenda, contrato, máquina, NF, parceiro..."
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '20px' }}>
          {!query ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-subtle)' }}>
              <Search size={40} color="var(--primary-light)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
                Busca Global Onipresente (LSA Seção 13.1)
              </h3>
              <p style={{ fontSize: '13px', maxWidth: '420px', margin: '6px auto 0' }}>
                Exemplos de busca: <strong>Santa Cecília</strong>, <strong>NF 15328</strong>, <strong>Agrofértil</strong>, <strong>6110M</strong> ou <strong>Arrendamento</strong>.
              </p>
            </div>
          ) : results.total === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-subtle)' }}>
              <p style={{ fontSize: '14px' }}>
                Nenhum registro encontrado para "<strong>{globalSearchQuery}</strong>".
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ fontSize: '12.5px', color: 'var(--text-subtle)', fontWeight: 600 }}>
                {results.total} resultado(s) encontrado(s) em toda a base
              </div>

              {/* 1. Propriedades */}
              {results.matchedProperties.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-dark)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={15} /> Propriedades Rurais ({results.matchedProperties.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {results.matchedProperties.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setActiveTab('properties');
                          setActivePropertyDetailId(p.id);
                          onClose();
                        }}
                        className="search-result-item"
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{p.name}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                            {p.city} - {p.state} • {p.areaHectares} ha • Resp: {p.responsible}
                          </div>
                        </div>
                        <ChevronRight size={16} color="var(--text-subtle)" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Contratos */}
              {results.matchedContracts.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-dark)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileSignature size={15} /> Contratos ({results.matchedContracts.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {results.matchedContracts.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setActiveTab('contracts');
                          onClose();
                        }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{c.title}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                            Ref: {c.numberRef} • Contexto: {c.primaryContext.name} • Tipo: {c.contractType.toUpperCase()}
                          </div>
                        </div>
                        <ChevronRight size={16} color="var(--text-subtle)" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Documentos */}
              {results.matchedDocs.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-dark)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={15} /> Documentos & Notas Fiscais ({results.matchedDocs.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {results.matchedDocs.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => {
                          setViewingDocument(doc);
                          onClose();
                        }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{doc.title}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                            {doc.category} • {formatDate(doc.issueDate)} {doc.invoiceNumber ? `• NF: ${doc.invoiceNumber}` : ''}
                          </div>
                        </div>
                        <ChevronRight size={16} color="var(--text-subtle)" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Patrimônio & Máquinas */}
              {results.matchedEquipment.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-dark)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tractor size={15} /> Máquinas & Patrimônio ({results.matchedEquipment.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {results.matchedEquipment.map((eq) => (
                      <div
                        key={eq.id}
                        onClick={() => {
                          setActiveTab('equipment');
                          setActiveEquipmentDetailId(eq.id);
                          onClose();
                        }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{eq.name}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                            {eq.brand} • {eq.model} • Série: {eq.plateOrSerial}
                          </div>
                        </div>
                        <ChevronRight size={16} color="var(--text-subtle)" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Compras & Insumos */}
              {results.matchedPurchases.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-dark)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShoppingCart size={15} /> Compras & Insumos ({results.matchedPurchases.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {results.matchedPurchases.map((pur) => (
                      <div
                        key={pur.id}
                        onClick={() => {
                          setActiveTab('purchases');
                          onClose();
                        }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13.5px' }}>
                            {pur.supplierName} — {pur.orderNumber}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                            {pur.category} • Total: {formatCurrency(pur.totalAmountCents)}
                          </div>
                        </div>
                        <ChevronRight size={16} color="var(--text-subtle)" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Seguros */}
              {results.matchedInsurance.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-dark)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={15} /> Seguros ({results.matchedInsurance.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {results.matchedInsurance.map((ins) => (
                      <div
                        key={ins.id}
                        onClick={() => {
                          setActiveTab('insurance');
                          onClose();
                        }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13.5px' }}>
                            {ins.insurerName} — Apólice {ins.policyNumber}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                            Cobertura: {formatCurrency(ins.insuredAmountCents)}
                          </div>
                        </div>
                        <ChevronRight size={16} color="var(--text-subtle)" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. Pessoas e Contrapartes */}
              {results.matchedParties.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-dark)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={15} /> Pessoas & Contrapartes ({results.matchedParties.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {results.matchedParties.map((pty) => (
                      <div
                        key={pty.id}
                        onClick={() => {
                          setActiveTab('parties');
                          onClose();
                        }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{pty.name}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                            {pty.type === 'supplier' ? 'Fornecedor' : pty.type === 'client' ? 'Cliente/Comprador' : 'Ambos'} • {pty.city}/{pty.state}
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
