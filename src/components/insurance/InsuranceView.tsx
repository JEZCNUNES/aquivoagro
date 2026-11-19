import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InsuranceRecord } from '../../types';
import {
  ShieldCheck,
  Plus,
  Calendar,
  DollarSign,
  AlertTriangle,
  Building2,
  Tractor,
  Eye,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { formatCurrencyBRL, formatDateBR, getDaysDiff, getTodayIso } from '../../utils/formatters';

export const InsuranceView: React.FC = () => {
  const { insurance, documents, setPreviewFile } = useApp();

  const [activeType, setActiveType] = useState<string>('all');
  const [selectedPolicy, setSelectedPolicy] = useState<InsuranceRecord | null>(null);

  const today = getTodayIso();

  const filteredInsurance = insurance.filter((ins) => {
    if (activeType !== 'all' && ins.type !== activeType) return false;
    return true;
  });

  const totalInsuredAmountCents = insurance.reduce((acc, i) => acc + i.insuredAmountCents, 0);
  const totalPremiumsCents = insurance.reduce((acc, i) => acc + i.premiumCents, 0);

  return (
    <div className="content-container">
      {/* Cabeçalho */}
      <div className="view-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="view-title">Seguros Rurais & Patrimoniais</h1>
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
              Proteção Patrimonial • Seção 12
            </span>
          </div>
          <p className="view-subtitle">
            Gestão estruturada de apólices rurais (lavoura de grãos), proteção de maquinário agrícola (tratores e colhedoras) e frota de transporte.
          </p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="kpi-grid" style={{ marginBottom: '24px' }}>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Cobertura Total Contratada</span>
            <div className="kpi-icon-box" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--primary)' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: 'var(--primary-dark)' }}>
            {formatCurrencyBRL(totalInsuredAmountCents)}
          </div>
          <div className="kpi-subtext">Capital segurado em lavoura e ativos</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Prêmios Totais Pagos</span>
            <div className="kpi-icon-box" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#1E40AF' }}>
            {formatCurrencyBRL(totalPremiumsCents)}
          </div>
          <div className="kpi-subtext">Custo financeiro de proteção da safra</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Apólices Vencendo em 90 dias</span>
            <div className="kpi-icon-box" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#D97706' }}>
            {insurance.filter((i) => i.status === 'expiring').length} Apólice(s)
          </div>
          <div className="kpi-subtext">Requer renovação pré-colheita</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="tabs-container" style={{ marginBottom: '20px' }}>
        <button
          className={`tab-btn ${activeType === 'all' ? 'active' : ''}`}
          onClick={() => setActiveType('all')}
        >
          Todas as Apólices ({insurance.length})
        </button>
        <button
          className={`tab-btn ${activeType === 'rural_producao' ? 'active' : ''}`}
          onClick={() => setActiveType('rural_producao')}
        >
          Rural / Produção (Lavoura)
        </button>
        <button
          className={`tab-btn ${activeType === 'veiculos_maquinas' ? 'active' : ''}`}
          onClick={() => setActiveType('veiculos_maquinas')}
        >
          Veículos & Máquinas Agrícolas
        </button>
      </div>

      {/* Lista de Apólices */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredInsurance.map((ins) => {
          const daysLeft = getDaysDiff(today, ins.endDate);
          const isExpiring = daysLeft >= 0 && daysLeft <= 90;
          const isExpired = daysLeft < 0;

          const linkedDoc = documents.find((d) => d.id === ins.documentId);

          return (
            <div
              key={ins.id}
              className="card"
              style={{
                padding: '20px',
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
                  <ShieldCheck size={22} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '15.5px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                      {ins.insurerName} — Apólice {ins.policyNumber}
                    </h3>
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
                      {ins.type === 'rural_producao' ? 'Seguro Agrícola' : 'Máquinas & Frotas'}
                    </span>
                    {ins.linkedPropertyName && (
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
                        {ins.linkedPropertyName}
                      </span>
                    )}
                    {ins.linkedAssetName && (
                      <span
                        style={{
                          backgroundColor: '#EFF6FF',
                          color: '#1E40AF',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '12px',
                        }}
                      >
                        {ins.linkedAssetName}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-subtle)',
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>Vigência: {formatDateBR(ins.startDate)} até <strong>{formatDateBR(ins.endDate)}</strong></span>
                    <span>
                      Cobertura: <strong>{formatCurrencyBRL(ins.insuredAmountCents)}</strong>
                    </span>
                    <span>
                      Prêmio da Apólice: <strong>{formatCurrencyBRL(ins.premiumCents)}</strong>
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '11.5px',
                      color: 'var(--text-muted)',
                      marginTop: '4px',
                      display: 'flex',
                      gap: '6px',
                      flexWrap: 'wrap',
                    }}
                  >
                    Coberturas: {ins.coveredItems.join(' • ')}
                  </div>
                </div>
              </div>

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
                      ? 'Expirada'
                      : isExpiring
                      ? `Vence em ${daysLeft} dias!`
                      : 'Apólice Vigente'}
                  </span>
                </div>

                {linkedDoc && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setPreviewFile(linkedDoc)}
                    title="Visualizar Apólice Digital"
                  >
                    <Eye size={15} />
                    <span>Ver Apólice</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
