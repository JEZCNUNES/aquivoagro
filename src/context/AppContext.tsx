// Contexto principal de estado da aplicação AgroArquivo — LSA ERP Rural V1.0
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  Property,
  Equipment,
  EntityParty,
  DocumentRecord,
  FinancialTransaction,
  NotificationAlert,
  ViewTab,
  PaymentMethod,
  ContractRecord,
  PurchaseRecord,
  InventoryRecord,
  CommercialRecord,
  InsuranceRecord,
  TaskItem,
  AuditLogEntry,
  BaseReliabilityMetrics,
  DocumentLink,
} from '../types';
import { getInitialSeedData } from '../data/seedData';
import { getLsaDomainSeedData } from '../data/lsaData';
import { getTodayIso, getDaysDiff } from '../utils/formatters';
import { calculateBaseReliabilityMetrics } from '../utils/calculations';

interface AppContextType {
  // Dados principais em memória
  properties: Property[];
  equipment: Equipment[];
  parties: EntityParty[];
  documents: DocumentRecord[];
  transactions: FinancialTransaction[];
  contracts: ContractRecord[];
  purchases: PurchaseRecord[];
  inventory: InventoryRecord[];
  commercial: CommercialRecord[];
  insurance: InsuranceRecord[];
  tasks: TaskItem[];
  auditLogs: AuditLogEntry[];

  // Estados de navegação e filtros globais
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  selectedPropertyId: string;
  setSelectedPropertyId: (id: string) => void;
  periodFilter: 'all' | '30days' | '90days' | 'year';
  setPeriodFilter: (period: 'all' | '30days' | '90days' | 'year') => void;
  safraFilter: string;
  setSafraFilter: (safra: string) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;

  // Modais e painéis laterais de detalhes
  isAddDocModalOpen: boolean;
  setIsAddDocModalOpen: (open: boolean) => void;
  openAddDocModalWithDefaults: (equipmentId?: string, propertyId?: string) => void;
  isNotificationsDrawerOpen: boolean;
  setIsNotificationsDrawerOpen: (open: boolean) => void;
  viewingDocument: DocumentRecord | null;
  setViewingDocument: (doc: DocumentRecord | null) => void;
  previewFile: DocumentRecord | null;
  setPreviewFile: (doc: DocumentRecord | null) => void;
  activeEquipmentDetailId: string | null;
  setActiveEquipmentDetailId: (id: string | null) => void;
  activePropertyDetailId: string | null;
  setActivePropertyDetailId: (id: string | null) => void;
  activePartyDetailId: string | null;
  setActivePartyDetailId: (id: string | null) => void;
  activeContractDetailId: string | null;
  setActiveContractDetailId: (id: string | null) => void;
  activePurchaseDetailId: string | null;
  setActivePurchaseDetailId: (id: string | null) => void;

  // Notificações e Métricas de Confiabilidade
  notifications: NotificationAlert[];
  reliabilityMetrics: BaseReliabilityMetrics;

  // Ações de mutação de Documentos
  addDocument: (
    doc: Omit<DocumentRecord, 'id' | 'createdAt'>,
    createTransaction?: {
      description: string;
      type: 'income' | 'expense';
      amountCents: number;
      category: any;
      dueDate: string;
      paymentMethod?: PaymentMethod;
      status: 'open' | 'paid';
      paymentDate?: string;
    }
  ) => { docId: string; txId?: string };
  updateDocument: (id: string, updates: Partial<DocumentRecord>) => void;
  validateDocument: (id: string) => void;
  linkDocumentToEntity: (id: string, link: DocumentLink) => void;
  resolveDuplicateDocument: (id: string, action: 'keep' | 'discard') => void;
  archiveDocument: (id: string) => void;
  restoreDocument: (id: string) => void;
  deleteDocument: (id: string) => void;

  // Ações Financeiras
  addTransaction: (tx: Omit<FinancialTransaction, 'id'>) => string;
  updateTransaction: (id: string, updates: Partial<FinancialTransaction>) => void;
  markTransactionAsPaid: (
    id: string,
    paymentDate?: string,
    paymentMethod?: PaymentMethod
  ) => void;
  reopenTransaction: (id: string) => void;
  deleteTransaction: (id: string) => void;

