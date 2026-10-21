import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Property } from '../../types';
import {
  Building2,
  Plus,
  MapPin,
  Tractor,
  FileText,
  DollarSign,
  Edit2,
  Calendar,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PropertyModal } from './PropertyModal';
import { StatusBadge } from '../common/Badge';

export const PropertiesView: React.FC = () => {
  const {
    properties,
    equipment,
    documents,
    transactions,
    activePropertyDetailId,
    setActivePropertyDetailId,
    setViewingDocument,
    setActiveEquipmentDetailId,
    setActiveTab,
  } = useApp();

  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProp, setEditingProp] = useState<Property | null>(null);

  // Propriedade selecionada para visualização detalhada (se houver)
  const activeProp = useMemo(() => {
    if (activePropertyDetailId) {
      return properties.find((p) => p.id === activePropertyDetailId) || properties[0];
    }
    return properties[0];
  }, [activePropertyDetailId, properties]);

  // Cálculos da propriedade ativa
  const propStats = useMemo(() => {
    if (!activeProp) return null;

    let pDocs = documents.filter((d) => d.propertyId === activeProp.id && d.status !== 'archived');
    let pTxs = transactions.filter((t) => t.propertyId === activeProp.id);

    if (selectedCrop !== 'all') {
      pDocs = pDocs.filter((d) => d.cropSeason === selectedCrop);
      pTxs = pTxs.filter((t) => t.cropSeason === selectedCrop);
    }

    const pEq = equipment.filter((e) => e.propertyId === activeProp.id);

    let totalIncome = 0;
    let totalExpense = 0;
    pTxs.forEach((t) => {
      if (t.status === 'paid') {
        if (t.type === 'income') totalIncome += t.amountCents;
        if (t.type === 'expense') totalExpense += t.amountCents;
      }
    });

    const categoryBreakdown: Record<string, number> = {};
    pTxs
      .filter((t) => t.type === 'expense' && t.status === 'paid')
      .forEach((t) => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amountCents;
      });

    const pendingDocs = pDocs.filter((d) => d.status === 'pending');

    return {
      docs: pDocs,
      equipment: pEq,
      totalIncome,
      totalExpense,
      netResult: totalIncome - totalExpense,
      categoryBreakdown: Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]),
      pendingDocs,
    };
  }, [activeProp, selectedCrop, documents, transactions, equipment]);

  return (
    <div className="content-container">
      {/* Cabeçalho */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestão de Propriedades Rurais</h1>
          <p className="page-description">
            Cadastre fazendas, gerencie escrituras, certidões fundiárias (CAR, CCIR, ITR) e acompanhe os custos por propriedade.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProp(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={18} /> Cadastrar propriedade
        </button>
      </div>

      {/* Cartões Seletor de Propriedades */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {properties.map((prop) => {
          const isSelected = activeProp?.id === prop.id;
          const eqCount = equipment.filter((e) => e.propertyId === prop.id).length;
          const docCount = documents.filter((d) => d.propertyId === prop.id && d.status !== 'archived').length;

          return (
            <div
              key={prop.id}
              onClick={() => setActivePropertyDetailId(prop.id)}
              className="card"
              style={{
                cursor: 'pointer',
                borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                backgroundColor: isSelected ? 'var(--bg-tertiary)' : '#FFFFFF',
                boxShadow: isSelected ? '0 4px 14px rgba(22, 163, 74, 0.15)' : 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? '#16A34A' : 'var(--bg-secondary)',
                      color: isSelected ? '#FFFFFF' : 'var(--primary-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Building2 size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-dark)' }}>
                      {prop.name}
                    </h3>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      {prop.city} - {prop.state} • {prop.areaHectares.toLocaleString('pt-BR')} ha
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingProp(prop);
                    setIsModalOpen(true);
                  }}
                  className="btn-icon-round"
                  style={{ width: '30px', height: '30px' }}
                  title="Editar propriedade"
                >
                  <Edit2 size={13} />
                </button>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginTop: '8px' }}>
                Culturas: <strong>{prop.mainCrops.join(', ')}</strong> • Resp: {prop.responsible}
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '10px',
                  marginTop: '12px',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                }}
              >
                <span>🚜 {eqCount} máquina(s)</span>
                <span>•</span>
                <span>📄 {docCount} documento(s)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dossiê da Propriedade Selecionada */}
      {activeProp && propStats && (
        <div className="card" style={{ padding: '28px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '18px',
              marginBottom: '20px',
            }}
          >
            <div>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                Dossiê da Propriedade
              </span>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--primary-dark)' }}>
                {activeProp.name}
              </h2>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {activeProp.city} - {activeProp.state} • Área: {activeProp.areaHectares.toLocaleString('pt-BR')} hectares • Responsável: {activeProp.responsible}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Filtro de Safra:
              </span>
              <select
                className="form-select"
                style={{ height: '36px', fontSize: '13px' }}
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
              >
                <option value="all">Todas as Safras</option>
                <option value="Safra 2026/2027">Safra 2026/2027</option>
                <option value="Safra 2025/2026">Safra 2025/2026</option>
              </select>
            </div>
          </div>

          {/* Resumo Financeiro da Fazenda */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              marginBottom: '28px',
            }}
          >
            <div className="kpi-card">
              <span className="kpi-label">Receitas Recebidas</span>
              <div className="kpi-value" style={{ fontSize: '20px', color: '#16A34A' }}>
                {formatCurrency(propStats.totalIncome)}
              </div>
              <div className="kpi-footer">Vendas vinculadas à fazenda</div>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">Despesas Pagas</span>
              <div className="kpi-value" style={{ fontSize: '20px', color: '#DC2626' }}>
                {formatCurrency(propStats.totalExpense)}
              </div>
              <div className="kpi-footer">Custos operacionais e insumos</div>
            </div>

            <div className="kpi-card highlight">
              <span className="kpi-label">Resultado Financeiro</span>
              <div
                className="kpi-value"
                style={{ fontSize: '20px', color: propStats.netResult >= 0 ? '#16A34A' : '#DC2626' }}
              >
                {formatCurrency(propStats.netResult)}
              </div>
              <div className="kpi-footer">Receitas menos despesas</div>
            </div>
          </div>

          {/* Grid com Documentos e Máquinas */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Documentos Fundiários e Cadastrais */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '12px' }}>
                Documentos e Certidões ({propStats.docs.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {propStats.docs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setViewingDocument(doc)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-main)' }}>
                        {doc.title}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                        {doc.category} {doc.propertySubtype ? `• ${doc.propertySubtype}` : ''} • {formatDate(doc.issueDate)}
                      </div>
                    </div>
                    <StatusBadge status={doc.status} />
                  </div>
                ))}
              </div>
            </div>

            {/* Máquinas Alocadas nesta Fazenda */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '12px' }}>
                Máquinas e Veículos Vinculados ({propStats.equipment.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {propStats.equipment.map((eq) => (
                  <div
                    key={eq.id}
                    onClick={() => {
                      setActiveTab('equipment');
                      setActiveEquipmentDetailId(eq.id);
                    }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Tractor size={18} color="var(--primary)" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-main)' }}>
                          {eq.name}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                          {eq.brand} • {eq.model} • Série: {eq.plateOrSerial}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} color="var(--text-subtle)" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Propriedade */}
      <PropertyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        propertyToEdit={editingProp}
      />
    </div>
  );
};
