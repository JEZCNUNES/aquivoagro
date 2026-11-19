// Tipos e Interfaces do AgroArquivo — LSA ERP Rural & Taxonomia Documental V1.0

export type DocumentCategory =
  | 'Notas fiscais de compras'
  | 'Notas fiscais de vendas'
  | 'Veículos'
  | 'Máquinas e implementos'
  | 'Peças e manutenção'
  | 'Combustíveis'
  | 'Insumos agrícolas'
  | 'Contratos e arrendamentos'
  | 'Documentos da propriedade'
  | 'Comprovantes de pagamento'
  | 'Financiamentos e seguros'
  | 'Outros';

export type PropertyDocSubtype =
  | 'CAR'
  | 'CCIR'
  | 'ITR'
  | 'Matrícula'
  | 'Escritura'
  | 'Outros documentos';

export type DocumentStatus = 'pending' | 'organized' | 'archived';

export type DocumentValidationStatus =
  | 'draft'
  | 'pending_validation'
  | 'validated'
  | 'published'
  | 'cancelled'
  | 'replaced';

export type DocumentSource =
  | 'upload'
  | 'email'
  | 'integracao'
  | 'importacao'
  | 'portal';

export type EquipmentType =
  | 'tractor'
  | 'harvester'
  | 'truck'
  | 'pickup'
  | 'implement'
  | 'other';

export type PropertyUseType =
  | 'propria'
  | 'arrendada'
  | 'parceria'
  | 'cedida'
  | 'inativa';

export type PartyRole =
  | 'titular'
  | 'socio'
  | 'conjuge'
  | 'procurador'
  | 'empresa_vinculada'
  | 'colaborador'
  | 'fornecedor'
  | 'comprador'
  | 'banco'
  | 'seguradora'
  | 'prestador';

export type PartyType = 'supplier' | 'client' | 'both';

export type TransactionType = 'income' | 'expense';

export type TransactionStatus = 'paid' | 'open';

export type PaymentMethod =
  | 'Pix'
  | 'Boleto Bancário'
  | 'Transferência Bancária'
  | 'Cartão de Crédito'
  | 'Dinheiro'
  | 'Cheque';

export type FinancialCategory =
  | 'Venda de Produção'
  | 'Peças e Manutenção'
  | 'Combustível e Lubrificantes'
  | 'Insumos e Defensivos'
  | 'Sementes e Fertilizantes'
  | 'Arrendamento de Terras'
  | 'Seguro Rural e Financiamento'
  | 'Folha e Serviços de Terceiros'
  | 'Impostos e Taxas'
  | 'Aquisição de Imobilizado'
  | 'Outras Despesas';

export type PurchaseCategory =
  | 'Sementes'
  | 'Nutrição & Fertilidade'
  | 'Defensivos Químicos'
  | 'Biológicos'
  | 'Adjuvantes'
  | 'Máquinas & Equipamentos'
  | 'Peças & Manutenção'
  | 'Combustíveis & Lubrificantes'
  | 'Serviços'
  | 'Fretes & Logística'
  | 'Armazenagem'
  | 'Outros';

export type ContractType =
  | 'arrendamento'
  | 'parceria'
  | 'comodato'
  | 'compra'
  | 'venda'
  | 'fornecimento'
  | 'prestacao_servico'
  | 'financiamento'
  | 'seguro'
  | 'trabalhista'
  | 'outros';

export interface DocumentLink {
  entityType: 'property' | 'equipment' | 'party' | 'contract' | 'purchase' | 'commercial' | 'financial' | 'insurance';
  entityId: string;
  entityName: string;
  relationType?: string;
  isPrimary?: boolean;
}

export interface Property {
  id: string;
  name: string;
  city: string;
  state: string; // UF (ex: 'SP', 'MT')
  areaHectares: number;
  useType?: PropertyUseType;
  responsible: string;
  mainCrops: string[];
  notes: string;
  createdAt: string;
  carRegistration?: string;
  ccirCode?: string;
  matriculaNumber?: string;
  geoPolygonRef?: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  brand: string;
  model: string;
  year: number;
  plateOrSerial: string;
  propertyId: string;
  acquisitionDate: string; // YYYY-MM-DD
  acquisitionValueCents: number;
  notes: string;
  isThirdParty?: boolean;
  categoryGroup?: 'maquinas' | 'implementos' | 'veiculos' | 'equipamentos' | 'infraestrutura';
}