  // Ações de Mestres e Domínios
  addProperty: (prop: Omit<Property, 'id' | 'createdAt'>) => string;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  addEquipment: (eq: Omit<Equipment, 'id'>) => string;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  addParty: (party: Omit<EntityParty, 'id'>) => string;
  updateParty: (id: string, updates: Partial<EntityParty>) => void;

  // Contratos & Compras
  addContract: (contract: Omit<ContractRecord, 'id'>) => string;
  updateContract: (id: string, updates: Partial<ContractRecord>) => void;
  addPurchase: (purchase: Omit<PurchaseRecord, 'id'>) => string;
  updatePurchase: (id: string, updates: Partial<PurchaseRecord>) => void;
  recordPurchaseDelivery: (purchaseId: string, productId: string, deliveredQty: number) => void;

  // Tarefas e Auditoria
  addTask: (task: Omit<TaskItem, 'id'>) => string;
  updateTask: (id: string, updates: Partial<TaskItem>) => void;
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;

  // Restauração e Feedback
  resetDemoData: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicialização com dados base + dados expandidos do LSA ERP
  const initialBase = useMemo(() => getInitialSeedData(), []);
  const initialLsa = useMemo(() => getLsaDomainSeedData(), []);

  const [properties, setProperties] = useState<Property[]>(() => [
    ...initialBase.properties,
    ...initialLsa.additionalProperties,
  ]);
  const [equipment, setEquipment] = useState<Equipment[]>(() => initialBase.equipment);
  const [parties, setParties] = useState<EntityParty[]>(() => [
    ...initialBase.parties,
    ...initialLsa.additionalParties,
  ]);
  const [documents, setDocuments] = useState<DocumentRecord[]>(() => [
    ...initialLsa.additionalDocuments,
    ...initialBase.documents,
  ]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(
    () => initialBase.transactions
  );
  const [contracts, setContracts] = useState<ContractRecord[]>(() => initialLsa.contracts);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>(() => initialLsa.purchases);
  const [inventory, setInventory] = useState<InventoryRecord[]>(() => initialLsa.inventory);
  const [commercial, setCommercial] = useState<CommercialRecord[]>(() => initialLsa.commercial);
  const [insurance, setInsurance] = useState<InsuranceRecord[]>(() => initialLsa.insurance);
  const [tasks, setTasks] = useState<TaskItem[]>(() => initialLsa.tasks);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => initialLsa.auditLogs);

  // Navegação
  const [activeTab, setActiveTab] = useState<ViewTab>('overview');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | '30days' | '90days' | 'year'>('all');
  const [safraFilter, setSafraFilter] = useState<string>('all');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  // Modais e gavetas
  const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<DocumentRecord | null>(null);
  const [previewFile, setPreviewFile] = useState<DocumentRecord | null>(null);
  const [activeEquipmentDetailId, setActiveEquipmentDetailId] = useState<string | null>(null);
  const [activePropertyDetailId, setActivePropertyDetailId] = useState<string | null>(null);
  const [activePartyDetailId, setActivePartyDetailId] = useState<string | null>(null);
  const [activeContractDetailId, setActiveContractDetailId] = useState<string | null>(null);
  const [activePurchaseDetailId, setActivePurchaseDetailId] = useState<string | null>(null);

