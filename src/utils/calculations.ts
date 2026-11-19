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


// =========================================================================
// LSA ERP RURAL V1.0 — ARQUITETURA DE INDICADORES E CONFIABILIDADE (PORTA DE QUALIDADE)
// =========================================================================
import {
  BaseReliabilityMetrics,
  ContractRecord,
  InsuranceRecord,
} from '../types';

export function calculateBaseReliabilityMetrics(
  documents: DocumentRecord[],
  transactions: FinancialTransaction[]
): BaseReliabilityMetrics {
  const totalDocs = documents.length || 1;
  const totalTx = transactions.length || 1;

  // Documentos com status validado ou publicado
  const validatedDocsCount = documents.filter(
    (d) => d.validationStatus === 'validated' || d.validationStatus === 'published' || d.status === 'organized'
  ).length;

  // Documentos sem classificação
  const unclassifiedCount = documents.filter(
    (d) => d.status === 'pending' || d.category === 'Outros' || d.validationStatus === 'draft'
  ).length;

  // Documentos sem vínculo com propriedade, máquina ou parte
  const unlinkedCount = documents.filter(
    (d) => !d.propertyId && !d.primaryContext?.id && (!d.links || d.links.length === 0)
  ).length;

  // Suspeitas de duplicidade
  const duplicateCount = documents.filter((d) => d.isDuplicateSuspect).length;

  // Rateios completos (100% das dimensões atribuídas)
  const incompleteAllocations = transactions.filter(
    (tx) => tx.isAllocationComplete === false
  );
  const incompleteAllocationsCount = incompleteAllocations.length;

  // Reconciliação bancária
  const reconciledTxCount = transactions.filter(
    (tx) => tx.status === 'paid' && tx.isReconciled !== false
  ).length;
  const paidTxCount = transactions.filter((tx) => tx.status === 'paid').length || 1;

  const validatedPercentage = Math.round((validatedDocsCount / totalDocs) * 100);
  const allocatedPercentage = Math.max(
    0,
    Math.round(((totalTx - incompleteAllocationsCount) / totalTx) * 100)
  );
  const reconciledPercentage = Math.round((reconciledTxCount / paidTxCount) * 100);
  const linkedPercentage = Math.max(0, Math.round(((totalDocs - unlinkedCount) / totalDocs) * 100));

  const overallScore = Math.round(
    validatedPercentage * 0.3 +
      allocatedPercentage * 0.3 +
      reconciledPercentage * 0.2 +
      linkedPercentage * 0.2
  );

  const criticalIssuesCount = unclassifiedCount + unlinkedCount + duplicateCount + incompleteAllocationsCount;

  return {
    validatedPercentage,
    allocatedPercentage,
    reconciledPercentage,
    linkedPercentage,
    overallScore,
    criticalIssuesCount,
    unclassifiedCount,
    unlinkedCount,
    duplicateCount,
    incompleteAllocationsCount,
  };
}

export interface DeadlineItem {
  id: string;
  title: string;
  type: 'contract' | 'insurance' | 'document' | 'payable' | 'receivable';
  categoryLabel: string;
  dueDate: string;
  daysRemaining: number;
  amountCents?: number;
  entityName?: string;
  status: 'critical' | 'warning' | 'normal';
}

export function calculateDeadlinesBreakdown(
  documents: DocumentRecord[],
  contracts: ContractRecord[],
  insurance: InsuranceRecord[],
  transactions: FinancialTransaction[]
): {
  items7Days: DeadlineItem[];
  items30Days: DeadlineItem[];
  items60Days: DeadlineItem[];
  items90Days: DeadlineItem[];
  allUpcoming: DeadlineItem[];
} {
  const today = getTodayIso();
  const items: DeadlineItem[] = [];

  // 1. Contratos próximos do vencimento
  contracts.forEach((ctr) => {
    if (ctr.status !== 'cancelled' && ctr.status !== 'expired' && ctr.endDate) {
      const days = getDaysDiff(today, ctr.endDate);
      if (days >= -10 && days <= 90) {
        items.push({
          id: `ctr-${ctr.id}`,
          title: ctr.title,
          type: 'contract',
          categoryLabel: `Contrato de ${ctr.contractType.toUpperCase()}`,
          dueDate: ctr.endDate,
          daysRemaining: days,
          amountCents: ctr.amountCents,
          entityName: ctr.primaryContext?.name,
          status: days <= 7 ? 'critical' : days <= 30 ? 'warning' : 'normal',
        });
      }
    }
  });

  // 2. Apólices de seguro
  insurance.forEach((ins) => {
    if (ins.endDate) {
      const days = getDaysDiff(today, ins.endDate);
      if (days >= -10 && days <= 90) {
        items.push({
          id: `ins-${ins.id}`,
          title: `Apólice ${ins.policyNumber} — ${ins.insurerName}`,
          type: 'insurance',
          categoryLabel: 'Seguro Rural / Patrimonial',
          dueDate: ins.endDate,
          daysRemaining: days,
          amountCents: ins.premiumCents,
          entityName: ins.linkedPropertyName || ins.linkedAssetName,
          status: days <= 7 ? 'critical' : days <= 30 ? 'warning' : 'normal',
        });
      }
    }
  });

  // 3. Documentos com validade (CAR, Alvarás, Matrículas, etc.)
  documents.forEach((doc) => {
    if (doc.expirationDate && doc.status !== 'archived') {
      const days = getDaysDiff(today, doc.expirationDate);
      if (days >= -10 && days <= 90) {
        items.push({
          id: `doc-${doc.id}`,
          title: doc.title,
          type: 'document',
          categoryLabel: doc.category,
          dueDate: doc.expirationDate,
          daysRemaining: days,
          amountCents: doc.valueCents,
          entityName: doc.primaryContext?.name,
          status: days <= 7 ? 'critical' : days <= 30 ? 'warning' : 'normal',
        });
      }
    }
  });

  // 4. Obrigações financeiras em aberto
  transactions.forEach((tx) => {
    if (tx.status === 'open' && tx.dueDate) {
      const days = getDaysDiff(today, tx.dueDate);
      if (days >= -10 && days <= 90) {
        items.push({
          id: `tx-${tx.id}`,
          title: tx.description,
          type: tx.type === 'expense' ? 'payable' : 'receivable',
          categoryLabel: tx.type === 'expense' ? 'Conta a Pagar' : 'Conta a Receber',
          dueDate: tx.dueDate,
          daysRemaining: days,
          amountCents: tx.amountCents,
          status: days <= 7 ? 'critical' : days <= 30 ? 'warning' : 'normal',
        });
      }
    }
  });

  // Ordena por dias restantes (mais urgentes primeiro)
  items.sort((a, b) => a.daysRemaining - b.daysRemaining);

  return {
    items7Days: items.filter((i) => i.daysRemaining <= 7),
    items30Days: items.filter((i) => i.daysRemaining > 7 && i.daysRemaining <= 30),
    items60Days: items.filter((i) => i.daysRemaining > 30 && i.daysRemaining <= 60),
    items90Days: items.filter((i) => i.daysRemaining > 60 && i.daysRemaining <= 90),
    allUpcoming: items,
  };
}