export interface EntityParty {
  id: string;
  name: string;
  type: PartyType;
  roles?: PartyRole[];
  taxId?: string; // CPF ou CNPJ
  contact: string;
  email?: string;
  phone?: string;
  city: string;
  state: string;
  notes: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  originalFileName: string;
  fileType: 'pdf' | 'jpg' | 'png' | 'xml';
  fileSizeBytes: number;
  category: DocumentCategory;
  subType?: string;
  propertySubtype?: PropertyDocSubtype;
  propertyId: string;
  partyId?: string; // fornecedor ou cliente
  issueDate: string; // YYYY-MM-DD
  createdAt: string; // YYYY-MM-DD
  valueCents?: number;
  invoiceNumber?: string;
  accessKey?: string;
  cropSeason?: string;
  costCenter?: string;
  equipmentId?: string; // máquina ou veículo vinculado
  tags: string[];
  notes: string;
  expirationDate?: string; // YYYY-MM-DD
  status: DocumentStatus;
  isSimulated?: boolean;
  fileDataUrl?: string;
  linkedFinancialId?: string;

  // LSA ERP V1.0 - Expansões canônicas
  validationStatus?: DocumentValidationStatus;
  source?: DocumentSource;
  primaryContext?: {
    type: 'property' | 'equipment' | 'party' | 'contract' | 'purchase' | 'commercial' | 'financial' | 'insurance';
    id: string;
    name: string;
  };
  links?: DocumentLink[];
  isDuplicateSuspect?: boolean;
  isFavorite?: boolean;
  validatedBy?: string;
  validatedAt?: string;
}

export interface FinancialTransaction {
  id: string;
  description: string;
  type: TransactionType;
  amountCents: number;
  category: FinancialCategory;
  propertyId: string;
  partyId?: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  paymentDate?: string; // YYYY-MM-DD (efetivação)
  status: TransactionStatus;
  paymentMethod?: PaymentMethod;
  documentId?: string;
  cropSeason?: string;
  costCenter?: string;
  equipmentId?: string;
  notes: string;

  // LSA ERP V1.0 - Rateio & Reconciliação
  isReconciled?: boolean;
  isAllocationComplete?: boolean;
  allocatedPercentage?: number;
}

export interface ContractRecord {
  id: string;
  title: string;
  numberRef: string;
  contractType: ContractType;
  startDate: string;
  endDate: string;
  amountCents?: number;
  status: 'active' | 'expiring' | 'expired' | 'renewed' | 'cancelled';
  parties: Array<{ partyId: string; partyName: string; role: string }>;
  primaryContext: {
    type: 'property' | 'equipment' | 'party' | 'commercial' | 'financial' | 'other';
    id: string;
    name: string;
  };
  linkedDocumentId?: string;
  renewalRule?: string;
  notes: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPriceCents: number;
  totalCents: number;
  purchaseCategory: PurchaseCategory;
  deliveredQuantity: number;
}

export interface PurchaseRecord {
  id: string;
  orderNumber: string;
  supplierPartyId: string;
  supplierName: string;
  purchaseDate: string;
  totalAmountCents: number;
  category: PurchaseCategory;
  status: 'draft' | 'pending_validation' | 'validated' | 'delivered' | 'partial_delivered';
  items: PurchaseItem[];
  fiscalDocumentId?: string;
  invoiceNumber?: string;
  paymentStatus: 'paid' | 'open' | 'partial';
  dueDate: string;
  propertyId?: string;
  cropSeason?: string;
  notes: string;
}

export interface InventoryRecord {
  id: string;
  productName: string;
  category: string;
  unit: string;
  physicalStock: number;
  supplierStock: number; // Saldo em fornecedor
  propertyId: string;
  propertyName: string;
  lastMovementDate: string;
  minAlertThreshold: number;
}

