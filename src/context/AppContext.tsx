// Contexto principal de estado da aplicação AgroArquivo
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
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
} from '../types';
import { getInitialSeedData } from '../data/seedData';
import { getTodayIso, getDaysDiff } from '../utils/formatters';

interface AppContextType {
  // Dados principais em memória
  properties: Property[];
  equipment: Equipment[];
  parties: EntityParty[];
  documents: DocumentRecord[];
  transactions: FinancialTransaction[];

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

  // Modais e painéis laterais
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

  // Notificações e alertas
  notifications: NotificationAlert[];

  // Ações de mutação
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
  archiveDocument: (id: string) => void;
  restoreDocument: (id: string) => void;
  deleteDocument: (id: string) => void;

  addTransaction: (
    tx: Omit<FinancialTransaction, 'id'>
  ) => string;
  updateTransaction: (id: string, updates: Partial<FinancialTransaction>) => void;
  markTransactionAsPaid: (
    id: string,
    paymentDate?: string,
    paymentMethod?: PaymentMethod
  ) => void;
  reopenTransaction: (id: string) => void;
  deleteTransaction: (id: string) => void;

  addProperty: (prop: Omit<Property, 'id' | 'createdAt'>) => string;
  updateProperty: (id: string, updates: Partial<Property>) => void;

  addEquipment: (eq: Omit<Equipment, 'id'>) => string;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;

  addParty: (party: Omit<EntityParty, 'id'>) => string;
  updateParty: (id: string, updates: Partial<EntityParty>) => void;

  resetDemoData: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Inicialização com dados fictícios
  const [seed] = useState(() => getInitialSeedData());

  const [properties, setProperties] = useState<Property[]>(seed.properties);
  const [equipment, setEquipment] = useState<Equipment[]>(seed.equipment);
  const [parties, setParties] = useState<EntityParty[]>(seed.parties);
  const [documents, setDocuments] = useState<DocumentRecord[]>(seed.documents);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(
    seed.transactions
  );

  // Navegação
  const [activeTab, setActiveTab] = useState<ViewTab>('overview');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<
    'all' | '30days' | '90days' | 'year'
  >('all');
  const [safraFilter, setSafraFilter] = useState<string>('all');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  // Modais e gavetas
  const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] =
    useState(false);
  const [viewingDocument, setViewingDocument] = useState<DocumentRecord | null>(
    null
  );
  const [previewFile, setPreviewFile] = useState<DocumentRecord | null>(null);
  const [activeEquipmentDetailId, setActiveEquipmentDetailId] = useState<
    string | null
  >(null);
  const [activePropertyDetailId, setActivePropertyDetailId] = useState<
    string | null
  >(null);

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

    // 3. Documentos pendentes de classificação
    documents.forEach((doc) => {
      if (doc.status === 'pending') {
        list.push({
          id: `notif-unclassified-${doc.id}`,
          title: 'Documento pendente de classificação',
          description: `O documento "${doc.title}" requer categoria ou metadados.`,
          type: 'unclassified',
          targetType: 'document',
          targetId: doc.id,
        });
      }
    });

    // 4. Documentos com validade próxima (próximos 30 dias)
    documents.forEach((doc) => {
      if (doc.expirationDate && doc.status !== 'archived') {
        const diff = getDaysDiff(doc.expirationDate, today);
        if (diff >= 0 && diff <= 30) {
          list.push({
            id: `notif-exp-${doc.id}`,
            title: 'Documento com validade próxima',
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

  // Ação: Adicionar Documento com possível criação de Lançamento Financeiro
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
        };
        setTransactions((prev) => [newTx, ...prev]);
      }

      const newDoc: DocumentRecord = {
        ...docData,
        id: docId,
        createdAt: today,
        linkedFinancialId: txId,
      };

      setDocuments((prev) => [newDoc, ...prev]);
      showToast('Documento adicionado à sessão com sucesso!');
      return { docId, txId };
    },
    [showToast]
  );

  const updateDocument = useCallback(
    (id: string, updates: Partial<DocumentRecord>) => {
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc))
      );
      showToast('Documento atualizado com sucesso!');
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
      showToast('Documento movido para arquivados.');
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
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      showToast('Documento excluído.');
    },
    [showToast]
  );

  const addTransaction = useCallback(
    (tx: Omit<FinancialTransaction, 'id'>) => {
      const id = `tx-${Date.now()}`;
      const newTx: FinancialTransaction = { ...tx, id };
      setTransactions((prev) => [newTx, ...prev]);
      showToast('Lançamento financeiro registrado com sucesso!');
      return id;
    },
    [showToast]
  );

  const updateTransaction = useCallback(
    (id: string, updates: Partial<FinancialTransaction>) => {
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
      );
      showToast('Lançamento atualizado.');
    },
    [showToast]
  );

  const markTransactionAsPaid = useCallback(
    (
      id: string,
      paymentDate?: string,
      paymentMethod?: PaymentMethod
    ) => {
      const today = getTodayIso();
      setTransactions((prev) =>
        prev.map((tx) => {
          if (tx.id === id) {
            return {
              ...tx,
              status: 'paid',
              paymentDate: paymentDate || today,
              paymentMethod: paymentMethod || tx.paymentMethod || 'Pix',
            };
          }
          return tx;
        })
      );
      showToast('Conta marcada como paga e saldo atualizado!');
    },
    [showToast]
  );

  const reopenTransaction = useCallback(
    (id: string) => {
      setTransactions((prev) =>
        prev.map((tx) => {
          if (tx.id === id) {
            return {
              ...tx,
              status: 'open',
              paymentDate: undefined,
            };
          }
          return tx;
        })
      );
      showToast('Lançamento reaberto como pendente.');
    },
    [showToast]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
      showToast('Lançamento financeiro excluído.');
    },
    [showToast]
  );

  const addProperty = useCallback(
    (prop: Omit<Property, 'id' | 'createdAt'>) => {
      const id = `prop-${Date.now()}`;
      const newProp: Property = {
        ...prop,
        id,
        createdAt: getTodayIso(),
      };
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
      showToast('Máquina/Veículo cadastrado com sucesso!');
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
      showToast('Fornecedor/Cliente cadastrado com sucesso!');
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

  const resetDemoData = useCallback(() => {
    const fresh = getInitialSeedData();
    setProperties(fresh.properties);
    setEquipment(fresh.equipment);
    setParties(fresh.parties);
    setDocuments(fresh.documents);
    setTransactions(fresh.transactions);
    setSelectedPropertyId('all');
    setPeriodFilter('all');
    setSafraFilter('all');
    setGlobalSearchQuery('');
    showToast('Base de demonstração restaurada para os dados iniciais!');
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        properties,
        equipment,
        parties,
        documents,
        transactions,
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
        notifications,
        addDocument,
        updateDocument,
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
