import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Building2,
  Tractor,
  DollarSign,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  calculateDashboardMetrics,
  calculateEquipmentSpending,
  filterByProperty,
  filterTransactionsByPeriod,
  filterDocumentsByPeriod,
} from '../../utils/calculations';
import { exportToCsv } from '../../utils/csvExport';

export const ReportsView: React.FC = () => {
  const {
    documents,
    transactions,
    equipment,
    properties,
    selectedPropertyId,
    setSelectedPropertyId,
    showToast,
  } = useApp();

  const [period, setPeriod] = useState<'all' | '30days' | '90days' | 'year'>('year');
  const [reportType, setReportType] = useState<
    | 'cashflow'
    | 'byProperty'
    | 'byCategory'
    | 'byEquipment'
    | 'byDocCategory'
    | 'openAndOverdue'
  >('cashflow');

  // Filtragem
  const filteredTxs = useMemo(() => {
    let list = filterByProperty(transactions, selectedPropertyId);
    return filterTransactionsByPeriod(list, period);
  }, [transactions, selectedPropertyId, period]);

  const filteredDocs = useMemo(() => {
    let list = filterByProperty(documents, selectedPropertyId);
    return filterDocumentsByPeriod(list, period);
  }, [documents, selectedPropertyId, period]);

  // Cálculos para cada relatório
  // 1. Despesas por Propriedade
  const propertyReport = useMemo(() => {
    return properties.map((prop) => {
      const pTxs = filteredTxs.filter((t) => t.propertyId === prop.id && t.status === 'paid');
      let income = 0;
      let expense = 0;
      pTxs.forEach((t) => {
        if (t.type === 'income') income += t.amountCents;
        if (t.type === 'expense') expense += t.amountCents;
      });
      return {
        property: prop,
        income,
        expense,
        net: income - expense,
      };
    });
  }, [properties, filteredTxs]);

  // 2. Despesas por Categoria
  const categoryReport = useMemo(() => {
    const totals: Record<string, number> = {};
    let totalExpense = 0;

    filteredTxs
      .filter((t) => t.type === 'expense' && t.status === 'paid')
      .forEach((t) => {
        totals[t.category] = (totals[t.category] || 0) + t.amountCents;
        totalExpense += t.amountCents;
      });

    return Object.entries(totals)
      .map(([cat, amount]) => ({
        category: cat,
        amount,
        percentage: totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTxs]);

  // 3. Gastos por Veículo ou Máquina
  const equipmentReport = useMemo(() => {
    const list = filterByProperty(equipment, selectedPropertyId);
    return list.map((eq) => {
      const spending = calculateEquipmentSpending(eq.id, transactions, equipment);
      return {
        equipment: eq,
        acquisition: spending.acquisitionCents,
        maintenance: spending.maintenanceCents,
        fuel: spending.fuelCents,
        total: spending.totalCents,
      };
    }).sort((a, b) => b.total - a.total);
  }, [equipment, selectedPropertyId, transactions]);

  // 4. Documentos por Categoria
  const docCategoryReport = useMemo(() => {
    const counts: Record<string, { count: number; totalValue: number }> = {};
    filteredDocs
      .filter((d) => d.status !== 'archived')
      .forEach((d) => {
        if (!counts[d.category]) {
          counts[d.category] = { count: 0, totalValue: 0 };
        }
        counts[d.category].count++;
        counts[d.category].totalValue += d.valueCents || 0;
      });

    return Object.entries(counts)
      .map(([cat, data]) => ({
        category: cat,
        count: data.count,
        totalValue: data.totalValue,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredDocs]);

  // 5. Contas em Aberto e Atrasadas
  const openAndOverdueReport = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return filteredTxs
      .filter((t) => t.status === 'open')
      .map((t) => ({
        ...t,
        isOverdue: t.dueDate < today,
      }))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [filteredTxs]);

  // Função de Impressão
  const handlePrint = () => {
    window.print();
  };

  // Exportação CSV do relatório ativo
  const handleExportCsv = () => {
    if (reportType === 'byProperty') {
      const headers = ['Propriedade', 'Município-UF', 'Área (ha)', 'Receitas (R$)', 'Despesas (R$)', 'Resultado (R$)'];
      const rows = propertyReport.map((p) => [
        p.property.name,
        `${p.property.city}-${p.property.state}`,
        p.property.areaHectares,
        (p.income / 100).toFixed(2).replace('.', ','),
        (p.expense / 100).toFixed(2).replace('.', ','),
        (p.net / 100).toFixed(2).replace('.', ','),
      ]);
      exportToCsv('Relatorio_Despesas_Por_Propriedade', headers, rows);
    } else if (reportType === 'byCategory') {
      const headers = ['Categoria Financeira', 'Total Despesas (R$)', 'Participação (%)'];
      const rows = categoryReport.map((c) => [
        c.category,
        (c.amount / 100).toFixed(2).replace('.', ','),
        `${c.percentage}%`,
      ]);
      exportToCsv('Relatorio_Despesas_Por_Categoria', headers, rows);
    } else if (reportType === 'byEquipment') {
      const headers = ['Máquina/Veículo', 'Tipo', 'Placa/Série', 'Aquisição (R$)', 'Manutenção (R$)', 'Combustível (R$)', 'Gasto Total (R$)'];
      const rows = equipmentReport.map((e) => [
        e.equipment.name,
        e.equipment.type,
        e.equipment.plateOrSerial,
        (e.acquisition / 100).toFixed(2).replace('.', ','),
        (e.maintenance / 100).toFixed(2).replace('.', ','),
        (e.fuel / 100).toFixed(2).replace('.', ','),
        (e.total / 100).toFixed(2).replace('.', ','),
      ]);
      exportToCsv('Relatorio_Gastos_Por_Equipamento', headers, rows);
    } else if (reportType === 'byDocCategory') {
      const headers = ['Categoria Documental', 'Quantidade de Documentos', 'Valor Total Registrado (R$)'];
      const rows = docCategoryReport.map((d) => [
        d.category,
        d.count,
        (d.totalValue / 100).toFixed(2).replace('.', ','),
      ]);
      exportToCsv('Relatorio_Documentos_Por_Categoria', headers, rows);
    } else if (reportType === 'openAndOverdue') {
      const headers = ['Descrição', 'Tipo', 'Vencimento', 'Situação', 'Valor (R$)', 'Forma Pagamento'];
      const rows = openAndOverdueReport.map((t) => [
        t.description,
        t.type === 'income' ? 'A Receber' : 'A Pagar',
        formatDate(t.dueDate),
        t.isOverdue ? 'ATRASADA' : 'No Prazo',
        (t.amountCents / 100).toFixed(2).replace('.', ','),
        t.paymentMethod || '',
      ]);
      exportToCsv('Relatorio_Contas_Abertas_e_Atrasadas', headers, rows);
    } else {
      // cashflow
      const headers = ['Descrição', 'Tipo', 'Categoria', 'Data Efetiva', 'Valor (R$)', 'Forma de Pagamento'];
      const rows = filteredTxs.filter((t) => t.status === 'paid').map((t) => [
        t.description,
        t.type === 'income' ? 'Receita' : 'Despesa',
        t.category,
        formatDate(t.paymentDate || t.dueDate),
        (t.amountCents / 100).toFixed(2).replace('.', ','),
        t.paymentMethod || '',
      ]);
      exportToCsv('Relatorio_Fluxo_de_Caixa_Realizado', headers, rows);
    }

    showToast('Relatório exportado para CSV com sucesso!');
  };

  return (
    <div className="content-container">
      {/* Cabeçalho */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Relatórios Gerenciais</h1>
          <p className="page-description">
            Demonstrativos analíticos de fluxo de caixa, despesas por categoria, custos de manutenção por trator e documentos.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }} className="no-print">
          <button onClick={handlePrint} className="btn btn-secondary btn-sm" id="btn-print-report">
            <Printer size={15} /> Imprimir Relatório
          </button>
          <button onClick={handleExportCsv} className="btn btn-primary btn-sm" id="btn-export-report-csv">
            <Download size={15} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Controles de Relatório e Filtros */}
      <div
        className="card no-print"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          gap: '14px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ minWidth: '220px', flex: 1 }}>
          <label className="form-label" style={{ marginBottom: '4px' }}>Tipo de Relatório</label>
          <select
            className="form-select"
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
          >
            <option value="cashflow">Fluxo de Caixa Realizado (Entradas e Saídas)</option>
            <option value="byProperty">Despesas e Resultados por Propriedade</option>
            <option value="byCategory">Despesas por Categoria</option>
            <option value="byEquipment">Gastos por Máquina e Veículo</option>
            <option value="byDocCategory">Documentos por Categoria</option>
            <option value="openAndOverdue">Contas em Aberto e Atrasadas</option>
          </select>
        </div>

        <div style={{ minWidth: '180px' }}>
          <label className="form-label" style={{ marginBottom: '4px' }}>Janela Temporal</label>
          <select
            className="form-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
          >
            <option value="all">Todo o Histórico</option>
            <option value="30days">Últimos 30 dias</option>
            <option value="90days">Últimos 90 dias</option>
            <option value="year">Ano Atual</option>
          </select>
        </div>
      </div>

      {/* Título do Relatório Impresso */}
      <div
        style={{
          borderBottom: '2px solid var(--primary)',
          paddingBottom: '12px',
          marginBottom: '20px',
        }}
      >
        <div style={{ fontSize: '12px', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>
          AgroArquivo • Relatório Oficial
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary-dark)' }}>
          {reportType === 'cashflow' && 'Demonstrativo de Fluxo de Caixa Realizado'}
          {reportType === 'byProperty' && 'Demonstrativo Financeiro por Propriedade Rural'}
          {reportType === 'byCategory' && 'Detalhamento de Despesas por Categoria'}
          {reportType === 'byEquipment' && 'Demonstrativo de Custos por Veículo e Máquina'}
          {reportType === 'byDocCategory' && 'Censo de Documentos por Categoria'}
          {reportType === 'openAndOverdue' && 'Relatório de Contas em Aberto e Atrasadas'}
        </h2>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Propriedade:{' '}
          <strong>
            {selectedPropertyId === 'all'
              ? 'Todas as Propriedades'
              : properties.find((p) => p.id === selectedPropertyId)?.name}
          </strong>{' '}
          • Período: <strong>{period === 'all' ? 'Completo' : period}</strong> • Emitido em:{' '}
          {formatDate(new Date().toISOString().split('T')[0])}
        </div>
      </div>

      {/* TABELAS DO RELATÓRIO SELECIONADO */}

      {/* 1. FLUXO DE CAIXA REALIZADO */}
      {reportType === 'cashflow' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Categoria</th>
                <th>Propriedade</th>
                <th>Forma de Pagamento</th>
                <th style={{ textAlign: 'right' }}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxs
                .filter((t) => t.status === 'paid')
                .map((t) => {
                  const prop = properties.find((p) => p.id === t.propertyId);
                  return (
                    <tr key={t.id}>
                      <td>{formatDate(t.paymentDate || t.dueDate)}</td>
                      <td style={{ fontWeight: 600 }}>{t.description}</td>
                      <td>
                        <span
                          style={{
                            fontSize: '11.5px',
                            fontWeight: 600,
                            color: t.type === 'income' ? '#166534' : '#991B1B',
                          }}
                        >
                          {t.type === 'income' ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td>{t.category}</td>
                      <td>{prop?.name}</td>
                      <td>{t.paymentMethod || 'Pix'}</td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontWeight: 700,
                          color: t.type === 'income' ? '#16A34A' : '#DC2626',
                        }}
                      >
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amountCents)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. POR PROPRIEDADE */}
      {reportType === 'byProperty' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Propriedade</th>
                <th>Município - UF</th>
                <th>Área (Hectares)</th>
                <th>Receitas Realizadas</th>
                <th>Despesas Pagas</th>
                <th style={{ textAlign: 'right' }}>Resultado de Caixa</th>
              </tr>
            </thead>
            <tbody>
              {propertyReport.map((item) => (
                <tr key={item.property.id}>
                  <td style={{ fontWeight: 600 }}>{item.property.name}</td>
                  <td>{item.property.city} - {item.property.state}</td>
                  <td>{item.property.areaHectares.toLocaleString('pt-BR')} ha</td>
                  <td style={{ color: '#16A34A', fontWeight: 600 }}>{formatCurrency(item.income)}</td>
                  <td style={{ color: '#DC2626', fontWeight: 600 }}>{formatCurrency(item.expense)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: item.net >= 0 ? '#16A34A' : '#DC2626' }}>
                    {formatCurrency(item.net)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. POR CATEGORIA */}
      {reportType === 'byCategory' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Categoria de Despesa</th>
                <th>Participação Relativa</th>
                <th style={{ textAlign: 'right' }}>Total Pago</th>
              </tr>
            </thead>
            <tbody>
              {categoryReport.map((c) => (
                <tr key={c.category}>
                  <td style={{ fontWeight: 600 }}>{c.category}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '100px', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px' }}>
                        <div style={{ width: `${c.percentage}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>{c.percentage}%</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary-dark)' }}>
                    {formatCurrency(c.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. POR MÁQUINA / VEÍCULO */}
      {reportType === 'byEquipment' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Máquina / Equipamento</th>
                <th>Tipo</th>
                <th>Placa / Série</th>
                <th>Valor Aquisição</th>
                <th>Peças & Manutenção</th>
                <th>Combustível / Óleo</th>
                <th style={{ textAlign: 'right' }}>Custo Total Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {equipmentReport.map((item) => (
                <tr key={item.equipment.id}>
                  <td style={{ fontWeight: 600 }}>{item.equipment.name}</td>
                  <td>{item.equipment.type}</td>
                  <td>{item.equipment.plateOrSerial}</td>
                  <td>{formatCurrency(item.acquisition)}</td>
                  <td style={{ color: '#DC2626', fontWeight: 600 }}>{formatCurrency(item.maintenance)}</td>
                  <td style={{ color: '#D97706', fontWeight: 600 }}>{formatCurrency(item.fuel)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary-dark)' }}>
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. DOCUMENTOS POR CATEGORIA */}
      {reportType === 'byDocCategory' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Categoria Documental</th>
                <th>Total de Documentos</th>
                <th style={{ textAlign: 'right' }}>Valor Total Registrado</th>
              </tr>
            </thead>
            <tbody>
              {docCategoryReport.map((item) => (
                <tr key={item.category}>
                  <td style={{ fontWeight: 600 }}>{item.category}</td>
                  <td>{item.count} documento(s)</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary-dark)' }}>
                    {item.totalValue > 0 ? formatCurrency(item.totalValue) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 6. CONTAS EM ABERTO E ATRASADAS */}
      {reportType === 'openAndOverdue' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Vencimento</th>
                <th>Situação</th>
                <th>Forma de Pagamento</th>
                <th style={{ textAlign: 'right' }}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {openAndOverdueReport.map((t) => (
                <tr key={t.id} style={{ backgroundColor: t.isOverdue ? '#FEF2F2' : undefined }}>
                  <td style={{ fontWeight: 600 }}>{t.description}</td>
                  <td>{t.type === 'income' ? 'A Receber' : 'A Pagar'}</td>
                  <td>{formatDate(t.dueDate)}</td>
                  <td>
                    {t.isOverdue ? (
                      <span style={{ color: '#DC2626', fontWeight: 700, fontSize: '11px', backgroundColor: '#FEE2E2', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                        ATRASADA
                      </span>
                    ) : (
                      <span style={{ color: '#1E40AF', fontWeight: 600, fontSize: '11px', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                        No Prazo
                      </span>
                    )}
                  </td>
                  <td>{t.paymentMethod || 'Boleto'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: t.type === 'income' ? '#16A34A' : '#DC2626' }}>
                    {formatCurrency(t.amountCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