export interface CommercialRecord {
  id: string;
  culture: 'Soja' | 'Milho' | 'Feijão' | 'Sorgo' | 'Outros';
  cropSeason: string;
  buyerPartyId: string;
  buyerName: string;
  contractNumber: string;
  totalVolumeSacks: number;
  deliveredVolumeSacks: number;
  fixedPricePerSackCents: number;
  totalAmountCents: number;
  receivedAmountCents: number;
  status: 'open' | 'fixing' | 'delivering' | 'completed';
  deliveryDeadline: string;
  notes: string;
}

export interface InsuranceRecord {
  id: string;
  policyNumber: string;
  type: 'rural_producao' | 'patrimonial' | 'veiculos_maquinas' | 'outras';
  insurerPartyId: string;
  insurerName: string;
  startDate: string;
  endDate: string;
  premiumCents: number;
  insuredAmountCents: number;
  coveredItems: string[];
  linkedAssetId?: string;
  linkedAssetName?: string;
  linkedPropertyId?: string;
  linkedPropertyName?: string;
  status: 'active' | 'expiring' | 'expired';
  documentId?: string;
}

export interface RateioAllocation {
  id: string;
  transactionId: string;
  propertyId?: string;
  propertyName?: string;
  cropSeason?: string;
  culture?: string;
  costCenter?: string;
  financialCategory?: string;
  percentage: number;
  allocatedAmountCents: number;
}

export interface BaseReliabilityMetrics {
  validatedPercentage: number;
  allocatedPercentage: number;
  reconciledPercentage: number;
  linkedPercentage: number;
  overallScore: number;
  criticalIssuesCount: number;
  unclassifiedCount: number;
  unlinkedCount: number;
  duplicateCount: number;
  incompleteAllocationsCount: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action:
    | 'Criação'
    | 'Classificação'
    | 'Validação'
    | 'Vinculação'
    | 'Publicação'
    | 'Rateio Fechado'
    | 'Liquidação'
    | 'Cancelamento';
  entityType: string;
  entityId: string;
  entityTitle: string;
  details: string;
}

export interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'Documental' | 'Contratual' | 'Financeira' | 'Cadastral' | 'Operacional';
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed';
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export interface NotificationAlert {
  id: string;
  title: string;
  description: string;
  type: 'overdue' | 'upcoming' | 'unclassified' | 'expiring';
  targetType: 'document' | 'financial';
  targetId: string;
  dateStr?: string;
}

export type ViewTab =
  | 'overview'       // Visão Geral / Painel do Cliente
  | 'inbox'          // Caixa de Entrada Operacional (Novos, Aguardando Classificação, etc.)
  | 'pendencies'     // Pendências (Documentais, Cadastrais, Rateio Incompleto)
  | 'deadlines'      // Vencimentos (7, 30, 60, 90 dias transversais)
  | 'tasks'          // Agenda & Tarefas
  | 'parties'        // Cliente & Pessoas (Titular, Sócios, Procuradores, Equipe)
  | 'properties'     // Propriedades (Áreas Próprias, Arrendadas, Parcerias)
  | 'equipment'      // Patrimônio & Infraestrutura (Máquinas, Implementos, Veículos, Galpões)
  | 'purchases'      // Fornecedores & Compras (Pedidos, NFs de Entrada, Categorias de Compra)
  | 'inventory'      // Estoques & Saldos (Físico vs Saldo em Fornecedor, Silos)
  | 'commercial'     // Comercialização (Vendas por Cultura/Safra, Fixações, Contratos de Venda)
  | 'financial'      // Financeiro & Crédito (Posição, A Pagar, A Receber, Conciliação, Rateios)
  | 'fiscal'         // Fiscal & Contábil (Consulta Transversal de NFs, Guias, Declarações)
  | 'insurance'      // Seguros (Apólices Rurais, Maquinário, Coberturas)
  | 'documents'      // Central de Documentos (Acervo Geral, Vencendo, Sem Vínculo, Busca Avançada)
  | 'contracts'      // Central de Contratos Transversal (Arrendamentos, Compras, Vendas, Crédito)
  | 'reports'        // Relatórios & Análise (Custos por Safra/Propriedade, Confiabilidade)
  | 'settings';      // Sistema (Auditoria SYS-01, Taxonomias, Permissões, Configurações)
