// Tipos e Interfaces do AgroArquivo

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

export type EquipmentType =
  | 'tractor'
  | 'harvester'
  | 'truck'
  | 'pickup'
  | 'implement'
  | 'other';

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

export interface Property {
  id: string;
  name: string;
  city: string;
  state: string; // UF (ex: 'SP', 'MT')
  areaHectares: number;
  responsible: string;
  mainCrops: string[];
  notes: string;
  createdAt: string;
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
}

export interface EntityParty {
  id: string;
  name: string;
  type: PartyType;
  contact: string;
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
  fileDataUrl?: string; // para arquivos reais adicionados na sessão
  linkedFinancialId?: string;
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
  | 'overview'
  | 'documents'
  | 'financial'
  | 'properties'
  | 'equipment'
  | 'parties'
  | 'reports'
  | 'settings';
