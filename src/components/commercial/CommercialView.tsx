import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CommercialRecord } from '../../types';
import {
  TrendingUp,
  Boxes,
  Truck,
  DollarSign,
  FileSignature,
  Calendar,
  CheckCircle2,
  Clock,
  Building2,
  BarChart2,
  ArrowRight,
} from 'lucide-react';
import { formatCurrencyBRL, formatDateBR } from '../../utils/formatters';

export const CommercialView: React.FC = () => {
  const { commercial, safraFilter, setSafraFilter, setActiveTab } = useApp();

  const [activeCulture, setActiveCulture] = useState<string>('all');

  const filteredCommercial = commercial.filter((item) => {
    if (activeCulture !== 'all' && item.culture !== activeCulture) return false;
    if (safraFilter !== 'all' && item.cropSeason !== safraFilter) return false;
    return true;
  });

  // Métricas agregadas
  const totalVolumeSacks = filteredCommercial.reduce((acc, c) => acc + c.totalVolumeSacks, 0);
  const totalDeliveredSacks = filteredCommercial.reduce((acc, c) => acc + c.deliveredVolumeSacks, 0);
  const totalCommercialCents = filteredCommercial.reduce((acc, c) => acc + c.totalAmountCents, 0);
  const totalReceivedCents = filteredCommercial.reduce((acc, c) => acc + c.receivedAmountCents, 0);

  const deliveryPercent = totalVolumeSacks > 0 ? Math.round((totalDeliveredSacks / totalVolumeSacks) * 100) : 0;
  const financialPercent = totalCommercialCents > 0 ? Math.round((totalReceivedCents / totalCommercialCents) * 100) : 0;

  return (
    <div className="content-container">
      {/* Cabeçalho */}
      <div className="view-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="view-title">Comercialização da Produção</h1>
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
              Cadeia de Vendas & Fixações • Seção 8
            </span>
          </div>
          <p className="view-subtitle">
            Acompanhe o ciclo completo de venda de grãos: volume contratado, fixações de preço por saca, entregas físicas no armazém e valores liquidados.
          </p>
        </div>
      </div>

      {/* Cards de Resumo Comercial */}
      <div className="kpi-grid" style={{ marginBottom: '24px' }}>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Volume Negociado</span>
            <div className="kpi-icon-box" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--primary)' }}>
              <Boxes size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: 'var(--primary-dark)' }}>
            {totalVolumeSacks.toLocaleString('pt-BR')} Sacas
          </div>
          <div className="kpi-subtext">
            {totalDeliveredSacks.toLocaleString('pt-BR')} sacas entregues ({deliveryPercent}%)
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Faturado</span>
            <div className="kpi-icon-box" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#1E40AF' }}>
            {formatCurrencyBRL(totalCommercialCents)}
          </div>
          <div className="kpi-subtext">Preço médio ponderado garantido</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Valores Já Recebidos</span>
            <div className="kpi-icon-box" style={{ backgroundColor: '#DCFCE7', color: '#166534' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#166534' }}>
            {formatCurrencyBRL(totalReceivedCents)}
          </div>
          <div className="kpi-subtext">{financialPercent}% do total liquidado em conta</div>
        </div>
      </div>

      {/* Filtros por Cultura */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '18px',
        }}
      >
        <div className="tabs-container" style={{ margin: 0 }}>
          <button
            className={`tab-btn ${activeCulture === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCulture('all')}
          >
            Todas as Culturas ({commercial.length})
          </button>
          <button
            className={`tab-btn ${activeCulture === 'Soja' ? 'active' : ''}`}
            onClick={() => setActiveCulture('Soja')}
          >
            Soja
          </button>
          <button
            className={`tab-btn ${activeCulture === 'Milho' ? 'active' : ''}`}
            onClick={() => setActiveCulture('Milho')}
          >
            Milho Safrinha
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Safra:</span>
          <select
            className="form-select"
            value={safraFilter}
            onChange={(e) => setSafraFilter(e.target.value)}
            style={{ minWidth: '160px' }}
          >
            <option value="all">Todas as Safras</option>
            <option value="Safra 2026/2027">Safra 2026/2027</option>
            <option value="Safra 2025/2026">Safra 2025/2026</option>
          </select>
        </div>
      </div>

      {/* Lista de Contratos e Operações Comerciais */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredCommercial.map((op) => {
          const itemDeliveryPercent = Math.round((op.deliveredVolumeSacks / op.totalVolumeSacks) * 100);
          const itemFinancialPercent = Math.round((op.receivedAmountCents / op.totalAmountCents) * 100);

          return (
            <div
              key={op.id}
              className="card"
              style={{
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                    }}
                  >
                    <TrendingUp size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                        Venda de {op.culture} — {op.buyerName}
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
                        {op.contractNumber}
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
                        {op.cropSeason}
                      </span>
                    </div>

                    <div style={{ fontSize: '12.5px', color: 'var(--text-subtle)', marginTop: '4px' }}>
                      Fixação: <strong>{formatCurrencyBRL(op.fixedPricePerSackCents)} / saca</strong> • Prazo Limite: {formatDateBR(op.deliveryDeadline)}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-dark)' }}>
                    {formatCurrencyBRL(op.totalAmountCents)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>
                    {formatCurrencyBRL(op.receivedAmountCents)} recebido ({itemFinancialPercent}%)
                  </div>
                </div>
              </div>

              {/* Barras de Progresso: Entregas Físicas vs Liquidação Financeira */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  padding: '14px 18px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    <span>Cumprimento Físico (Entregas nos Silos)</span>
                    <strong style={{ color: 'var(--primary)' }}>
                      {op.deliveredVolumeSacks.toLocaleString('pt-BR')} / {op.totalVolumeSacks.toLocaleString('pt-BR')} Sacas ({itemDeliveryPercent}%)
                    </strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${itemDeliveryPercent}%`,
                        height: '100%',
                        backgroundColor: '#16A34A',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    <span>Liquidação Financeira (Valores Creditados)</span>
                    <strong style={{ color: '#2563EB' }}>
                      {formatCurrencyBRL(op.receivedAmountCents)} ({itemFinancialPercent}%)
                    </strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${itemFinancialPercent}%`,
                        height: '100%',
                        backgroundColor: '#2563EB',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
