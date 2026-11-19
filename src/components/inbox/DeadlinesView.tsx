import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  AlertTriangle,
  Calendar,
  FileSignature,
  ShieldCheck,
  FileText,
  DollarSign,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { calculateDeadlinesBreakdown } from '../../utils/calculations';
import { formatCurrencyBRL, formatDateBR } from '../../utils/formatters';

export const DeadlinesView: React.FC = () => {
  const { documents, contracts, insurance, transactions, setActiveTab, setViewingDocument } = useApp();

  const [activeWindow, setActiveWindow] = useState<'all' | '7days' | '30days' | '60days' | '90days'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'contract' | 'insurance' | 'document' | 'financial'>('all');

  const { items7Days, items30Days, items60Days, items90Days, allUpcoming } =
    calculateDeadlinesBreakdown(documents, contracts, insurance, transactions);

  let displayedItems = allUpcoming;
  if (activeWindow === '7days') displayedItems = items7Days;
  else if (activeWindow === '30days') displayedItems = [...items7Days, ...items30Days];
  else if (activeWindow === '60days') displayedItems = [...items7Days, ...items30Days, ...items60Days];
  else if (activeWindow === '90days') displayedItems = allUpcoming;

  if (typeFilter !== 'all') {
    displayedItems = displayedItems.filter((i) => {
      if (typeFilter === 'financial') return i.type === 'payable' || i.type === 'receivable';
      return i.type === typeFilter;
    });
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contract':
        return <FileSignature size={18} />;
      case 'insurance':
        return <ShieldCheck size={18} />;
      case 'document':
        return <FileText size={18} />;
      default:
        return <DollarSign size={18} />;
    }
  };

  return (
    <div className="content-container">
      {/* Cabeçalho */}
      <div className="view-header">
        <div>
          <h1 className="view-title">Central Transversal de Vencimentos</h1>
          <p className="view-subtitle">
            Agenda unificada de contratos, apólices de seguro, certidões e obrigações financeiras organizadas por janelas de risco (7, 30, 60 e 90 dias).
          </p>
        </div>
      </div>

      {/* Cartões de Janelas de Vencimento */}
      <div className="kpi-grid" style={{ marginBottom: '24px' }}>
        <div
          className="kpi-card"
          onClick={() => setActiveWindow('7days')}
          style={{
            cursor: 'pointer',
            border: activeWindow === '7days' ? '2px solid #DC2626' : undefined,
          }}
        >
          <div className="kpi-header">
            <span className="kpi-title">Vencendo em 7 dias</span>
            <div className="kpi-icon-box" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#DC2626' }}>
            {items7Days.length}
          </div>
          <div className="kpi-subtext">Ação urgente requerida</div>
        </div>

        <div
          className="kpi-card"
          onClick={() => setActiveWindow('30days')}
          style={{
            cursor: 'pointer',
            border: activeWindow === '30days' ? '2px solid #D97706' : undefined,
          }}
        >
          <div className="kpi-header">
            <span className="kpi-title">Vencendo em 30 dias</span>
            <div className="kpi-icon-box" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#D97706' }}>
            {items7Days.length + items30Days.length}
          </div>
          <div className="kpi-subtext">Planejamento do mês</div>
        </div>

        <div
          className="kpi-card"
          onClick={() => setActiveWindow('60days')}
          style={{
            cursor: 'pointer',
            border: activeWindow === '60days' ? '2px solid #2563EB' : undefined,
          }}
        >
          <div className="kpi-header">
            <span className="kpi-title">Vencendo em 60 dias</span>
            <div className="kpi-icon-box" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#2563EB' }}>
            {items60Days.length}
          </div>
          <div className="kpi-subtext">Médio prazo</div>
        </div>

        <div
          className="kpi-card"
          onClick={() => setActiveWindow('90days')}
          style={{
            cursor: 'pointer',
            border: activeWindow === '90days' ? '2px solid #16A34A' : undefined,
          }}
        >
          <div className="kpi-header">
            <span className="kpi-title">Vencendo em 90 dias</span>
            <div className="kpi-icon-box" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#16A34A' }}>
            {allUpcoming.length}
          </div>
          <div className="kpi-subtext">Total transversal</div>
        </div>
      </div>

      {/* Filtros por Categoria de Obrigação */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div className="tabs-container" style={{ margin: 0 }}>
          <button
            className={`tab-btn ${typeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTypeFilter('all')}
          >
            Todos os Tipos ({displayedItems.length})
          </button>
          <button
            className={`tab-btn ${typeFilter === 'contract' ? 'active' : ''}`}
            onClick={() => setTypeFilter('contract')}
          >
            Contratos
          </button>
          <button
            className={`tab-btn ${typeFilter === 'insurance' ? 'active' : ''}`}
            onClick={() => setTypeFilter('insurance')}
          >
            Seguros
          </button>
          <button
            className={`tab-btn ${typeFilter === 'document' ? 'active' : ''}`}
            onClick={() => setTypeFilter('document')}
          >
            Documentos / Certidões
          </button>
          <button
            className={`tab-btn ${typeFilter === 'financial' ? 'active' : ''}`}
            onClick={() => setTypeFilter('financial')}
          >
            Obrigações Financeiras
          </button>
        </div>

        {activeWindow !== 'all' && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveWindow('all')}
          >
            Limpar Filtro de Janela
          </button>
        )}
      </div>

      {/* Listagem dos Vencimentos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {displayedItems.length === 0 ? (
          <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-subtle)' }}>
            Nenhum compromisso encontrado para os filtros selecionados.
          </div>
        ) : (
          displayedItems.map((item) => {
            const isUrgent = item.daysRemaining <= 7;
            const isWarning = item.daysRemaining > 7 && item.daysRemaining <= 30;

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  borderLeft: isUrgent
                    ? '4px solid #DC2626'
                    : isWarning
                    ? '4px solid #D97706'
                    : '4px solid #16A34A',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isUrgent ? '#FEE2E2' : isWarning ? '#FEF3C7' : '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isUrgent ? '#DC2626' : isWarning ? '#D97706' : '#2563EB',
                      flexShrink: 0,
                    }}
                  >
                    {getTypeIcon(item.type)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                      {item.entityName && (
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
                          {item.entityName}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginTop: '4px' }}>
                      Data de Vencimento: <strong>{formatDateBR(item.dueDate)}</strong>
                      {item.amountCents ? (
                        <span style={{ marginLeft: '12px' }}>
                          Valor: <strong>{formatCurrencyBRL(item.amountCents)}</strong>
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: isUrgent ? '#DC2626' : isWarning ? '#D97706' : '#16A34A',
                      }}
                    >
                      {item.daysRemaining < 0
                        ? `Vencido há ${Math.abs(item.daysRemaining)} dia(s)`
                        : item.daysRemaining === 0
                        ? 'Vence hoje!'
                        : `Vence em ${item.daysRemaining} dia(s)`}
                    </span>
                  </div>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      if (item.type === 'contract') setActiveTab('contracts');
                      else if (item.type === 'insurance') setActiveTab('insurance');
                      else if (item.type === 'document') setActiveTab('documents');
                      else setActiveTab('financial');
                    }}
                  >
                    <span>Ver no Módulo</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
