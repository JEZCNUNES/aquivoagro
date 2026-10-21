import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FinancialTransaction,
  FinancialCategory,
  PaymentMethod,
} from '../../types';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Plus,
  Download,
  Filter,
  Search,
  FileText,
  Tractor,
  RotateCcw,
  Check,
  X,
} from 'lucide-react';
import {
  formatCurrency,
  formatDate,
  getTodayIso,
  getDaysDiff,
} from '../../utils/formatters';
import {
  calculateDashboardMetrics,
  filterByProperty,
  filterTransactionsByPeriod,
} from '../../utils/calculations';
import { exportToCsv } from '../../utils/csvExport';
import { TransactionModal } from './TransactionModal';

export const FinancialView: React.FC = () => {
  const {
    transactions,
    documents,
    equipment,
    properties,
    selectedPropertyId,
    markTransactionAsPaid,
    reopenTransaction,
    setViewingDocument,
    showToast,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    'summary' | 'payable' | 'receivable' | 'realized'
  >('payable');
  const [period, setPeriod] = useState<'all' | '30days' | '90days' | 'year'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<FinancialTransaction | null>(null);

  // Modal para confirmar quitação de conta
  const [payingTx, setPayingTx] = useState<FinancialTransaction | null>(null);
  const [payDate, setPayDate] = useState(getTodayIso());
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Pix');

  const metrics = useMemo(() => {
    return calculateDashboardMetrics(
      documents,
      transactions,
      equipment,
      selectedPropertyId,
      period
    );
  }, [documents, transactions, equipment, selectedPropertyId, period]);

  // Filtragem
  const filteredTxs = useMemo(() => {
    let list = filterByProperty(transactions, selectedPropertyId);
    list = filterTransactionsByPeriod(list, period);

    if (categoryFilter !== 'all') {
      list = list.filter((t) => t.category === categoryFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [transactions, selectedPropertyId, period, categoryFilter, searchTerm]);

  // Sublistas
  const payableList = useMemo(
    () => filteredTxs.filter((t) => t.status === 'open' && t.type === 'expense'),
    [filteredTxs]
  );

  const receivableList = useMemo(
    () => filteredTxs.filter((t) => t.status === 'open' && t.type === 'income'),
    [filteredTxs]
  );

  const realizedList = useMemo(
    () => filteredTxs.filter((t) => t.status === 'paid'),
    [filteredTxs]
  );

  const handleOpenPayModal = (tx: FinancialTransaction) => {
    setPayingTx(tx);
    setPayDate(getTodayIso());
    setPayMethod(tx.paymentMethod || 'Pix');
  };

  const handleConfirmPayment = () => {
    if (payingTx) {
      markTransactionAsPaid(payingTx.id, payDate, payMethod);
      setPayingTx(null);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Descrição',
      'Tipo',
      'Valor (R$)',
      'Categoria',
      'Propriedade',
      'Vencimento',
      'Data Efetiva',
      'Situação',
      'Forma Pagamento',
      'Máquina',
    ];

    const currentList =
      activeSubTab === 'payable'
        ? payableList
        : activeSubTab === 'receivable'
        ? receivableList
        : activeSubTab === 'realized'
        ? realizedList
        : filteredTxs;

    const rows = currentList.map((t) => {
      const prop = properties.find((p) => p.id === t.propertyId)?.name || '';
      const eq = equipment.find((e) => e.id === t.equipmentId)?.name || '';
      const val = (t.amountCents / 100).toFixed(2).replace('.', ',');
      return [
        t.id,
        t.description,
        t.type === 'income' ? 'Receita' : 'Despesa',
        val,
        t.category,
        prop,
        formatDate(t.dueDate),
        t.paymentDate ? formatDate(t.paymentDate) : '',
        t.status === 'paid' ? 'Realizado' : 'Em Aberto',
        t.paymentMethod || '',
        eq,
      ];
    });

    exportToCsv(`AgroArquivo_Financeiro_${activeSubTab}`, headers, rows);
    showToast('Relatório financeiro exportado com sucesso!');
  };

  const today = getTodayIso();

  return (
    <div className="content-container">
      {/* Cabeçalho */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Controle Financeiro Rural</h1>
          <p className="page-description">
            Gerencie o fluxo de caixa, contas a pagar, a receber e previsões integradas às suas notas e maquinário.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCsv} className="btn btn-secondary btn-sm">
            <Download size={15} /> Exportar CSV
          </button>
          <button
            onClick={() => {
              setEditingTx(null);
              setIsModalOpen(true);
            }}
            className="btn btn-primary"
            id="btn-new-transaction"
          >
            <Plus size={18} /> Novo lançamento
          </button>
        </div>
      </div>

      {/* KPI Cards Financeiros */}
      <div className="kpi-grid">
        <div className="kpi-card highlight">
          <div className="kpi-header">
            <span className="kpi-label">Saldo Disponível</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--primary)' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="kpi-value">{formatCurrency(metrics.availableBalanceCents)}</div>
          <div className="kpi-footer">Saldo inicial + entradas e saídas realizadas</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Resultado de Caixa</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: '#DCFCE7', color: '#166534' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: metrics.cashResultCents >= 0 ? '#16A34A' : '#DC2626' }}>
            {formatCurrency(metrics.cashResultCents)}
          </div>
          <div className="kpi-footer">Receitas recebidas menos despesas pagas</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Contas a Pagar (Abertas)</span>
            <div className="kpi-icon-wrap" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#D97706' }}>
            {formatCurrency(metrics.totalPayableOpenCents)}
          </div>
          <div className="kpi-footer">Previsão total de saídas pendentes</div>
        </div>

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
      </div>

      {/* Navegação entre Abas do Financeiro */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '20px',
        }}
      >
        <button
          onClick={() => setActiveSubTab('payable')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'none',
            fontSize: '14.5px',
            fontWeight: activeSubTab === 'payable' ? 700 : 500,
            color: activeSubTab === 'payable' ? 'var(--primary-dark)' : 'var(--text-muted)',
            borderBottom: activeSubTab === 'payable' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Contas a Pagar</span>
          <span
            style={{
              fontSize: '11px',
              backgroundColor: payableList.length > 0 ? '#FEF3C7' : '#E5E7EB',
              color: payableList.length > 0 ? '#92400E' : '#374151',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
            }}
          >
            {payableList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('receivable')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'none',
            fontSize: '14.5px',
            fontWeight: activeSubTab === 'receivable' ? 700 : 500,
            color: activeSubTab === 'receivable' ? 'var(--primary-dark)' : 'var(--text-muted)',
            borderBottom: activeSubTab === 'receivable' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Contas a Receber</span>
          <span
            style={{
              fontSize: '11px',
              backgroundColor: '#EFF6FF',
              color: '#1E40AF',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
            }}
          >
            {receivableList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('realized')}
          style={{
            padding: '12px 18px',
            border: 'none',
            background: 'none',
            fontSize: '14.5px',
            fontWeight: activeSubTab === 'realized' ? 700 : 500,
            color: activeSubTab === 'realized' ? 'var(--primary-dark)' : 'var(--text-muted)',
            borderBottom: activeSubTab === 'realized' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Movimentações Realizadas</span>
          <span
            style={{
              fontSize: '11px',
              backgroundColor: '#DCFCE7',
              color: '#166534',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
            }}
          >
            {realizedList.length}
          </span>
        </button>
      </div>

      {/* Filtros da Tabela */}
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
            placeholder="Buscar por descrição ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ minWidth: '180px' }}>
          <select
            className="form-select"
            style={{ height: '38px', padding: '0 12px' }}
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
          >
            <option value="all">Todo o Período</option>
            <option value="30days">Últimos 30 dias</option>
            <option value="90days">Últimos 90 dias</option>
            <option value="year">Último ano</option>
          </select>
        </div>
      </div>

      {/* TABELAS ESPECÍFICAS DE CADA ABA */}
      {activeSubTab === 'payable' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Propriedade</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Forma Prevista</th>
                <th>Doc. / Máquina</th>
                <th style={{ textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {payableList.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Nenhuma conta a pagar em aberto no momento.
                  </td>
                </tr>
              ) : (
                payableList.map((tx) => {
                  const prop = properties.find((p) => p.id === tx.propertyId);
                  const eq = equipment.find((e) => e.id === tx.equipmentId);
                  const doc = documents.find((d) => d.id === tx.documentId);
                  const daysDiff = getDaysDiff(tx.dueDate, today);
                  const isOverdue = daysDiff < 0;

                  return (
                    <tr
                      key={tx.id}
                      style={{
                        backgroundColor: isOverdue ? '#FEF2F2' : undefined,
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '13.5px' }}>
                          {tx.description}
                        </div>
                        {isOverdue && (
                          <div style={{ color: '#DC2626', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={12} /> Vencida há {Math.abs(daysDiff)} dia(s)
                          </div>
                        )}
                        {!isOverdue && daysDiff <= 7 && (
                          <div style={{ color: '#D97706', fontSize: '11px', fontWeight: 600 }}>
                            Vence em {daysDiff === 0 ? 'hoje' : daysDiff + ' dia(s)'}
                          </div>
                        )}
                      </td>
                      <td>{tx.category}</td>
                      <td>{prop?.name || '—'}</td>
                      <td>{formatDate(tx.dueDate)}</td>
                      <td style={{ fontWeight: 700, color: '#DC2626' }}>
                        {formatCurrency(tx.amountCents)}
                      </td>
                      <td>{tx.paymentMethod || 'Boleto'}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {doc && (
                            <button
                              onClick={() => setViewingDocument(doc)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary)',
                                fontSize: '12px',
                                textAlign: 'left',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                textDecoration: 'underline',
                              }}
                            >
                              <FileText size={12} /> Ver NF
                            </button>
                          )}
                          {eq && (
                            <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                              🚜 {eq.name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenPayModal(tx)}
                          className="btn btn-primary btn-sm"
                          id={`btn-pay-${tx.id}`}
                        >
                          <Check size={14} /> Marcar como Pago
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === 'receivable' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Propriedade</th>
                <th>Previsão de Recebimento</th>
                <th>Valor Previsto</th>
                <th>Forma</th>
                <th>Doc. Vinculado</th>
                <th style={{ textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {receivableList.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Nenhuma conta a receber pendente.
                  </td>
                </tr>
              ) : (
                receivableList.map((tx) => {
                  const prop = properties.find((p) => p.id === tx.propertyId);
                  const doc = documents.find((d) => d.id === tx.documentId);

                  return (
                    <tr key={tx.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '13.5px' }}>
                          {tx.description}
                        </div>
                      </td>
                      <td>{tx.category}</td>
                      <td>{prop?.name || '—'}</td>
                      <td>{formatDate(tx.dueDate)}</td>
                      <td style={{ fontWeight: 700, color: '#16A34A' }}>
                        {formatCurrency(tx.amountCents)}
                      </td>
                      <td>{tx.paymentMethod || 'Transferência'}</td>
                      <td>
                        {doc && (
                          <button
                            onClick={() => setViewingDocument(doc)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--primary)',
                              fontSize: '12px',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                            }}
                          >
                            Ver NF
                          </button>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenPayModal(tx)}
                          className="btn btn-outline-green btn-sm"
                        >
                          <Check size={14} /> Confirmar Recebimento
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeSubTab === 'realized' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Categoria</th>
                <th>Propriedade</th>
                <th>Data Efetiva</th>
                <th>Valor</th>
                <th>Forma de Pagamento</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {realizedList.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Nenhuma movimentação realizada no período.
                  </td>
                </tr>
              ) : (
                realizedList.map((tx) => {
                  const prop = properties.find((p) => p.id === tx.propertyId);

                  return (
                    <tr key={tx.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '13.5px' }}>
                          {tx.description}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: tx.type === 'income' ? '#166534' : '#991B1B',
                            backgroundColor: tx.type === 'income' ? '#DCFCE7' : '#FEE2E2',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                          }}
                        >
                          {tx.type === 'income' ? 'Entrada / Receita' : 'Saída / Despesa'}
                        </span>
                      </td>
                      <td>{tx.category}</td>
                      <td>{prop?.name || '—'}</td>
                      <td>{formatDate(tx.paymentDate || tx.dueDate)}</td>
                      <td
                        style={{
                          fontWeight: 700,
                          color: tx.type === 'income' ? '#16A34A' : '#DC2626',
                        }}
                      >
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amountCents)}
                      </td>
                      <td>{tx.paymentMethod || 'Pix'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => reopenTransaction(tx.id)}
                          className="btn btn-secondary btn-sm"
                          title="Reabrir como lançamento em aberto"
                        >
                          <RotateCcw size={13} /> Reabrir
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para Cadastro/Edição de Lançamento */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transactionToEdit={editingTx}
      />

      {/* Modal de Confirmação de Quitação / Pagamento */}
      {payingTx && (
        <div className="modal-overlay" onClick={() => setPayingTx(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div className="modal-title">
                {payingTx.type === 'income' ? 'Confirmar Recebimento' : 'Confirmar Pagamento'}
              </div>
              <button onClick={() => setPayingTx(null)} className="btn-icon-round">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '13.5px', marginBottom: '14px' }}>
                Você está registrando a quitação de: <br />
                <strong>{payingTx.description}</strong> no valor de{' '}
                <strong style={{ color: 'var(--primary)' }}>
                  {formatCurrency(payingTx.amountCents)}
                </strong>
                .
              </p>

              <div className="form-group">
                <label className="form-label">Data Efetiva da Liquidação *</label>
                <input
                  type="date"
                  className="form-input"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Forma de Pagamento Utilizada</label>
                <select
                  className="form-select"
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                >
                  <option value="Pix">Pix</option>
                  <option value="Boleto Bancário">Boleto Bancário</option>
                  <option value="Transferência Bancária">Transferência Bancária</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setPayingTx(null)} className="btn btn-secondary">
                Cancelar
              </button>
              <button onClick={handleConfirmPayment} className="btn btn-primary" id="btn-confirm-payment">
                <Check size={16} /> Confirmar Quitação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
