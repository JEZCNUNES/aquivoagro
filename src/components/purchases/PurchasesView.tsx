import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PurchaseRecord, PurchaseCategory } from '../../types';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Truck,
  FileText,
  DollarSign,
  Boxes,
  CheckCircle2,
  Calendar,
  Building2,
  Eye,
  Check,
  AlertCircle,
  PackageCheck,
} from 'lucide-react';
import { formatCurrencyBRL, formatDateBR } from '../../utils/formatters';

const PURCHASE_CATEGORIES: PurchaseCategory[] = [
  'Defensivos Químicos',
  'Sementes',
  'Nutrição & Fertilidade',
  'Biológicos',
  'Adjuvantes',
  'Máquinas & Equipamentos',
  'Peças & Manutenção',
  'Combustíveis & Lubrificantes',
  'Serviços',
  'Fretes & Logística',
  'Armazenagem',
  'Outros',
];

export const PurchasesView: React.FC = () => {
  const {
    purchases,
    parties,
    properties,
    documents,
    recordPurchaseDelivery,
    addPurchase,
    setPreviewFile,
    showToast,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseRecord | null>(null);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [selectedDeliveryItem, setSelectedDeliveryItem] = useState<{
    purchaseId: string;
    productId: string;
    productName: string;
    remaining: number;
    unit: string;
  } | null>(null);
  const [deliveryQty, setDeliveryQty] = useState('');

  // Form de Nova Compra
  const [isNewPurchaseModalOpen, setIsNewPurchaseModalOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [supplierPartyId, setSupplierPartyId] = useState('');
  const [purchaseCategory, setPurchaseCategory] = useState<PurchaseCategory>('Defensivos Químicos');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalAmountStr, setTotalAmountStr] = useState('');
  const [productName, setProductName] = useState('');
  const [itemQuantityStr, setItemQuantityStr] = useState('');
  const [itemUnit, setItemUnit] = useState('Litros');
  const [itemPriceStr, setItemPriceStr] = useState('');
  const [propertyId, setPropertyId] = useState('');

  const filteredPurchases = purchases.filter((p) => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchOrder = p.orderNumber.toLowerCase().includes(q);
      const matchSupplier = p.supplierName.toLowerCase().includes(q);
      const matchInvoice = p.invoiceNumber?.toLowerCase().includes(q);
      const matchItems = p.items.some((i) => i.productName.toLowerCase().includes(q));
      if (!matchOrder && !matchSupplier && !matchInvoice && !matchItems) return false;
    }
    return true;
  });

  // Métricas de Compras
  const totalPurchasesCents = purchases.reduce((acc, p) => acc + p.totalAmountCents, 0);
  const defensivosPurchases = purchases.filter((p) => p.category === 'Defensivos Químicos');
  const totalDefensivosCents = defensivosPurchases.reduce((acc, p) => acc + p.totalAmountCents, 0);

  const handleOpenDeliveryModal = (pur: PurchaseRecord, item: any) => {
    const remaining = Math.max(0, item.quantity - item.deliveredQuantity);
    setSelectedDeliveryItem({
      purchaseId: pur.id,
      productId: item.productId,
      productName: item.productName,
      remaining,
      unit: item.unit,
    });
    setDeliveryQty(remaining.toString());
    setIsDeliveryModalOpen(true);
  };

  const handleConfirmDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeliveryItem || !deliveryQty) return;
    const qty = parseFloat(deliveryQty);
    if (qty <= 0 || qty > selectedDeliveryItem.remaining) {
      showToast(`Quantidade inválida. Saldo restante: ${selectedDeliveryItem.remaining} ${selectedDeliveryItem.unit}`);
      return;
    }

    recordPurchaseDelivery(selectedDeliveryItem.purchaseId, selectedDeliveryItem.productId, qty);
    setIsDeliveryModalOpen(false);
    setSelectedDeliveryItem(null);
    setDeliveryQty('');
  };

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierPartyId || !totalAmountStr || !productName) {
      showToast('Preencha os campos obrigatórios da compra.');
      return;
    }

    const supplier = parties.find((p) => p.id === supplierPartyId);
    const totalAmountCents = Math.round(parseFloat(totalAmountStr) * 100);
    const qty = parseFloat(itemQuantityStr) || 1;
    const unitPriceCents = Math.round((parseFloat(itemPriceStr) || 0) * 100);

    addPurchase({
      orderNumber: orderNumber || `PED-${Date.now().toString().slice(-4)}`,
      supplierPartyId,
      supplierName: supplier?.name || 'Fornecedor',
      purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
      totalAmountCents,
      category: purchaseCategory,
      status: 'pending_validation',
      paymentStatus: 'open',
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      propertyId: propertyId || undefined,
      notes: 'Compra cadastrada via painel de compras.',
      items: [
        {
          productId: `prod-${Date.now()}`,
          productName,
          quantity: qty,
          unit: itemUnit,
          unitPriceCents: unitPriceCents || Math.round(totalAmountCents / qty),
          totalCents: totalAmountCents,
          purchaseCategory,
          deliveredQuantity: 0,
        },
      ],
    });

    setIsNewPurchaseModalOpen(false);
  };

  return (
    <div className="content-container">
      {/* Cabeçalho */}
      <div className="view-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="view-title">Compras & Fornecedores</h1>
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
              Taxonomia Canônica • Seção 7
            </span>
          </div>
          <p className="view-subtitle">
            Dois caminhos complementares de acesso: consulte por contraparte fornecedora ou por natureza do insumo (defensivos, sementes, fertilizantes, peças e frotas).
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsNewPurchaseModalOpen(true)}>
          <Plus size={18} strokeWidth={2.5} />
          <span>Nova Compra</span>
        </button>
      </div>

      {/* Cards de Resumo Gerencial de Compras */}
      <div className="kpi-grid" style={{ marginBottom: '24px' }}>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Comprado (Safra)</span>
            <div className="kpi-icon-box" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--primary)' }}>
              <ShoppingCart size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: 'var(--primary-dark)' }}>
            {formatCurrencyBRL(totalPurchasesCents)}
          </div>
          <div className="kpi-subtext">{purchases.length} ordens de compra emitidas</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Defensivos Químicos</span>
            <div className="kpi-icon-box" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              <Boxes size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#1E40AF' }}>
            {formatCurrencyBRL(totalDefensivosCents)}
          </div>
          <div className="kpi-subtext">Fungicidas, Herbicidas e Inseticidas</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Entregas Pendentes (Saldo)</span>
            <div className="kpi-icon-box" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <Truck size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#D97706' }}>
            {purchases.filter((p) => p.status === 'partial_delivered').length} Pedidos
          </div>
          <div className="kpi-subtext">Insumos ainda custodiados no fornecedor</div>
        </div>
      </div>

      {/* Categorias Canônicas de Compra (Filtro Horizontal LSA) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '18px',
          scrollbarWidth: 'thin',
        }}
      >
        <button
          className={`tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
          style={{ whiteSpace: 'nowrap' }}
        >
          Todas as Compras
        </button>
        {PURCHASE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
            style={{ whiteSpace: 'nowrap' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lista de Ordens de Compra */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredPurchases.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-subtle)' }}>
            Nenhuma compra encontrada para esta categoria.
          </div>
        ) : (
          filteredPurchases.map((pur) => {
            const fiscalDoc = documents.find((d) => d.id === pur.fiscalDocumentId);

            return (
              <div
                key={pur.id}
                className="card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ShoppingCart size={20} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                          {pur.supplierName}
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
                          {pur.orderNumber}
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
                          {pur.category}
                        </span>
                        {pur.invoiceNumber && (
                          <span
                            style={{
                              backgroundColor: '#EFF6FF',
                              color: '#1E40AF',
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '12px',
                            }}
                          >
                            {pur.invoiceNumber}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginTop: '4px' }}>
                        Data da Compra: {formatDateBR(pur.purchaseDate)} • Total:{' '}
                        <strong style={{ color: 'var(--primary-dark)' }}>
                          {formatCurrencyBRL(pur.totalAmountCents)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {fiscalDoc && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setPreviewFile(fiscalDoc)}
                        title="Ver Nota Fiscal Digitalizada"
                      >
                        <Eye size={14} />
                        <span>Ver NF</span>
                      </button>
                    )}
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor:
                          pur.status === 'delivered'
                            ? '#DCFCE7'
                            : pur.status === 'partial_delivered'
                            ? '#FEF3C7'
                            : '#EFF6FF',
                        color:
                          pur.status === 'delivered'
                            ? '#166534'
                            : pur.status === 'partial_delivered'
                            ? '#92400E'
                            : '#1E40AF',
                      }}
                    >
                      {pur.status === 'delivered'
                        ? '100% Entregue'
                        : pur.status === 'partial_delivered'
                        ? 'Entrega Parcial / Saldo no Fornecedor'
                        : 'Aguardando Entrega'}
                    </span>
                  </div>
                </div>

                {/* Tabela de Itens e Controle de Saldo no Fornecedor */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    padding: '12px 16px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: 'var(--text-subtle)',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}
                  >
                    Itens da Compra & Cumprimento Físico (Entregas e Retiradas)
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {pur.items.map((item, idx) => {
                      const remaining = Math.max(0, item.quantity - item.deliveredQuantity);
                      const isComplete = remaining === 0;

                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '13px',
                            padding: '8px 0',
                            borderBottom: idx < pur.items.length - 1 ? '1px dashed #E2E8F0' : 'none',
                            flexWrap: 'wrap',
                            gap: '8px',
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                              {item.productName}
                            </span>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                              {item.quantity} {item.unit} @ {formatCurrencyBRL(item.unitPriceCents)} • Total:{' '}
                              {formatCurrencyBRL(item.totalCents)}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ textAlign: 'right', fontSize: '12px' }}>
                              <div>
                                Entregue na Fazenda:{' '}
                                <strong style={{ color: '#16A34A' }}>
                                  {item.deliveredQuantity} {item.unit}
                                </strong>
                              </div>
                              {!isComplete && (
                                <div style={{ color: '#D97706', fontWeight: 600 }}>
                                  Saldo retido no Fornecedor: {remaining} {item.unit}
                                </div>
                              )}
                            </div>

                            {!isComplete && (
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleOpenDeliveryModal(pur, item)}
                                title="Registrar chegada ou retirada física do insumo"
                              >
                                <PackageCheck size={14} />
                                <span>Registrar Retirada</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Registrar Entrega / Retirada (Atualiza Estoque e Saldo Fornecedor) */}
      {isDeliveryModalOpen && selectedDeliveryItem && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Registrar Entrega / Retirada Física</h3>
              <button className="btn-icon" onClick={() => setIsDeliveryModalOpen(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleConfirmDelivery}>
              <div className="modal-body">
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Produto: <strong>{selectedDeliveryItem.productName}</strong>
                  <br />
                  Saldo atual no fornecedor: <strong>{selectedDeliveryItem.remaining} {selectedDeliveryItem.unit}</strong>
                </p>

                <div className="form-group">
                  <label className="form-label">
                    Quantidade Entregue / Retirada ({selectedDeliveryItem.unit})
                  </label>
                  <input
                    type="number"
                    step="any"
                    max={selectedDeliveryItem.remaining}
                    className="form-input"
                    value={deliveryQty}
                    onChange={(e) => setDeliveryQty(e.target.value)}
                    required
                  />
                  <div style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '4px' }}>
                    Ao confirmar, esta quantidade será debitada do saldo no fornecedor e creditada no Estoque Físico da fazenda.
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsDeliveryModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirmar Entrada no Estoque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nova Compra */}
      {isNewPurchaseModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Cadastrar Ordem de Compra</h3>
              <button className="btn-icon" onClick={() => setIsNewPurchaseModalOpen(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleCreatePurchase}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Fornecedor</label>
                    <select
                      className="form-select"
                      value={supplierPartyId}
                      onChange={(e) => setSupplierPartyId(e.target.value)}
                      required
                    >
                      <option value="">Selecione...</option>
                      {parties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Categoria Canônica</label>
                    <select
                      className="form-select"
                      value={purchaseCategory}
                      onChange={(e) => setPurchaseCategory(e.target.value as any)}
                    >
                      {PURCHASE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Produto / Insumo</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Fungicida Elatus Syngenta 5L"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Quantidade</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      value={itemQuantityStr}
                      onChange={(e) => setItemQuantityStr(e.target.value)}
                      placeholder="1"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unidade</label>
                    <input
                      type="text"
                      className="form-input"
                      value={itemUnit}
                      onChange={(e) => setItemUnit(e.target.value)}
                      placeholder="Litros, Sacas, Ton"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Valor Total (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={totalAmountStr}
                      onChange={(e) => setTotalAmountStr(e.target.value)}
                      placeholder="0,00"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Data da Compra</label>
                    <input
                      type="date"
                      className="form-input"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Propriedade de Destino</label>
                    <select
                      className="form-select"
                      value={propertyId}
                      onChange={(e) => setPropertyId(e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsNewPurchaseModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Registrar Ordem de Compra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
