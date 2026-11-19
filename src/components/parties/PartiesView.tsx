import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { EntityParty, PartyRole } from '../../types';
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
  ShieldCheck,
  FileSignature,
  Building2,
  UserCheck,
  Eye,
} from 'lucide-react';
import { formatCurrency, formatDate, formatCurrencyBRL, formatDateBR } from '../../utils/formatters';
import { PartyModal } from './PartyModal';

type PartyRoleFilter = 'all' | 'titular_socio' | 'procurador' | 'equipe' | 'fornecedor' | 'comprador';
type PersonDossierTab = 'overview' | 'cadastral' | 'docs' | 'contracts' | 'financial';

export const PartiesView: React.FC = () => {
  const { parties, documents, transactions, contracts, setViewingDocument, setPreviewFile, setActiveTab } = useApp();

  const [roleFilter, setRoleFilter] = useState<PartyRoleFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(parties[0]?.id || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<EntityParty | null>(null);
  const [dossierTab, setDossierTab] = useState<PersonDossierTab>('overview');

  const filteredParties = useMemo(() => {
    return parties.filter((p) => {
      if (roleFilter !== 'all') {
        const roles = p.roles || [];
        if (roleFilter === 'titular_socio') {
          if (!roles.includes('titular') && !roles.includes('socio') && !roles.includes('conjuge') && p.type !== 'client')
            return false;
        } else if (roleFilter === 'procurador') {
          if (!roles.includes('procurador')) return false;
        } else if (roleFilter === 'equipe') {
          if (!roles.includes('colaborador')) return false;
        } else if (roleFilter === 'fornecedor') {
          if (!roles.includes('fornecedor') && p.type !== 'supplier') return false;
        } else if (roleFilter === 'comprador') {
          if (!roles.includes('comprador') && p.type !== 'client') return false;
        }
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.contact.toLowerCase().includes(q) ||
          (p.taxId && p.taxId.includes(q))
        );
      }
      return true;
    });
  }, [parties, roleFilter, searchTerm]);

  const activeParty = useMemo(() => {
    return parties.find((p) => p.id === selectedPartyId) || filteredParties[0] || parties[0];
  }, [parties, selectedPartyId, filteredParties]);

  // Documentos vinculados
  const linkedDocs = useMemo(() => {
    if (!activeParty) return [];
    return documents.filter((d) => d.partyId === activeParty.id && d.status !== 'archived');
  }, [activeParty, documents]);

  // Contratos em que a parte participa
  const linkedContracts = useMemo(() => {
    if (!activeParty) return [];
    return contracts.filter((c) =>
      c.parties.some((p) => p.partyId === activeParty.id || p.partyName.toLowerCase().includes(activeParty.name.toLowerCase()))
    );
  }, [activeParty, contracts]);

  // Transações financeiras
  const linkedTxs = useMemo(() => {
    if (!activeParty) return [];
    return transactions.filter((t) => t.partyId === activeParty.id);
  }, [activeParty, transactions]);

  const totalFinancialAmount = linkedTxs.reduce((acc, t) => acc + t.amountCents, 0);

  return (
    <div className="content-container">
      {/* Cabeçalho */}
      <div className="view-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="view-title">Cliente & Pessoas (Governança ID-01)</h1>
            <span
              style={{
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary-dark)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '12px',
                border: '1px solid var(--primary-border)',
              }}
            >
              Identidade Unificada • Seção 5
            </span>
          </div>
          <p className="view-subtitle">
            Pessoa física ou jurídica canônica: titular, sócios, cônjuge, procuradores, equipe de campo e contrapartes comerciais sem cadastros duplicados.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingParty(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={18} /> Cadastrar Pessoa / Entidade
        </button>
      </div>

      {/* Sub-abas de Papéis / Vínculos (Seção 5) */}
      <div className="tabs-container" style={{ marginBottom: '18px' }}>
        <button
          className={`tab-btn ${roleFilter === 'all' ? 'active' : ''}`}
          onClick={() => setRoleFilter('all')}
        >
          Todos ({parties.length})
        </button>
        <button
          className={`tab-btn ${roleFilter === 'titular_socio' ? 'active' : ''}`}
          onClick={() => setRoleFilter('titular_socio')}
        >
          Titular, Sócios & Família
        </button>
        <button
          className={`tab-btn ${roleFilter === 'procurador' ? 'active' : ''}`}
          onClick={() => setRoleFilter('procurador')}
        >
          Procuradores & Jurídico
        </button>
        <button
          className={`tab-btn ${roleFilter === 'equipe' ? 'active' : ''}`}
          onClick={() => setRoleFilter('equipe')}
        >
          Equipe & Agrônomos
        </button>
        <button
          className={`tab-btn ${roleFilter === 'fornecedor' ? 'active' : ''}`}
          onClick={() => setRoleFilter('fornecedor')}
        >
          Fornecedores
        </button>
        <button
          className={`tab-btn ${roleFilter === 'comprador' ? 'active' : ''}`}
          onClick={() => setRoleFilter('comprador')}
        >
          Tradings & Compradores
        </button>
      </div>

      {/* Busca */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: '20px' }}>
        <div className="global-search-container" style={{ maxWidth: '420px' }}>
          <Search size={16} className="search-icon-pos" />
          <input
            type="text"
            className="global-search-input"
            placeholder="Buscar por nome, CPF/CNPJ, telefone ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Layout Master-Detail (Lista à esquerda, Dossiê 360° à direita) */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'flex-start' }}>
        {/* Lista de Partes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredParties.map((p) => {
            const isSelected = activeParty?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPartyId(p.id)}
                className="card"
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                  backgroundColor: isSelected ? 'var(--bg-tertiary)' : '#FFFFFF',
                  boxShadow: isSelected ? '0 2px 8px rgba(22, 163, 74, 0.12)' : 'var(--shadow-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                    {p.name}
                  </h4>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)', marginTop: '2px' }}>
                    {p.roles?.join(', ').toUpperCase() || p.type.toUpperCase()} • {p.city}/{p.state}
                  </div>
                </div>
                <ChevronRight size={16} color={isSelected ? 'var(--primary)' : 'var(--text-light)'} />
              </div>
            );
          })}
        </div>

        {/* Dossiê 360° da Pessoa / Entidade Selecionada (Seção 5.1) */}
        {activeParty && (
          <div className="card" style={{ padding: '24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '12px',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '16px',
                marginBottom: '16px',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  Dossiê da Parte • LSA Identidade
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-dark)', margin: '2px 0 0 0' }}>
                  {activeParty.name}
                </h2>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  CPF/CNPJ: <strong>{activeParty.taxId || 'Não informado'}</strong> • Contato: {activeParty.contact}
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingParty(activeParty);
                  setIsModalOpen(true);
                }}
                className="btn btn-secondary btn-sm"
              >
                <Edit2 size={14} /> Editar Cadastro
              </button>
            </div>

            {/* Sub-abas do Dossiê */}
            <div className="tabs-container" style={{ marginBottom: '16px', margin: '0 0 16px 0' }}>
              <button
                className={`tab-btn ${dossierTab === 'overview' ? 'active' : ''}`}
                onClick={() => setDossierTab('overview')}
              >
                Visão Geral
              </button>
              <button
                className={`tab-btn ${dossierTab === 'cadastral' ? 'active' : ''}`}
                onClick={() => setDossierTab('cadastral')}
              >
                Dados Cadastrais
              </button>
              <button
                className={`tab-btn ${dossierTab === 'contracts' ? 'active' : ''}`}
                onClick={() => setDossierTab('contracts')}
              >
                Contratos ({linkedContracts.length})
              </button>
              <button
                className={`tab-btn ${dossierTab === 'financial' ? 'active' : ''}`}
                onClick={() => setDossierTab('financial')}
              >
                Financeiro ({linkedTxs.length})
              </button>
              <button
                className={`tab-btn ${dossierTab === 'docs' ? 'active' : ''}`}
                onClick={() => setDossierTab('docs')}
              >
                Documentos ({linkedDocs.length})
              </button>
            </div>

            {/* Conteúdo da Sub-Aba */}
            {dossierTab === 'overview' && (
              <div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    marginBottom: '20px',
                  }}
                >
                  <div className="kpi-card">
                    <span className="kpi-label">Documentos Vinculados</span>
                    <div className="kpi-value" style={{ fontSize: '20px' }}>{linkedDocs.length}</div>
                    <div className="kpi-footer">No acervo documental</div>
                  </div>
                  <div className="kpi-card">
                    <span className="kpi-label">Contratos Ativos</span>
                    <div className="kpi-value" style={{ fontSize: '20px', color: '#16A34A' }}>{linkedContracts.length}</div>
                    <div className="kpi-footer">Instrumentos comerciais</div>
                  </div>
                  <div className="kpi-card highlight">
                    <span className="kpi-label">Volume Financeiro</span>
                    <div className="kpi-value" style={{ fontSize: '20px', color: 'var(--primary-dark)' }}>
                      {formatCurrencyBRL(totalFinancialAmount)}
                    </div>
                    <div className="kpi-footer">Lançamentos na safra</div>
                  </div>
                </div>

                {activeParty.notes && (
                  <div
                    style={{
                      padding: '12px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: '12.5px',
                      color: 'var(--text-muted)',
                      fontStyle: 'italic',
                    }}
                  >
                    Notas: {activeParty.notes}
                  </div>
                )}
              </div>
            )}

            {dossierTab === 'contracts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {linkedContracts.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-subtle)' }}>
                    Nenhum contrato formal registrado com esta parte.
                  </div>
                ) : (
                  linkedContracts.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        padding: '12px 14px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{c.title}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                          Ref: {c.numberRef} • Tipo: {c.contractType.toUpperCase()}
                        </div>
                      </div>
                      <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('contracts')}>
                        Abrir
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {dossierTab === 'docs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {linkedDocs.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-subtle)' }}>
                    Nenhum documento anexado para esta pessoa/entidade.
                  </div>
                ) : (
                  linkedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setViewingDocument(doc)}
                      style={{
                        padding: '10px 14px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{doc.title}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                          {doc.category} • {formatDate(doc.issueDate)}
                        </div>
                      </div>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewFile(doc);
                        }}
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <PartyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        partyToEdit={editingParty}
      />
    </div>
  );
};
