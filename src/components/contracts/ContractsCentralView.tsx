import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ContractRecord, ContractType } from '../../types';
import {
  FileSignature,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Building2,
  Users,
  Eye,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { formatCurrencyBRL, formatDateBR, getDaysDiff, getTodayIso } from '../../utils/formatters';

export const ContractsCentralView: React.FC = () => {
  const {
    contracts,
    properties,
    parties,
    documents,
    addContract,
    setPreviewFile,
    setActiveTab,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedContract, setSelectedContract] = useState<ContractRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [numberRef, setNumberRef] = useState('');
  const [contractType, setContractType] = useState<ContractType>('arrendamento');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [primaryContextType, setPrimaryContextType] = useState<'property' | 'commercial' | 'financial' | 'equipment'>('property');
  const [primaryContextId, setPrimaryContextId] = useState('');
  const [renewalRule, setRenewalRule] = useState('');
  const [notes, setNotes] = useState('');

  const today = getTodayIso();

  const filteredContracts = contracts.filter((c) => {
    if (typeFilter !== 'all' && c.contractType !== typeFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchNum = c.numberRef.toLowerCase().includes(q);
      const matchContext = c.primaryContext.name.toLowerCase().includes(q);
      const matchParties = c.parties.some((p) => p.partyName.toLowerCase().includes(q));
      if (!matchTitle && !matchNum && !matchContext && !matchParties) return false;
    }
    return true;
  });

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) {
      showToast('Preencha título, data de início e de término do contrato.');
      return;
    }

    let ctxName = 'Geral';
    if (primaryContextType === 'property') {
      const p = properties.find((prop) => prop.id === primaryContextId);
      if (p) ctxName = p.name;
    }

    const amountCents = amountStr ? Math.round(parseFloat(amountStr) * 100) : undefined;

    addContract({
      title,
      numberRef: numberRef || `CTR-${Date.now()}`,
      contractType,
      startDate,
      endDate,
      amountCents,
      status: 'active',
      parties: [
        { partyId: 'titular', partyName: 'Roberto Mendonça', role: 'Contratante / Titular' },
      ],
      primaryContext: {
        type: primaryContextType,
        id: primaryContextId || 'ctx-default',
        name: ctxName,
      },
      renewalRule,
      notes,
    });

    setIsModalOpen(false);
    setTitle('');
    setNumberRef('');
    setStartDate('');
    setEndDate('');
    setAmountStr('');
    setNotes('');
  };

  return (
    <div className="content-container">
      {/* Cabeçalho */}
      <div className="view-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="view-title">Central Transversal de Contratos</h1>
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
              Consulta Transversal • ADR-03
            </span>
          </div>
          <p className="view-subtitle">
            Todos os instrumentos jurídicos e comerciais do produtor em um só lugar, independentemente de terem nascido em Propriedades, Compras, Comercialização ou Financiamentos.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} strokeWidth={2.5} />
          <span>Novo Contrato</span>
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
          <div className="global-search-container" style={{ width: '100%', maxWidth: '380px' }}>
            <Search size={16} className="search-icon-pos" />
            <input
              type="text"
              className="global-search-input"
              placeholder="Buscar por título, número, fazenda, parceiro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ minWidth: '170px' }}
          >
            <option value="all">Todos os Tipos</option>
            <option value="arrendamento">Arrendamento Rural</option>
            <option value="parceria">Parceria Rural</option>
            <option value="fornecimento">Fornecimento de Insumos</option>
            <option value="venda">Venda de Produção (Grãos)</option>
            <option value="financiamento">Financiamento / CPR</option>
            <option value="seguro">Apólice de Seguro</option>
            <option value="prestacao_servico">Prestação de Serviço</option>
          </select>

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ minWidth: '130px' }}
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="expiring">Vencendo (90 dias)</option>
            <option value="expired">Expirados</option>
          </select>
        </div>
      </div>

      {/* Lista de Contratos em Tabela / Cartões */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredContracts.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-subtle)' }}>
            Nenhum contrato encontrado para os critérios de busca.
          </div>
        ) : (
          filteredContracts.map((ctr) => {
            const daysLeft = getDaysDiff(today, ctr.endDate);
            const isExpiring = daysLeft >= 0 && daysLeft <= 90;
            const isExpired = daysLeft < 0;

            const linkedDoc = documents.find((d) => d.id === ctr.linkedDocumentId);

            return (
              <div
                key={ctr.id}
                className="card"
                style={{
                  padding: '18px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  borderLeft: isExpired
                    ? '4px solid #DC2626'
                    : isExpiring
                    ? '4px solid #F59E0B'
                    : '4px solid #16A34A',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <FileSignature size={22} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                        {ctr.title}
                      </h3>
                      <span
                        style={{
                          backgroundColor: '#F3F4F6',
                          color: '#4B5563',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                        }}
                      >
                        Ref: {ctr.numberRef}
                      </span>
                      <span
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--primary-dark)',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '12px',
                        }}
                      >
                        {ctr.contractType.toUpperCase()}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: '12.5px',
                        color: 'var(--text-subtle)',
                        marginTop: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={14} color="var(--primary)" />
                        Contexto Primário: <strong>{ctr.primaryContext.name}</strong>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} />
                        Vigência: {formatDateBR(ctr.startDate)} até <strong>{formatDateBR(ctr.endDate)}</strong>
                      </span>
                      {ctr.amountCents ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <DollarSign size={14} color="#16A34A" />
                          Valor: <strong>{formatCurrencyBRL(ctr.amountCents)}</strong>
                        </span>
                      ) : null}
                    </div>

                    {ctr.parties.length > 0 && (
                      <div
                        style={{
                          fontSize: '11.5px',
                          color: 'var(--text-muted)',
                          marginTop: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Users size={13} />
                        Partes: {ctr.parties.map((p) => `${p.partyName} (${p.role})`).join(' • ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status e Ações */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: isExpired ? '#DC2626' : isExpiring ? '#D97706' : '#16A34A',
                      }}
                    >
                      {isExpired
                        ? 'Vencido'
                        : isExpiring
                        ? `Vence em ${daysLeft} dias!`
                        : 'Vigente'}
                    </span>
                  </div>

                  {linkedDoc && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setPreviewFile(linkedDoc)}
                      title="Ver PDF do Contrato"
                    >
                      <Eye size={15} />
                      <span>Ver PDF</span>
                    </button>
                  )}

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setSelectedContract(ctr)}
                  >
                    <span>Dossiê</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Drawer / Modal de Detalhes do Contrato Selecionado */}
      {selectedContract && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--primary)',
                  }}
                >
                  Dossiê Jurídico & Comercial
                </span>
                <h3 className="modal-title">{selectedContract.title}</h3>
              </div>
              <button className="btn-icon" onClick={() => setSelectedContract(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>NÚMERO / REFERÊNCIA</div>
                  <div style={{ fontSize: '14px', fontWeight: 800 }}>{selectedContract.numberRef}</div>
                </div>
                {selectedContract.amountCents && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>VALOR ESTIMADO</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary-dark)' }}>
                      {formatCurrencyBRL(selectedContract.amountCents)}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div className="card" style={{ padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>DATA DE INÍCIO</div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>{formatDateBR(selectedContract.startDate)}</div>
                </div>
                <div className="card" style={{ padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>DATA DE TÉRMINO</div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>{formatDateBR(selectedContract.endDate)}</div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Contexto Primário (Onde o Vínculo Nasce)</label>
                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  {selectedContract.primaryContext.type.toUpperCase()}: {selectedContract.primaryContext.name}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Partes Signatárias</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedContract.parties.map((p, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12.5px',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{p.partyName}</span>
                      <span style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>{p.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedContract.renewalRule && (
                <div className="form-group">
                  <label className="form-label">Regra de Renovação / Vencimento</label>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
                    {selectedContract.renewalRule}
                  </p>
                </div>
              )}

              {selectedContract.notes && (
                <div className="form-group">
                  <label className="form-label">Observações e Garantias</label>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
                    {selectedContract.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedContract(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Contrato */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Cadastrar Novo Contrato</h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleCreateContract}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Título do Instrumento</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Contrato de Arrendamento Fazenda Santa Cecília"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Número / Ref.</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: ARR-2026/04"
                      value={numberRef}
                      onChange={(e) => setNumberRef(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tipo de Contrato</label>
                    <select
                      className="form-select"
                      value={contractType}
                      onChange={(e) => setContractType(e.target.value as any)}
                    >
                      <option value="arrendamento">Arrendamento Rural</option>
                      <option value="parceria">Parceria Rural</option>
                      <option value="fornecimento">Fornecimento de Insumos</option>
                      <option value="venda">Venda de Produção</option>
                      <option value="financiamento">Financiamento / CPR</option>
                      <option value="seguro">Seguro</option>
                      <option value="prestacao_servico">Prestação de Serviço</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Data de Início</label>
                    <input
                      type="date"
                      className="form-input"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Data de Vencimento</label>
                    <input
                      type="date"
                      className="form-input"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Valor Estimado (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      placeholder="0,00"
                      value={amountStr}
                      onChange={(e) => setAmountStr(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Propriedade Vinculada</label>
                    <select
                      className="form-select"
                      value={primaryContextId}
                      onChange={(e) => {
                        setPrimaryContextId(e.target.value);
                        setPrimaryContextType('property');
                      }}
                    >
                      <option value="">Selecione...</option>
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Regra de Renovação / Cláusulas Chave</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Notificação prévia de 180 dias; reajuste por sacas de soja"
                    value={renewalRule}
                    onChange={(e) => setRenewalRule(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Registrar Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
