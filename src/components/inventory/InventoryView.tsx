import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Boxes,
  Warehouse,
  Truck,
  Building2,
  AlertTriangle,
  ArrowRightLeft,
  Calendar,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Package,
} from 'lucide-react';
import { formatDateBR } from '../../utils/formatters';

export const InventoryView: React.FC = () => {
  const { inventory, properties, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'insumos' | 'producao'>('all');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');

  const filteredInventory = inventory.filter((item) => {
    if (activeTab === 'insumos' && item.category === 'Produção Armazenada') return false;
    if (activeTab === 'producao' && item.category !== 'Produção Armazenada') return false;
    if (selectedPropertyId !== 'all' && item.propertyId !== selectedPropertyId) return false;
    return true;
  });

  // Totais
  const totalInsumosItens = inventory.filter((i) => i.category !== 'Produção Armazenada').length;
  const totalProducaoSacas = inventory
    .filter((i) => i.category === 'Produção Armazenada')
    .reduce((acc, i) => acc + i.physicalStock + i.supplierStock, 0);

  return (
    <div className="content-container">
      {/* Cabeçalho */}
      <div className="view-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="view-title">Estoques & Saldos</h1>
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
              Físico vs Fornecedor • ADR-06
            </span>
          </div>
          <p className="view-subtitle">
            Gestão precisa de estoques rurais: diferencie o que já está depositado fisicamente no barracão da fazenda do saldo ainda custodiado no fornecedor ou em silos de terceiros.
          </p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="kpi-grid" style={{ marginBottom: '24px' }}>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Insumos em Estoque</span>
            <div className="kpi-icon-box" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--primary)' }}>
              <Boxes size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: 'var(--primary-dark)' }}>
            {totalInsumosItens} Tipos de Insumo
          </div>
          <div className="kpi-subtext">Defensivos, fertilizantes e sementes</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Produção Armazenada Total</span>
            <div className="kpi-icon-box" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              <Warehouse size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#1E40AF' }}>
            {totalProducaoSacas.toLocaleString('pt-BR')} Sacas
          </div>
          <div className="kpi-subtext">Silos próprios e armazéns gerais</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Saldos Retidos no Fornecedor</span>
            <div className="kpi-icon-box" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <Truck size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#D97706' }}>
            Ativo Operacional
          </div>
          <div className="kpi-subtext">Retirada sob demanda de plantio</div>
        </div>
      </div>

      {/* Filtros */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div className="tabs-container" style={{ margin: 0 }}>
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Todos os Estoques ({inventory.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'insumos' ? 'active' : ''}`}
            onClick={() => setActiveTab('insumos')}
          >
            Insumos Agrícolas ({totalInsumosItens})
          </button>
          <button
            className={`tab-btn ${activeTab === 'producao' ? 'active' : ''}`}
            onClick={() => setActiveTab('producao')}
          >
            Produção em Silo / Armazém
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={16} color="var(--primary)" />
          <select
            className="form-select"
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            style={{ minWidth: '180px' }}
          >
            <option value="all">Todas as Propriedades</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Itens de Estoque */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
        {filteredInventory.map((item) => {
          const isProducao = item.category === 'Produção Armazenada';
          const totalStock = item.physicalStock + item.supplierStock;
          const isBelowThreshold = item.physicalStock <= item.minAlertThreshold;

          return (
            <div
              key={item.id}
              className="card"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: isProducao ? '3px solid #2563EB' : '3px solid #16A34A',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: isProducao ? '#2563EB' : 'var(--primary)',
                      backgroundColor: isProducao ? '#EFF6FF' : 'var(--bg-tertiary)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}
                  >
                    {item.category}
                  </span>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                    {item.propertyName}
                  </span>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 14px 0' }}>
                  {item.productName}
                </h3>

                {/* Comparativo: Físico vs Fornecedor */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    padding: '12px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '14px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-subtle)', fontWeight: 600 }}>
                      {isProducao ? 'SILOS PRÓPRIOS' : 'ESTOQUE FÍSICO'}
                    </div>
                    <div style={{ fontSize: '17px', fontWeight: 800, color: '#166534', marginTop: '2px' }}>
                      {item.physicalStock.toLocaleString('pt-BR')} {item.unit}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#4B5563', marginTop: '2px' }}>
                      {isProducao ? 'Na sede da fazenda' : 'Disponível no barracão'}
                    </div>
                  </div>

                  <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-subtle)', fontWeight: 600 }}>
                      {isProducao ? 'ARMAZÉM TERCEIROS' : 'SALDO NO FORNECEDOR'}
                    </div>
                    <div style={{ fontSize: '17px', fontWeight: 800, color: '#B45309', marginTop: '2px' }}>
                      {item.supplierStock.toLocaleString('pt-BR')} {item.unit}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#4B5563', marginTop: '2px' }}>
                      {isProducao ? 'Cargill / Bunge' : 'Custodiado p/ retirada'}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11.5px',
                  color: 'var(--text-subtle)',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '10px',
                }}
              >
                <span>Último movimento: {formatDateBR(item.lastMovementDate)}</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                  Total: {totalStock.toLocaleString('pt-BR')} {item.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