  // Toast temporário de feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  const openAddDocModalWithDefaults = useCallback(
    (equipmentId?: string, propertyId?: string) => {
      if (propertyId) {
        setSelectedPropertyId(propertyId);
      }
      setIsAddDocModalOpen(true);
    },
    []
  );

  // Registro de Auditoria (SYS-01)
  const addAuditLog = useCallback(
    (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
      const now = new Date();
      const timeStr = `${getTodayIso()} ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      const newLog: AuditLogEntry = {
        ...entry,
        id: `log-${Date.now()}`,
        timestamp: timeStr,
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    },
    []
  );

  // Geração de Notificações calculadas dinamicamente
  const notifications = useMemo(() => {
    const today = getTodayIso();
    const list: NotificationAlert[] = [];

    // 1. Contas atrasadas
    transactions.forEach((tx) => {
      if (tx.status === 'open' && tx.type === 'expense') {
        const diff = getDaysDiff(tx.dueDate, today);
        if (diff < 0) {
          list.push({
            id: `notif-overdue-${tx.id}`,
            title: 'Conta em atraso',
            description: `${tx.description} venceu há ${Math.abs(diff)} dia(s).`,
            type: 'overdue',
            targetType: 'financial',
            targetId: tx.id,
            dateStr: tx.dueDate,
          });
        }
      }
    });

    // 2. Contas próximas a vencer (nos próximos 7 dias)
    transactions.forEach((tx) => {
      if (tx.status === 'open' && tx.type === 'expense') {
        const diff = getDaysDiff(tx.dueDate, today);
        if (diff >= 0 && diff <= 7) {
          list.push({
            id: `notif-upcoming-${tx.id}`,
            title: 'Vencimento próximo',
            description: `${tx.description} vence em ${diff === 0 ? 'hoje' : diff + ' dia(s)'}.`,
            type: 'upcoming',
            targetType: 'financial',
            targetId: tx.id,
            dateStr: tx.dueDate,
          });
        }
      }
    });

    // 3. Documentos pendentes de classificação ou validação
    documents.forEach((doc) => {
      if (doc.status === 'pending' || doc.validationStatus === 'draft') {
        list.push({
          id: `notif-unclassified-${doc.id}`,
          title: 'Documento pendente de validação',
          description: `O documento "${doc.title}" requer conferência ou classificação.`,
          type: 'unclassified',
          targetType: 'document',
          targetId: doc.id,
        });
      }
    });

    // 4. Documentos com validade próxima
    documents.forEach((doc) => {
      if (doc.expirationDate && doc.status !== 'archived') {
        const diff = getDaysDiff(doc.expirationDate, today);
        if (diff >= 0 && diff <= 30) {
          list.push({
            id: `notif-exp-${doc.id}`,
            title: 'Validade próxima',
            description: `"${doc.title}" vence em ${diff} dia(s).`,
            type: 'expiring',
            targetType: 'document',
            targetId: doc.id,
            dateStr: doc.expirationDate,
          });
        }
      }
    });

    return list;
  }, [transactions, documents]);

  // Cálculo do Selo de Confiabilidade da Base (Porta de Qualidade LSA V1.0)
  const reliabilityMetrics = useMemo(() => {
    return calculateBaseReliabilityMetrics(documents, transactions);
  }, [documents, transactions]);

  // Ação: Adicionar Documento
  const addDocument = useCallback(
    (
      docData: Omit<DocumentRecord, 'id' | 'createdAt'>,
      createTransaction?: {
        description: string;
        type: 'income' | 'expense';
        amountCents: number;
        category: any;
        dueDate: string;
        paymentMethod?: PaymentMethod;
        status: 'open' | 'paid';
        paymentDate?: string;
      }
    ) => {
      const today = getTodayIso();
      const docId = `doc-${Date.now()}`;
      let txId: string | undefined = undefined;

      if (createTransaction) {
        txId = `tx-${Date.now()}`;
        const newTx: FinancialTransaction = {
          id: txId,
          description: createTransaction.description,
          type: createTransaction.type,
          amountCents: createTransaction.amountCents,
          category: createTransaction.category,
          propertyId: docData.propertyId,
          partyId: docData.partyId,
          issueDate: docData.issueDate || today,
          dueDate: createTransaction.dueDate || today,
          paymentDate:
            createTransaction.status === 'paid'
              ? createTransaction.paymentDate || today
              : undefined,
          status: createTransaction.status,
          paymentMethod: createTransaction.paymentMethod || 'Boleto Bancário',
          documentId: docId,
          cropSeason: docData.cropSeason,
          costCenter: docData.costCenter,
          equipmentId: docData.equipmentId,
          notes: `Gerado a partir do documento: ${docData.title}`,
          isAllocationComplete: true,
          isReconciled: createTransaction.status === 'paid',
        };
        setTransactions((prev) => [newTx, ...prev]);
      }

      const newDoc: DocumentRecord = {
        ...docData,
        id: docId,
        createdAt: today,
        linkedFinancialId: txId,
        validationStatus: docData.validationStatus || 'published',
        source: docData.source || 'upload',
      };

      setDocuments((prev) => [newDoc, ...prev]);
      addAuditLog({
        actor: 'Operador LSA',
        action: 'Criação',
        entityType: 'Documento Lógico',
        entityId: docId,
        entityTitle: newDoc.title,
        details: `Documento recebido via ${newDoc.source} e arquivado no sistema.`,
      });
      showToast('Documento registrado com sucesso no acervo!');
      return { docId, txId };
    },
    [showToast, addAuditLog]
  );

  const updateDocument = useCallback(
    (id: string, updates: Partial<DocumentRecord>) => {
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc))
      );
      showToast('Documento atualizado com sucesso.');
    },
    [showToast]
  );

  // Validação Formal do Documento (Porta de Qualidade LSA)
  const validateDocument = useCallback(
    (id: string) => {
      const today = getTodayIso();
      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.id === id) {
            return {
              ...doc,
              status: 'organized',
              validationStatus: 'published',
              isDuplicateSuspect: false,
              validatedAt: today,
              validatedBy: 'Operador LSA',
            };
          }
          return doc;
        })
      );
      addAuditLog({
        actor: 'Operador LSA',
        action: 'Validação',
        entityType: 'Documento Lógico',
        entityId: id,
        entityTitle: 'Validação Formal de Documento',
        details: 'Classificação, metadados e vínculos conferidos. Documento publicado para consulta.',
      });
      showToast('Documento validado e publicado no acervo oficial!');
    },
    [showToast, addAuditLog]
  );

  // Vincular Documento a Entidade (DOC-03)
  const linkDocumentToEntity = useCallback(
    (id: string, link: DocumentLink) => {
      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.id === id) {
            const existingLinks = doc.links || [];
            const updatedLinks = [...existingLinks.filter((l) => l.entityId !== link.entityId), link];
            return {
              ...doc,
              links: updatedLinks,
              propertyId: link.entityType === 'property' ? link.entityId : doc.propertyId,
              equipmentId: link.entityType === 'equipment' ? link.entityId : doc.equipmentId,
            };
          }
          return doc;
        })
      );
      addAuditLog({
        actor: 'Operador LSA',
        action: 'Vinculação',
        entityType: 'Documento Lógico',
        entityId: id,
        entityTitle: 'Vínculo Relacional',
        details: `Vínculo estabelecido com ${link.entityType}: ${link.entityName}`,
      });
      showToast(`Vínculo associado com sucesso a ${link.entityName}!`);
    },
    [showToast, addAuditLog]
  );

  // Resolução de Duplicidade
  const resolveDuplicateDocument = useCallback(
    (id: string, action: 'keep' | 'discard') => {
      if (action === 'discard') {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        showToast('Documento duplicado removido da Caixa de Entrada.');
      } else {
        setDocuments((prev) =>
          prev.map((d) => (d.id === id ? { ...d, isDuplicateSuspect: false } : d))
        );
        showToast('Suspeita de duplicidade desconsiderada. Documento mantido.');
      }
    },
    [showToast]
  );

  const archiveDocument = useCallback(
    (id: string) => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id ? { ...doc, status: 'archived' } : doc
        )
      );
      showToast('Documento arquivado.');
    },
    [showToast]
  );

  const restoreDocument = useCallback(
    (id: string) => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === id ? { ...doc, status: 'organized' } : doc
        )
      );
      showToast('Documento restaurado.');
    },
    [showToast]
  );

  const deleteDocument = useCallback(
    (id: string) => {
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      showToast('Documento excluído.');
    },
    [showToast]
  );

  // Transações Financeiras
  const addTransaction = useCallback(
    (tx: Omit<FinancialTransaction, 'id'>) => {
      const id = `tx-${Date.now()}`;
      const newTx: FinancialTransaction = {
        ...tx,
        id,
        isAllocationComplete: true,
        isReconciled: tx.status === 'paid',
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast('Lançamento financeiro cadastrado com sucesso!');
      return id;
    },
    [showToast]
  );

  const updateTransaction = useCallback(
    (id: string, updates: Partial<FinancialTransaction>) => {
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
      );
      showToast('Lançamento financeiro atualizado.');
    },
    [showToast]
  );

  const markTransactionAsPaid = useCallback(
    (id: string, paymentDate?: string, paymentMethod?: PaymentMethod) => {
      const today = getTodayIso();
      const effDate = paymentDate || today;
      setTransactions((prev) =>
        prev.map((tx) => {
          if (tx.id === id) {
            return {
              ...tx,
              status: 'paid',
              paymentDate: effDate,
              paymentMethod: paymentMethod || tx.paymentMethod || 'Pix',
              isReconciled: true,
            };
          }
          return tx;
        })
      );
      addAuditLog({
        actor: 'Operador LSA',
        action: 'Liquidação',
        entityType: 'Lançamento Financeiro',
        entityId: id,
        entityTitle: 'Liquidação Financeira',
        details: `Título liquidado em ${effDate} via ${paymentMethod || 'Pix'}.`,
      });
      showToast('Lançamento marcado como quitado!');
    },
    [showToast, addAuditLog]
  );

  const reopenTransaction = useCallback(
    (id: string) => {
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.id === id
            ? { ...tx, status: 'open', paymentDate: undefined, isReconciled: false }
            : tx
        )
      );
      showToast('Lançamento reaberto.');
    },
    [showToast]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
      showToast('Lançamento excluído.');
    },
    [showToast]
  );

  // Propriedades, Equipamentos e Partes
  const addProperty = useCallback(
    (prop: Omit<Property, 'id' | 'createdAt'>) => {
      const id = `prop-${Date.now()}`;
      const newProp: Property = { ...prop, id, createdAt: getTodayIso() };
      setProperties((prev) => [...prev, newProp]);
      showToast('Propriedade cadastrada com sucesso!');
      return id;
    },
    [showToast]
  );

  const updateProperty = useCallback(
    (id: string, updates: Partial<Property>) => {
      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
      showToast('Propriedade atualizada.');
    },
    [showToast]
  );

  const addEquipment = useCallback(
    (eq: Omit<Equipment, 'id'>) => {
      const id = `eq-${Date.now()}`;
      const newEq: Equipment = { ...eq, id };
      setEquipment((prev) => [...prev, newEq]);
      showToast('Equipamento cadastrado com sucesso!');
      return id;
    },
    [showToast]
  );

  const updateEquipment = useCallback(
    (id: string, updates: Partial<Equipment>) => {
      setEquipment((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
      );
      showToast('Equipamento atualizado.');
    },
    [showToast]
  );

  const addParty = useCallback(
    (party: Omit<EntityParty, 'id'>) => {
      const id = `party-${Date.now()}`;
      const newParty: EntityParty = { ...party, id };
      setParties((prev) => [...prev, newParty]);
      showToast('Pessoa/Fornecedor cadastrado com sucesso!');
      return id;
    },
    [showToast]
  );

  const updateParty = useCallback(
    (id: string, updates: Partial<EntityParty>) => {
      setParties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
      showToast('Cadastro atualizado.');
    },
    [showToast]
  );

  // Contratos
  const addContract = useCallback(
    (contract: Omit<ContractRecord, 'id'>) => {
      const id = `ctr-${Date.now()}`;
      const newContract: ContractRecord = { ...contract, id };
      setContracts((prev) => [newContract, ...prev]);
      addAuditLog({
        actor: 'Gestor LSA',
        action: 'Criação',
        entityType: 'Contrato',
        entityId: id,
        entityTitle: newContract.title,
        details: `Contrato de ${newContract.contractType} cadastrado com vigência até ${newContract.endDate}.`,
      });
      showToast('Contrato registrado na Central de Contratos!');
      return id;
    },
    [showToast, addAuditLog]
  );

  const updateContract = useCallback(
    (id: string, updates: Partial<ContractRecord>) => {
      setContracts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
      showToast('Contrato atualizado.');
    },
    [showToast]
  );

  // Compras e Entregas
  const addPurchase = useCallback(
    (purchase: Omit<PurchaseRecord, 'id'>) => {
      const id = `pur-${Date.now()}`;
      const newPur: PurchaseRecord = { ...purchase, id };
      setPurchases((prev) => [newPur, ...prev]);
      showToast('Ordem de Compra cadastrada com sucesso!');
      return id;
    },
    [showToast]
  );

  const updatePurchase = useCallback(
    (id: string, updates: Partial<PurchaseRecord>) => {
      setPurchases((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
      showToast('Compra atualizada.');
    },
    [showToast]
  );

  const recordPurchaseDelivery = useCallback(
    (purchaseId: string, productId: string, deliveredQty: number) => {
      setPurchases((prev) =>
        prev.map((pur) => {
          if (pur.id === purchaseId) {
            const updatedItems = pur.items.map((item) => {
              if (item.productId === productId) {
                const newDelivered = item.deliveredQuantity + deliveredQty;
                return { ...item, deliveredQuantity: newDelivered };
              }
              return item;
            });
            const allDelivered = updatedItems.every((i) => i.deliveredQuantity >= i.quantity);
            return {
              ...pur,
              items: updatedItems,
              status: allDelivered ? 'delivered' : 'partial_delivered',
            };
          }
          return pur;
        })
      );

      // Atualiza também o estoque (adiciona ao físico e reduz saldo no fornecedor)
      setInventory((prev) =>
        prev.map((inv) => {
          if (inv.id.includes(productId) || inv.productName.toLowerCase().includes('elatus')) {
            return {
              ...inv,
              physicalStock: inv.physicalStock + deliveredQty,
              supplierStock: Math.max(0, inv.supplierStock - deliveredQty),
              lastMovementDate: getTodayIso(),
            };
          }
          return inv;
        })
      );

      showToast(`Entrega de ${deliveredQty} registrada! Estoque físico e saldo em fornecedor atualizados.`);
    },
    [showToast]
  );

  // Tarefas
  const addTask = useCallback(
    (task: Omit<TaskItem, 'id'>) => {
      const id = `task-${Date.now()}`;
      const newTask: TaskItem = { ...task, id };
      setTasks((prev) => [newTask, ...prev]);
      showToast('Tarefa administrativa adicionada à agenda!');
      return id;
    },
    [showToast]
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<TaskItem>) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
      showToast('Tarefa atualizada.');
    },
    [showToast]
  );

  // Reset Demo
  const resetDemoData = useCallback(() => {
    const base = getInitialSeedData();
    const lsa = getLsaDomainSeedData();

    setProperties([...base.properties, ...lsa.additionalProperties]);
    setEquipment(base.equipment);
    setParties([...base.parties, ...lsa.additionalParties]);
    setDocuments([...lsa.additionalDocuments, ...base.documents]);
    setTransactions(base.transactions);
    setContracts(lsa.contracts);
    setPurchases(lsa.purchases);
    setInventory(lsa.inventory);
    setCommercial(lsa.commercial);
    setInsurance(lsa.insurance);
    setTasks(lsa.tasks);
    setAuditLogs(lsa.auditLogs);

    setSelectedPropertyId('all');
    setPeriodFilter('all');
    setSafraFilter('all');
    setGlobalSearchQuery('');
    showToast('Base LSA ERP Rural restaurada integralmente para o padrão demonstrativo!');
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        properties,
        equipment,
        parties,
        documents,
        transactions,
        contracts,
        purchases,
        inventory,
        commercial,
        insurance,
        tasks,
        auditLogs,
        activeTab,
        setActiveTab,
        selectedPropertyId,
        setSelectedPropertyId,
        periodFilter,
        setPeriodFilter,
        safraFilter,
        setSafraFilter,
        globalSearchQuery,
        setGlobalSearchQuery,
        isAddDocModalOpen,
        setIsAddDocModalOpen,
        openAddDocModalWithDefaults,
        isNotificationsDrawerOpen,
        setIsNotificationsDrawerOpen,
        viewingDocument,
        setViewingDocument,
        previewFile,
        setPreviewFile,
        activeEquipmentDetailId,
        setActiveEquipmentDetailId,
        activePropertyDetailId,
        setActivePropertyDetailId,
        activePartyDetailId,
        setActivePartyDetailId,
        activeContractDetailId,
        setActiveContractDetailId,
        activePurchaseDetailId,
        setActivePurchaseDetailId,
        notifications,
        reliabilityMetrics,
        addDocument,
        updateDocument,
        validateDocument,
        linkDocumentToEntity,
        resolveDuplicateDocument,
        archiveDocument,
        restoreDocument,
        deleteDocument,
        addTransaction,
        updateTransaction,
        markTransactionAsPaid,
        reopenTransaction,
        deleteTransaction,
        addProperty,
        updateProperty,
        addEquipment,
        updateEquipment,
        addParty,
        updateParty,
        addContract,
        updateContract,
        addPurchase,
        updatePurchase,
        recordPurchaseDelivery,
        addTask,
        updateTask,
        addAuditLog,
        resetDemoData,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser utilizado dentro de um AppProvider');
  }
  return context;
};
