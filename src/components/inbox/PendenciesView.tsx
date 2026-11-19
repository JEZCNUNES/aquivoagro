import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertCircle,
  FileText,
  UserCheck,
  FileSignature,
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { formatDateBR, formatCurrencyBRL } from '../../utils/formatters';

type PendencyCategory = 'all' | 'documental' | 'cadastral' | 'contratual' | 'financeira' | 'administrativa';

export const PendenciesView: React.FC = () => {
  const { documents, parties, contracts, transactions, tasks, setActiveTab, setViewingDocument } = useApp();

  const [activeCategory, setActiveCategory] = useState<PendencyCategory>('all');

  // 1. Pendências Documentais
  const documentalPendencies = documents
    .filter((d) => d.status === 'pending' || !d.propertyId || d.isDuplicateSuspect)
    .map((d) => ({
      id: `doc-${d.id}`,
      title: d.title,
      type: 'documental' as const,
      categoryLabel: 'Documental',
      description: d.isDuplicateSuspect
        ? 'Suspeita de duplicidade técnica'
        : !d.propertyId
        ? 'Documento sem vínculo de propriedade'
        : 'Aguardando validação formal',
      actionLabel: 'Tratar na Caixa de Entrada',
      targetTab: 'inbox' as const,
    }));

  // 2. Pendências Cadastrais
  const cadastralPendencies = parties
    .filter((p) => !p.taxId || !p.contact)
    .map((p) => ({
      id: `cad-${p.id}`,
      title: p.name,
      type: 'cadastral' as const,
      categoryLabel: 'Cadastral',
      description: !p.taxId ? 'Cadastro sem CPF/CNPJ informado' : 'Cadastro sem contato telefônico',
      actionLabel: 'Completar Cadastro',
      targetTab: 'parties' as const,
    }));

  // 3. Pendências Contratuais
  const contractualPendencies = contracts
    .filter((c) => !c.linkedDocumentId || c.status === 'expiring')
    .map((c) => ({
      id: `ctr-${c.id}`,
      title: c.title,
      type: 'contratual' as const,
      categoryLabel: 'Contratual',
      description: !c.linkedDocumentId
        ? 'Contrato sem anexo digital do PDF assinado'
        : 'Contrato vencendo nos próximos 90 dias',
      actionLabel: 'Ver Contrato',
      targetTab: 'contracts' as const,
    }));

  // 4. Pendências Financeiras (ex: rateio incompleto ou sem conciliação)
  const financialPendencies = transactions
    .filter((tx) => tx.isAllocationComplete === false || (tx.status === 'paid' && tx.isReconciled === false))
    .map((tx) => ({
      id: `fin-${tx.id}`,
      title: tx.description,
      type: 'financeira' as const,
      categoryLabel: 'Financeira',
      description: tx.isAllocationComplete === false
        ? 'Rateio incompleto: menos de 100% alocado'
        : 'Pagamento sem conciliação bancária vinculada',
      actionLabel: 'Ajustar Rateio / Conciliar',
      targetTab: 'financial' as const,
    }));

  // 5. Tarefas Administrativas em aberto
  const administrativePendencies = tasks
    .filter((t) => t.status !== 'completed')
    .map((t) => ({
      id: `task-${t.id}`,
      title: t.title,
      type: 'administrativa' as const,
      categoryLabel: 'Administrativa',
      description: `Responsável: ${t.assignedTo} • Prazo: ${formatDateBR(t.dueDate)}`,
      actionLabel: 'Ver Agenda',
      targetTab: 'tasks' as const,
    }));

  const allPendencies = [
    ...documentalPendencies,
    ...cadastralPendencies,
    ...contractualPendencies,
    ...financialPendencies,
    ...administrativePendencies,
  ];

  const filteredPendencies =
    activeCategory === 'all'
      ? allPendencies
      : allPendencies.filter((p) => p.type === activeCategory);

  return (
    <div className="content-container">
      {/* Cabeçalho */}
      <div className="view-header">
        <div>
          <h1 className="view-title">Fila de Pendências da Operação LSA</h1>
          <p className="view-subtitle">
            Monitoramento de qualidade e conformidade: saneamento de dados antes de gerar relatórios e declarações oficiais.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#FEF3C7',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #FDE68A',
            color: '#92400E',
          }}
        >
          <ShieldAlert size={22} />
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
              Pendências Totais
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>
              {allPendencies.length} pendência(s) ativa(s)
            </div>
          </div>
        </div>
      </div>

      {/* Sub-abas de Pendências */}
      <div className="tabs-container" style={{ marginBottom: '20px' }}>
        <button
          className={`tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          Todas ({allPendencies.length})
        </button>
        <button
          className={`tab-btn ${activeCategory === 'documental' ? 'active' : ''}`}
          onClick={() => setActiveCategory('documental')}
        >
          Documentais ({documentalPendencies.length})
        </button>
        <button
          className={`tab-btn ${activeCategory === 'cadastral' ? 'active' : ''}`}
          onClick={() => setActiveCategory('cadastral')}
        >
          Cadastrais ({cadastralPendencies.length})
        </button>
        <button
          className={`tab-btn ${activeCategory === 'contratual' ? 'active' : ''}`}
          onClick={() => setActiveCategory('contratual')}
        >
          Contratuais ({contractualPendencies.length})
        </button>
        <button
          className={`tab-btn ${activeCategory === 'financeira' ? 'active' : ''}`}
          onClick={() => setActiveCategory('financeira')}
        >
          Financeiras ({financialPendencies.length})
        </button>
        <button
          className={`tab-btn ${activeCategory === 'administrativa' ? 'active' : ''}`}
          onClick={() => setActiveCategory('administrativa')}
        >
          Administrativas ({administrativePendencies.length})
        </button>
      </div>

      {/* Listagem de Pendências */}
      {filteredPendencies.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-subtle)' }}>
          <CheckCircle2 size={40} color="#16A34A" style={{ margin: '0 auto 10px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
            Nenhuma pendência encontrada!
          </h3>
          <p style={{ fontSize: '13px' }}>A base de dados está em perfeita conformidade nesta categoria.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredPendencies.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                borderLeft: '4px solid #F59E0B',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#FEF3C7',
                    color: '#B45309',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AlertCircle size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                      {item.title}
                    </h4>
                    <span
                      style={{
                        backgroundColor: '#F3F4F6',
                        color: '#4B5563',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '12px',
                      }}
                    >
                      {item.categoryLabel}
                    </span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {item.description}
                  </div>
                </div>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab(item.targetTab)}
                style={{ flexShrink: 0 }}
              >
                <span>{item.actionLabel}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
