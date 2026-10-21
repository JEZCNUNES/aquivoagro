import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { EntityParty, PartyType } from '../../types';
import {
  Users,
  Plus,
  Search,
  FileText,
  DollarSign,
  Phone,
  MapPin,
  ChevronRight,
  Edit2,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PartyModal } from './PartyModal';

export const PartiesView: React.FC = () => {
  const { parties, documents, transactions, setViewingDocument } = useApp();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(
    parties[0]?.id || null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<EntityParty | null>(null);

  const filteredParties = useMemo(() => {
    return parties.filter((p) => {
      if (typeFilter !== 'all') {
        if (typeFilter === 'supplier' && p.type !== 'supplier' && p.type !== 'both') return false;
        if (typeFilter === 'client' && p.type !== 'client' && p.type !== 'both') return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.contact.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [parties, typeFilter, searchTerm]);

  const activeParty = useMemo(() => {
    return parties.find((p) => p.id === selectedPartyId) || parties[0];
  }, [parties, selectedPartyId]);

  // Documentos e Lançamentos vinculados à parte selecionada
  const linkedDocs = useMemo(() => {
    if (!activeParty) return [];
    return documents.filter((d) => d.partyId === activeParty.id && d.status !== 'archived');
  }, [activeParty, documents]);

  const linkedTxs = useMemo(() => {
    if (!activeParty) return [];
    return transactions.filter((t) => t.partyId === activeParty.id);
  }, [activeParty, transactions]);

  return (
    <div className="content-container">
      {/* Cabeçalho */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Fornecedores e Clientes</h1>
          <p className="page-description">
            Cadastre revendas de peças, distribuidoras de diesel, cooperativas e tradings compradoras de grãos.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingParty(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={18} /> Cadastrar contato
        </button>
      </div>

      {/* Filtros */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} className="search-icon-pos" />
          <input
            type="text"
            className="global-search-input"
            style={{ height: '38px', borderRadius: 'var(--radius-md)' }}
            placeholder="Buscar por nome, contato ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ minWidth: '180px' }}>
          <select
            className="form-select"
            style={{ height: '38px', padding: '0 12px' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Todos os Contatos</option>
            <option value="supplier">Apenas Fornecedores</option>
            <option value="client">Apenas Clientes (Tradings/Grãos)</option>
          </select>
        </div>
      </div>

      {/* Layout Split: Lista de Parceiros à Esquerda e Dossiê à Direita */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Lista de Contatos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredParties.map((party) => {
            const isSelected = activeParty?.id === party.id;
            const pDocsCount = documents.filter((d) => d.partyId === party.id && d.status !== 'archived').length;

            return (
              <div
                key={party.id}
                onClick={() => setSelectedPartyId(party.id)}
                className="card"
                style={{
                  padding: '16px 20px',
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                  backgroundColor: isSelected ? 'var(--bg-tertiary)' : '#FFFFFF',
                  boxShadow: isSelected ? '0 4px 12px rgba(22, 163, 74, 0.12)' : 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: party.type === 'supplier' ? '#DCFCE7' : '#EFF6FF',
                        color: party.type === 'supplier' ? '#166534' : '#1E40AF',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      {party.type === 'supplier'
                        ? 'Fornecedor'
                        : party.type === 'client'
                        ? 'Cliente'
                        : 'Fornecedor/Cliente'}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                      {party.city} - {party.state}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-dark)' }}>
                    {party.name}
                  </h3>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {party.contact}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--primary)', fontWeight: 600 }}>
                    {pDocsCount} doc(s)
                  </span>
                  <ChevronRight size={16} color="var(--text-subtle)" style={{ marginTop: '4px' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Dossiê do Fornecedor / Cliente Selecionado */}
        {activeParty && (
          <div className="card" style={{ padding: '24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '16px',
                marginBottom: '20px',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--primary)',
                  }}
                >
                  Histórico do Cadastro
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary-dark)' }}>
                  {activeParty.name}
                </h2>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {activeParty.city} - {activeParty.state} • Contato: {activeParty.contact}
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingParty(activeParty);
                  setIsModalOpen(true);
                }}
                className="btn-icon-round"
                title="Editar parceiro"
              >
                <Edit2 size={16} />
              </button>
            </div>

            {activeParty.notes && (
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  marginBottom: '20px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <strong>Observações:</strong> {activeParty.notes}
              </div>
            )}

            {/* Documentos Vinculados */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '10px' }}>
                Notas Fiscais e Contratos ({linkedDocs.length})
              </h3>
              {linkedDocs.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-subtle)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
                  Nenhum documento registrado com este fornecedor/cliente.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {linkedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setViewingDocument(doc)}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} color="var(--primary)" />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600 }}>{doc.title}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                            {doc.category} • {formatDate(doc.issueDate)}
                          </div>
                        </div>
                      </div>
                      {doc.valueCents && (
                        <span style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: '13px' }}>
                          {formatCurrency(doc.valueCents)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lançamentos Financeiros Vinculados */}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '10px' }}>
                Lançamentos Financeiros Vinculados ({linkedTxs.length})
              </h3>
              {linkedTxs.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-subtle)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
                  Nenhum lançamento financeiro registrado.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {linkedTxs.map((tx) => (
                    <div
                      key={tx.id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '13px',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{tx.description}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                          Vencimento: {formatDate(tx.dueDate)} • {tx.status === 'paid' ? 'Pago' : 'Em Aberto'}
                        </div>
                      </div>
                      <span
                        style={{
                          fontWeight: 700,
                          color: tx.type === 'income' ? '#16A34A' : '#DC2626',
                        }}
                      >
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amountCents)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <PartyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        partyToEdit={editingParty}
      />
    </div>
  );
};
