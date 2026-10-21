// Motor de cálculos financeiros e indicadores do AgroArquivo
import {
  DocumentRecord,
  FinancialTransaction,
  Equipment,
  Property,
} from '../types';
import { getTodayIso, getDaysDiff } from './formatters';

export interface DashboardMetrics {
  totalActiveDocs: number;
  docsAddedInPeriod: number;
  receivedIncomeCents: number;
  paidExpenseCents: number;
  cashResultCents: number; // receitas recebidas - despesas pagas
  availableBalanceCents: number; // Saldo inicial + total entradas realizadas - total saídas realizadas
  totalPayableOpenCents: number; // total previsto a pagar
  totalReceivableOpenCents: number; // total previsto a receber
  overduePayableCents: number; // contas atrasadas
  overduePayableCount: number;
  dueIn7DaysCents: number;
  dueIn7DaysCount: number;
  unclassifiedDocsCount: number;
  topExpenseCategory: {
    category: string;
    amountCents: number;
  } | null;
  topMaintenanceEquipment: {
    equipment: Equipment;
    maintenanceExpenseCents: number;
  } | null;
}

// Saldo base inicial da operação agrícola (em centavos): R$ 120.000,00
export const INITIAL_BASE_BALANCE_CENTS = 12000000;

export function filterByProperty<T extends { propertyId: string }>(
  items: T[],
  selectedPropertyId: string
): T[] {
  if (!selectedPropertyId || selectedPropertyId === 'all') {
    return items;
  }
  return items.filter((item) => item.propertyId === selectedPropertyId);
}

export function filterByCropSeason<T extends { cropSeason?: string }>(
  items: T[],
  cropSeason: string
): T[] {
  if (!cropSeason || cropSeason === 'all') {
    return items;
  }
  return items.filter((item) => item.cropSeason === cropSeason);
}

export function filterTransactionsByPeriod(
  transactions: FinancialTransaction[],
  period: 'all' | '30days' | '90days' | 'year' | 'lastYear'
): FinancialTransaction[] {
  if (period === 'all') return transactions;
  const today = getTodayIso();

  return transactions.filter((tx) => {
    // Para realizadas, usa a data efetiva de pagamento; para abertas, usa a data de emissão ou vencimento
    const targetDate = tx.paymentDate || tx.dueDate || tx.issueDate;
    const diff = getDaysDiff(today, targetDate); // quantos dias se passaram

    if (period === '30days') {
      return diff >= 0 && diff <= 30;
    }
    if (period === '90days') {
      return diff >= 0 && diff <= 90;
    }
    if (period === 'year') {
      return diff >= 0 && diff <= 365;
    }
    return true;
  });
}

export function filterDocumentsByPeriod(
  documents: DocumentRecord[],
  period: 'all' | '30days' | '90days' | 'year' | 'lastYear'
): DocumentRecord[] {
  if (period === 'all') return documents;
  const today = getTodayIso();

  return documents.filter((doc) => {
    const diff = getDaysDiff(today, doc.createdAt || doc.issueDate);
    if (period === '30days') return diff >= 0 && diff <= 30;
    if (period === '90days') return diff >= 0 && diff <= 90;
    if (period === 'year') return diff >= 0 && diff <= 365;
    return true;
  });
}

