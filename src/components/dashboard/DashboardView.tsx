import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  Tractor,
  Calendar,
  Clock,
  CheckCircle,
  HelpCircle,
  ArrowUpRight,
  ChevronRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import {
  formatCurrency,
  formatDate,
  formatFileSize,
  getTodayIso,
  getDaysDiff,
} from '../../utils/formatters';
import {
  calculateDashboardMetrics,
  filterByProperty,
  filterByCropSeason,
} from '../../utils/calculations';
import { StatusBadge } from '../common/Badge';

export const DashboardView: React.FC = () => {
  const {
    documents,
    transactions,
    equipment,
    properties,
    selectedPropertyId,
    periodFilter,
    setPeriodFilter,
    safraFilter,
    setSafraFilter,
    setIsAddDocModalOpen,
    setActiveTab,
    setViewingDocument,
    setActiveEquipmentDetailId,
  } = useApp();

  const today = getTodayIso();

  // Cálculo das Métricas
  const metrics = useMemo(() => {
    return calculateDashboardMetrics(
      documents,
      transactions,
      equipment,
      selectedPropertyId,
      periodFilter,
      safraFilter
    );
  }, [
    documents,
    transactions,
    equipment,
    selectedPropertyId,
    periodFilter,
    safraFilter,
  ]);

  // Lista de Documentos Recentes (filtrados por propriedade)
  const recentDocs = useMemo(() => {
    let list = filterByProperty(documents, selectedPropertyId);
    list = filterByCropSeason(list, safraFilter);
    return list
      .filter((d) => d.status !== 'archived')
      .slice(0, 5);
  }, [documents, selectedPropertyId, safraFilter]);

  // Próximas contas a vencer
  const upcomingBills = useMemo(() => {
    let list = filterByProperty(transactions, selectedPropertyId);
    list = filterByCropSeason(list, safraFilter);
    return list
      .filter((t) => t.status === 'open' && t.type === 'expense')
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 4);
  }, [transactions, selectedPropertyId, safraFilter]);

  // Dados para o Gráfico Mensal de Receitas vs Despesas (Últimos 6 meses)
  const monthlyChartData = useMemo(() => {
    const months = [
      { key: 'Mai', label: 'Maio', income: 45000000, expense: 22000000 },
      { key: 'Jun', label: 'Junho', income: 38000000, expense: 29000000 },
      { key: 'Jul', label: 'Julho', income: 31250000, expense: 18400000 },
      { key: 'Ago', label: 'Agosto', income: 16500000, expense: 25500000 },
      { key: 'Set', label: 'Setembro', income: 42000000, expense: 34000000 },
      { key: 'Out', label: 'Outubro', income: 22000000, expense: 19800000 },
    ];
    return months;
  }, []);

  // Dados para Despesas por Categoria
  const categoryExpenses = useMemo(() => {
    const filteredTxs = filterByProperty(transactions, selectedPropertyId).filter(
      (t) => t.type === 'expense' && t.status === 'paid'
    );
    const totals: Record<string, number> = {};
    let totalAll = 0;

    filteredTxs.forEach((t) => {
      totals[t.category] = (totals[t.category] || 0) + t.amountCents;
      totalAll += t.amountCents;
    });

    return Object.entries(totals)
      .map(([cat, amount]) => ({
        category: cat,
        amount,
        percentage: totalAll > 0 ? Math.round((amount / totalAll) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, selectedPropertyId]);

  // Distribuição de Documentos por Tipo
  const docTypeDistribution = useMemo(() => {
    const active = filterByProperty(documents, selectedPropertyId).filter(
      (d) => d.status !== 'archived'
    );
    const counts: Record<string, number> = {};
    active.forEach((d) => {
      counts[d.category] = (counts[d.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [documents, selectedPropertyId]);

  return (
    <div className="content-container">
      {/* Cabeçalho do HUD e Filtros */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--primary)',
                backgroundColor: 'var(--bg-tertiary)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--primary-border)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Painel Gerencial HUD
            </span>
          </div>
          <h1 className="page-title" style={{ marginTop: '4px' }}>
            Visão Geral da Propriedade
          </h1>
          <p className="page-description">
            Acompanhe a saúde documental, movimentações de caixa e histórico de maquinário em tempo real.
          </p>
        </div>

        {/* Barra de Filtros */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Período:
            </span>
            <select
              className="form-select"
              style={{ height: '36px', padding: '0 10px', fontSize: '13px' }}
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as any)}
            >
              <option value="all">Todo o Histórico</option>
              <option value="30days">Últimos 30 dias</option>
              <option value="90days">Últimos 90 dias</option>
              <option value="year">Ano Atual</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Safra:
            </span>
            <select
              className="form-select"
              style={{ height: '36px', padding: '0 10px', fontSize: '13px' }}
              value={safraFilter}
              onChange={(e) => setSafraFilter(e.target.value)}
            >
              <option value="all">Todas as Safras</option>
              <option value="Safra 2026/2027">Safra 2026/2027</option>
              <option value="Safra 2025/2026">Safra 2025/2026</option>
            </select>
          </div>

          <button
            onClick={() => setIsAddDocModalOpen(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} /> Adicionar documento
          </button>
        </div>
      </div>

      {/* Grid com os 9 Indicadores HUD Gerenciais */}
      <div className="kpi-grid">
        {/* 1. Saldo Disponível */}
        <div className="kpi-card highlight">
          <div className="kpi-header">
            <span className="kpi-label">Saldo Disponível</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--primary)' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="kpi-value">{formatCurrency(metrics.availableBalanceCents)}</div>
          <div className="kpi-footer">Saldo inicial + entradas - saídas realizadas</div>
        </div>

        {/* 2. Resultado de Caixa do Período */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Resultado de Caixa</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: '#DCFCE7', color: '#166534' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div
            className="kpi-value"
            style={{ color: metrics.cashResultCents >= 0 ? '#16A34A' : '#DC2626' }}
          >
            {formatCurrency(metrics.cashResultCents)}
          </div>
          <div className="kpi-footer">Receitas recebidas menos despesas pagas</div>
        </div>

        {/* 3. Receitas Recebidas */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Receitas Recebidas</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#16A34A' }}>
            {formatCurrency(metrics.receivedIncomeCents)}
          </div>
          <div className="kpi-footer">Entradas financeiras liquidadas</div>
        </div>

        {/* 4. Despesas Pagas */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Despesas Pagas</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: 'var(--text-main)' }}>
            {formatCurrency(metrics.paidExpenseCents)}
          </div>
          <div className="kpi-footer">Saídas quitadas no período selecionado</div>
        </div>

        {/* 5. Total Contas a Pagar (Abertas) */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Contas a Pagar</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#D97706' }}>
            {formatCurrency(metrics.totalPayableOpenCents)}
          </div>
          <div className="kpi-footer">Previsão de despesas pendentes</div>
        </div>

        {/* 6. Total Contas a Receber (Abertas) */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Contas a Receber</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#2563EB' }}>
            {formatCurrency(metrics.totalReceivableOpenCents)}
          </div>
          <div className="kpi-footer">Previsão de entradas futuras</div>
        </div>

        {/* 7. Valor de Contas Atrasadas */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Contas em Atraso</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#DC2626' }}>
            {formatCurrency(metrics.overduePayableCents)}
          </div>
          <div className="kpi-footer">
            {metrics.overduePayableCount} conta(s) com vencimento expirado
          </div>
        </div>

        {/* 8. Total Documentos Ativos */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Documentos Ativos</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--primary)' }}>
              <FileText size={20} />
            </div>
          </div>
          <div className="kpi-value">{metrics.totalActiveDocs}</div>
          <div className="kpi-footer">Notas, contratos e certidões</div>
        </div>

        {/* 9. Documentos Adicionados no Período */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Inclusões no Período</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--primary)' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="kpi-value">{metrics.docsAddedInPeriod}</div>
          <div className="kpi-footer">Documentos cadastrados na janela</div>
        </div>
      </div>

      {/* SEÇÃO "RESUMO DA PROPRIEDADE" — RESPOSTAS CALCULADAS POR REGRAS REAIS */}
      <div
        className="card"
        style={{
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)',
          border: '1px solid var(--primary-border)',
        }}
      >
        <div className="card-header">
          <div className="card-title">
            <Sparkles size={18} color="var(--primary)" />
            Resumo Operacional da Propriedade (Cálculos Automáticos)
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
            Calculado sobre os registros reais da demonstração
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Qual categoria concentrou mais despesas?
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-dark)' }}>
              {metrics.topExpenseCategory
                ? `${metrics.topExpenseCategory.category} (${formatCurrency(metrics.topExpenseCategory.amountCents)})`
                : 'Nenhuma despesa no período'}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Quanto vence nos próximos sete dias?
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#D97706' }}>
              {formatCurrency(metrics.dueIn7DaysCents)} ({metrics.dueIn7DaysCount} conta(s))
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Quantos documentos estão sem classificação?
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: metrics.unclassifiedDocsCount > 0 ? '#DC2626' : '#16A34A' }}>
              {metrics.unclassifiedDocsCount} documento(s) pendente(s)
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Qual máquina teve maior gasto com manutenção?
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-dark)' }}>
              {metrics.topMaintenanceEquipment
                ? `${metrics.topMaintenanceEquipment.equipment.name} (${formatCurrency(metrics.topMaintenanceEquipment.maintenanceExpenseCents)})`
                : 'Sem gastos de manutenção'}
            </div>
          </div>
        </div>
      </div>

      {/* GRÁFICOS INTERATIVOS EM VERDE */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        {/* Gráfico 1: Receitas vs Despesas por mês */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <TrendingUp size={18} color="var(--primary)" />
              Receitas Realizadas vs Despesas Pagas
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
              Histórico Semestral
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div style={{ height: '220px', width: '100%', position: 'relative' }}>
            <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%' }}>
              {/* Linhas de grade horizontais */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="#E2E8F0" strokeWidth="1" />

              {monthlyChartData.map((d, i) => {
                const x = 60 + i * 70;
                const maxVal = 50000000;
                const incomeH = (d.income / maxVal) * 140;
                const expenseH = (d.expense / maxVal) * 140;

                return (
                  <g key={d.key}>
                    {/* Barra de Receita */}
                    <rect
                      x={x}
                      y={170 - incomeH}
                      width="18"
                      height={incomeH}
                      fill="#16A34A"
                      rx="3"
                    >
                      <title>{`${d.label} - Receitas: R$ ${(d.income / 100).toLocaleString('pt-BR')}`}</title>
                    </rect>
                    {/* Barra de Despesa */}
                    <rect
                      x={x + 22}
                      y={170 - expenseH}
                      width="18"
                      height={expenseH}
                      fill="#86EFAC"
                      rx="3"
                    >
                      <title>{`${d.label} - Despesas: R$ ${(d.expense / 100).toLocaleString('pt-BR')}`}</title>
                    </rect>
                    {/* Rótulo do Mês */}
                    <text
                      x={x + 20}
                      y="190"
                      textAnchor="middle"
                      fill="#64748B"
                      fontSize="11"
                      fontFamily="sans-serif"
                    >
                      {d.key}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              marginTop: '10px',
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#16A34A', borderRadius: '2px' }} />
              <span>Receitas Recebidas</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#86EFAC', borderRadius: '2px' }} />
              <span>Despesas Pagas</span>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Despesas por Categoria */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <DollarSign size={18} color="var(--primary)" />
              Despesas por Categoria
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
              Distribuição Relativa
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            {categoryExpenses.slice(0, 5).map((item) => (
              <div key={item.category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.category}</span>
                  <span style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>
                    {formatCurrency(item.amount)} ({item.percentage}%)
                  </span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      backgroundColor: 'var(--primary)',
                      width: `${item.percentage}%`,
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BLOCOS ADICIONAIS: Documentos Recentes e Próximas Contas a Vencer */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Documentos Recentes */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <FileText size={18} color="var(--primary)" />
              Documentos Recentes
            </div>
            <button
              onClick={() => setActiveTab('documents')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Ver todos <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setViewingDocument(doc)}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'var(--transition)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileText size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-main)' }}>
                      {doc.title}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                      {doc.category} • {formatDate(doc.issueDate)}
                    </div>
                  </div>
                </div>
                <StatusBadge status={doc.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Próximas Contas a Vencer */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Clock size={18} color="#D97706" />
              Próximas Contas a Vencer
            </div>
            <button
              onClick={() => setActiveTab('financial')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Ir ao Financeiro <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {upcomingBills.map((bill) => {
              const daysDiff = getDaysDiff(bill.dueDate, today);
              const isOverdue = daysDiff < 0;

              return (
                <div
                  key={bill.id}
                  onClick={() => setActiveTab('financial')}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isOverdue ? '#FCA5A5' : 'var(--border-color)'}`,
                    backgroundColor: isOverdue ? '#FEF2F2' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-main)' }}>
                      {bill.description}
                    </div>
                    <div style={{ fontSize: '12px', color: isOverdue ? '#DC2626' : 'var(--text-subtle)' }}>
                      Vencimento: {formatDate(bill.dueDate)}{' '}
                      {isOverdue ? `(Atrasada há ${Math.abs(daysDiff)} dias)` : `(em ${daysDiff} dias)`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: isOverdue ? '#DC2626' : 'var(--primary-dark)', fontSize: '14px' }}>
                      {formatCurrency(bill.amountCents)}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                      {bill.paymentMethod || 'Boleto'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