export function calculateDashboardMetrics(
  allDocuments: DocumentRecord[],
  allTransactions: FinancialTransaction[],
  allEquipment: Equipment[],
  selectedPropertyId: string,
  period: 'all' | '30days' | '90days' | 'year' = 'all',
  cropSeason: string = 'all'
): DashboardMetrics {
  const today = getTodayIso();

  // Filtragem básica por propriedade e safra
  let filteredDocs = filterByProperty(allDocuments, selectedPropertyId);
  filteredDocs = filterByCropSeason(filteredDocs, cropSeason);

  let filteredTxs = filterByProperty(allTransactions, selectedPropertyId);
  filteredTxs = filterByCropSeason(filteredTxs, cropSeason);

  // Subconjunto com filtro de período
  const periodDocs = filterDocumentsByPeriod(filteredDocs, period);
  const periodTxs = filterTransactionsByPeriod(filteredTxs, period);

  // Documentos ativos (não arquivados)
  const activeDocs = filteredDocs.filter((d) => d.status !== 'archived');
  const docsAddedInPeriod = periodDocs.filter((d) => d.status !== 'archived').length;

  // Realizados no período (Fluxo de caixa do período)
  let receivedIncomeCents = 0;
  let paidExpenseCents = 0;

  periodTxs.forEach((tx) => {
    if (tx.status === 'paid') {
      if (tx.type === 'income') {
        receivedIncomeCents += tx.amountCents;
      } else if (tx.type === 'expense') {
        paidExpenseCents += tx.amountCents;
      }
    }
  });

  const cashResultCents = receivedIncomeCents - paidExpenseCents;

  // Saldo disponível histórico acumulado até hoje
  let totalHistoricInflows = 0;
  let totalHistoricOutflows = 0;

  filteredTxs.forEach((tx) => {
    if (tx.status === 'paid') {
      if (tx.type === 'income') {
        totalHistoricInflows += tx.amountCents;
      } else if (tx.type === 'expense') {
        totalHistoricOutflows += tx.amountCents;
      }
    }
  });

  const availableBalanceCents =
    INITIAL_BASE_BALANCE_CENTS + totalHistoricInflows - totalHistoricOutflows;

  // Contas previstas em aberto (Previsões)
  let totalPayableOpenCents = 0;
  let totalReceivableOpenCents = 0;
  let overduePayableCents = 0;
  let overduePayableCount = 0;
  let dueIn7DaysCents = 0;
  let dueIn7DaysCount = 0;

  filteredTxs.forEach((tx) => {
    if (tx.status === 'open') {
      if (tx.type === 'expense') {
        totalPayableOpenCents += tx.amountCents;
        // Verifica se está atrasada (vencimento < hoje)
        const daysToDue = getDaysDiff(tx.dueDate, today); // positivo = futuro, negativo = passado
        if (daysToDue < 0) {
          overduePayableCents += tx.amountCents;
          overduePayableCount++;
        } else if (daysToDue <= 7) {
          dueIn7DaysCents += tx.amountCents;
          dueIn7DaysCount++;
        }
      } else if (tx.type === 'income') {
        totalReceivableOpenCents += tx.amountCents;
      }
    }
  });

  // Documentos sem classificação
  const unclassifiedDocsCount = activeDocs.filter(
    (d) => d.status === 'pending'
  ).length;

  // Categoria com mais despesas no período
  const categoryTotals: Record<string, number> = {};
  periodTxs
    .filter((tx) => tx.type === 'expense')
    .forEach((tx) => {
      categoryTotals[tx.category] =
        (categoryTotals[tx.category] || 0) + tx.amountCents;
    });

  let topExpenseCategory: { category: string; amountCents: number } | null = null;
  for (const [category, amountCents] of Object.entries(categoryTotals)) {
    if (!topExpenseCategory || amountCents > topExpenseCategory.amountCents) {
      topExpenseCategory = { category, amountCents };
    }
  }

  // Máquina com maior gasto registrado em manutenção
  const propEquipment = filterByProperty(allEquipment, selectedPropertyId);
  const equipmentMaintenanceTotals: Record<string, number> = {};

  filteredTxs
    .filter(
      (tx) =>
        tx.type === 'expense' &&
        tx.equipmentId &&
        (tx.category === 'Peças e Manutenção' ||
          tx.category === 'Aquisição de Imobilizado')
    )
    .forEach((tx) => {
      if (tx.equipmentId) {
        equipmentMaintenanceTotals[tx.equipmentId] =
          (equipmentMaintenanceTotals[tx.equipmentId] || 0) + tx.amountCents;
      }
    });

  let topMaintenanceEquipment: {
    equipment: Equipment;
    maintenanceExpenseCents: number;
  } | null = null;

  for (const [eqId, totalCents] of Object.entries(equipmentMaintenanceTotals)) {
    const eq = propEquipment.find((e) => e.id === eqId);
    if (eq) {
      if (
        !topMaintenanceEquipment ||
        totalCents > topMaintenanceEquipment.maintenanceExpenseCents
      ) {
        topMaintenanceEquipment = {
          equipment: eq,
          maintenanceExpenseCents: totalCents,
        };
      }
    }
  }

  return {
    totalActiveDocs: activeDocs.length,
    docsAddedInPeriod,
    receivedIncomeCents,
    paidExpenseCents,
    cashResultCents,
    availableBalanceCents,
    totalPayableOpenCents,
    totalReceivableOpenCents,
    overduePayableCents,
    overduePayableCount,
    dueIn7DaysCents,
    dueIn7DaysCount,
    unclassifiedDocsCount,
    topExpenseCategory,
    topMaintenanceEquipment,
  };
}

// Gastos totais calculados para uma máquina específica
export interface EquipmentSpendingBreakdown {
  acquisitionCents: number;
  maintenanceCents: number;
  fuelCents: number;
  otherCents: number;
  totalCents: number;
}

export function calculateEquipmentSpending(
  equipmentId: string,
  transactions: FinancialTransaction[],
  equipmentList: Equipment[]
): EquipmentSpendingBreakdown {
  const eq = equipmentList.find((e) => e.id === equipmentId);
  const acquisitionCents = eq ? eq.acquisitionValueCents : 0;

  let maintenanceCents = 0;
  let fuelCents = 0;
  let otherCents = 0;

  transactions
    .filter((tx) => tx.equipmentId === equipmentId && tx.type === 'expense')
    .forEach((tx) => {
      if (tx.category === 'Peças e Manutenção') {
        maintenanceCents += tx.amountCents;
      } else if (tx.category === 'Combustível e Lubrificantes') {
        fuelCents += tx.amountCents;
      } else {
        otherCents += tx.amountCents;
      }
    });

  return {
    acquisitionCents,
    maintenanceCents,
    fuelCents,
    otherCents,
    totalCents: acquisitionCents + maintenanceCents + fuelCents + otherCents,
  };
}
