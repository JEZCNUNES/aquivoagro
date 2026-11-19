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
  ShieldCheck,
  FileSignature,
  Layers,
  Leaf,
  ReceiptText,
  Eye,
} from 'lucide-react';
import { formatCurrency, formatDate, formatCurrencyBRL, formatDateBR } from '../../utils/formatters';
import { PropertyModal } from './PropertyModal';
import { StatusBadge } from '../common/Badge';

type PropertyCategoryFilter = 'all' | 'propria' | 'arrendada' | 'parceria';
type DossierSubTab =
  | 'overview'
  | 'cadastro'
  | 'fundiario'
  | 'ambiental'
  | 'fiscal'
  | 'contratos'
  | 'financeiro'
  | 'patrimonio'
  | 'documentos';

export const PropertiesView: React.FC = () => {
  const {
    properties,
    equipment,
    documents,
    transactions,
    contracts,
    activePropertyDetailId,
    setActivePropertyDetailId,
    setViewingDocument,
    setPreviewFile,
    setActiveEquipmentDetailId,
    setActiveTab,
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<PropertyCategoryFilter>('all');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProp, setEditingProp] = useState<Property | null>(null);
  const [dossierTab, setDossierTab] = useState<DossierSubTab>('overview');

  // Filtro de propriedades por regime de posse/uso (Seção 6)
  const filteredProperties = properties.filter((p) => {
    if (categoryFilter === 'propria') return p.useType === 'propria' || (!p.useType && p.id !== 'prop-3');
    if (categoryFilter === 'arrendada') return p.useType === 'arrendada' || p.id === 'prop-3';
    if (categoryFilter === 'parceria') return p.useType === 'parceria';
    return true;
  });

  // Propriedade selecionada para o Dossiê
  const activeProp = useMemo(() => {
    if (activePropertyDetailId) {
      return properties.find((p) => p.id === activePropertyDetailId) || filteredProperties[0] || properties[0];
    }
    return filteredProperties[0] || properties[0];
  }, [activePropertyDetailId, properties, filteredProperties]);

  // Contratos vinculados à propriedade
  const propertyContracts = contracts.filter(
    (c) => c.primaryContext.id === activeProp?.id || c.title.toLowerCase().includes(activeProp?.name.toLowerCase() || '')
  );

  // Documentos categorizados da propriedade
  const propDocs = documents.filter((d) => d.propertyId === activeProp?.id && d.status !== 'archived');
  const fundiarioDocs = propDocs.filter(
    (d) => d.propertySubtype === 'Matrícula' || d.propertySubtype === 'Escritura' || d.propertySubtype === 'CCIR'
  );
  const ambientalDocs = propDocs.filter((d) => d.propertySubtype === 'CAR' || d.tags.includes('Ambiental'));
  const fiscalDocs = propDocs.filter((d) => d.propertySubtype === 'ITR' || d.category === 'Notas fiscais de compras');
  const propEquipment = equipment.filter((e) => e.propertyId === activeProp?.id);

  // Cálculos financeiros da propriedade
  const propTxs = transactions.filter((t) => t.propertyId === activeProp?.id);
  let totalIncome = 0;
  let totalExpense = 0;
  propTxs.forEach((t) => {
    if (t.status === 'paid') {
      if (t.type === 'income') totalIncome += t.amountCents;
      if (t.type === 'expense') totalExpense += t.amountCents;
    }
  });

  return (
    <div className="content-container">
      {/* Cabeçalho */}
      <div className="view-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="view-title">Propriedades Rurais</h1>
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
              Domínio Canônico • Seção 6
            </span>
          </div>
          <p className="view-subtitle">
            Estrutura fundiária do produtor: áreas próprias, arrendadas e em parceria. Consulte matrículas, CAR, contratos e custos gerenciais alocados.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProp(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={18} /> Cadastrar Propriedade
        </button>
      </div>

      {/* Filtro por Regime de Uso (Seção 6 da Taxonomia) */}
      <div className="tabs-container" style={{ marginBottom: '18px' }}>
        <button
          className={`tab-btn ${categoryFilter === 'all' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('all')}
        >
          Todas as Áreas ({properties.length})
        </button>
        <button
          className={`tab-btn ${categoryFilter === 'propria' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('propria')}
        >
          Áreas Próprias ({properties.filter((p) => p.id !== 'prop-3').length})
        </button>
        <button
          className={`tab-btn ${categoryFilter === 'arrendada' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('arrendada')}
        >
          Áreas Arrendadas (Fazenda Santa Cecília)
        </button>
        <button
          className={`tab-btn ${categoryFilter === 'parceria' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('parceria')}
        >
          Áreas em Parceria
        </button>
      </div>

      {/* Cartões Seletores de Propriedade */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {filteredProperties.map((prop) => {
          const isSelected = activeProp?.id === prop.id;
          const eqCount = equipment.filter((e) => e.propertyId === prop.id).length;
          const docCount = documents.filter((d) => d.propertyId === prop.id && d.status !== 'archived').length;
          const isArrendada = prop.useType === 'arrendada' || prop.id === 'prop-3';

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>
                        {prop.name}
                      </h3>
                      {isArrendada && (
                        <span
                          style={{
                            backgroundColor: '#FEF3C7',
                            color: '#92400E',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          Arrendada
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
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

      {/* Dossiê Completo da Propriedade Selecionada (Seção 6.1) */}
      {activeProp && (
        <div className="card" style={{ padding: '24px' }}>
          {/* Header do Dossiê */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '16px',
              marginBottom: '16px',
            }}
          >
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                Dossiê da Propriedade (10 Coleções Integradas)
              </span>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary-dark)', margin: '2px 0 0 0' }}>
                {activeProp.name}
              </h2>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {activeProp.city} - {activeProp.state} • {activeProp.areaHectares.toLocaleString('pt-BR')} ha • {activeProp.responsible}
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

          {/* Sub-Navegação Contextual do Dossiê (Coleções Canônicas da Seção 6.1) */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '8px',
              marginBottom: '20px',
              borderBottom: '1px solid var(--border-light)',
            }}
          >
            <button
              className={`tab-btn ${dossierTab === 'overview' ? 'active' : ''}`}
              onClick={() => setDossierTab('overview')}
            >
              Visão Geral
            </button>
            <button
              className={`tab-btn ${dossierTab === 'fundiario' ? 'active' : ''}`}
              onClick={() => setDossierTab('fundiario')}
            >
              Fundiário / Registral ({fundiarioDocs.length})
            </button>
            <button
              className={`tab-btn ${dossierTab === 'ambiental' ? 'active' : ''}`}
              onClick={() => setDossierTab('ambiental')}
            >
              Ambiental (CAR / Licenças) ({ambientalDocs.length})
            </button>
            <button
              className={`tab-btn ${dossierTab === 'fiscal' ? 'active' : ''}`}
              onClick={() => setDossierTab('fiscal')}
            >
              Fiscal Rural (ITR / Guias) ({fiscalDocs.length})
            </button>
            <button
              className={`tab-btn ${dossierTab === 'contratos' ? 'active' : ''}`}
              onClick={() => setDossierTab('contratos')}
            >
              Contratos da Propriedade ({propertyContracts.length})
            </button>
            <button
              className={`tab-btn ${dossierTab === 'financeiro' ? 'active' : ''}`}
              onClick={() => setDossierTab('financeiro')}
            >
              Financeiro Vinculado
            </button>
            <button
              className={`tab-btn ${dossierTab === 'patrimonio' ? 'active' : ''}`}
              onClick={() => setDossierTab('patrimonio')}
            >
              Patrimônio Vinculado ({propEquipment.length})
            </button>
            <button
              className={`tab-btn ${dossierTab === 'documentos' ? 'active' : ''}`}
              onClick={() => setDossierTab('documentos')}
            >
              Todos os Documentos ({propDocs.length})
            </button>
          </div>

          {/* Conteúdo Dinâmico da Sub-Aba Selecionada */}
          {dossierTab === 'overview' && (
            <div>
              {/* Resumo Financeiro da Fazenda */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '14px',
                  marginBottom: '24px',
                }}
              >
                <div className="kpi-card">
                  <span className="kpi-label">Receitas Recebidas</span>
                  <div className="kpi-value" style={{ fontSize: '20px', color: '#16A34A' }}>
                    {formatCurrency(totalIncome)}
                  </div>
                  <div className="kpi-footer">Vendas vinculadas à fazenda</div>
                </div>

                <div className="kpi-card">
                  <span className="kpi-label">Despesas Pagas</span>
                  <div className="kpi-value" style={{ fontSize: '20px', color: '#DC2626' }}>
                    {formatCurrency(totalExpense)}
                  </div>
                  <div className="kpi-footer">Custos operacionais e insumos</div>
                </div>

                <div className="kpi-card highlight">
                  <span className="kpi-label">Resultado Financeiro</span>
                  <div
                    className="kpi-value"
                    style={{ fontSize: '20px', color: totalIncome - totalExpense >= 0 ? '#16A34A' : '#DC2626' }}
                  >
                    {formatCurrency(totalIncome - totalExpense)}
                  </div>
                  <div className="kpi-footer">Receitas menos despesas</div>
                </div>
              </div>

              {/* Informações de Cadastro & Uso */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  border: '1px solid var(--border-color)',
                  marginBottom: '20px',
                }}
              >
                <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-subtle)', marginBottom: '8px' }}>
                  Identificação Registral & Observações
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Matrícula CRI:</span>{' '}
                    <strong>{activeProp.matriculaNumber || 'Matrícula nº 38.102 CRI Sorriso'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Cadastro Ambiental (CAR):</span>{' '}
                    <strong>{activeProp.carRegistration || 'MT-5107925-CAR-ATIVO'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Código CCIR/INCRA:</span>{' '}
                    <strong>{activeProp.ccirCode || '950.082.114.290-8'}</strong>
                  </div>
                </div>
                {activeProp.notes && (
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '10px', fontStyle: 'italic', margin: '10px 0 0 0' }}>
                    {activeProp.notes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Sub-Aba: Contratos da Propriedade (Arrendamento, Parceria, Aditivos) */}
          {dossierTab === 'contratos' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>
                  Contratos Vinculados a {activeProp.name}
                </h3>
                <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('contracts')}>
                  <span>Ver na Central de Contratos</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {propertyContracts.length === 0 ? (
                <div className="card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-subtle)' }}>
                  Nenhum contrato formal de arrendamento ou parceria registrado para esta propriedade.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {propertyContracts.map((ctr) => (
                    <div
                      key={ctr.id}
                      className="card"
                      style={{
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '14px',
                        borderLeft: '4px solid #16A34A',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ fontSize: '14.5px', fontWeight: 700, margin: 0 }}>{ctr.title}</h4>
                          <span
                            style={{
                              backgroundColor: 'var(--bg-tertiary)',
                              color: 'var(--primary-dark)',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '12px',
                            }}
                          >
                            {ctr.contractType.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginTop: '4px' }}>
                          Ref: {ctr.numberRef} • Vigência: {formatDateBR(ctr.startDate)} até <strong>{formatDateBR(ctr.endDate)}</strong>
                          {ctr.amountCents ? ` • Valor: ${formatCurrencyBRL(ctr.amountCents)}` : ''}
                        </div>
                        {ctr.renewalRule && (
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
                            {ctr.renewalRule}
                          </div>
                        )}
                      </div>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setActiveTab('contracts')}
                      >
                        <span>Abrir Instrumento</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub-Aba: Documentos Fundiários (Matrículas, Escrituras, CCIR) */}
          {dossierTab === 'fundiario' && (
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '12px' }}>
                Acervo Fundiário e Registral (Matrículas, CCIR, INCRA)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {fundiarioDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setViewingDocument(doc)}
                    style={{
                      padding: '12px 16px',
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
                      <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{doc.title}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                        {doc.propertySubtype} • Emissão: {formatDate(doc.issueDate)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewFile(doc);
                        }}
                      >
                        <Eye size={14} /> Prévia
                      </button>
                      <StatusBadge status={doc.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-Aba: Documentos Ambientais (CAR) */}
          {dossierTab === 'ambiental' && (
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '12px' }}>
                Documentação e Regularidade Ambiental (CAR / Licenças)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ambientalDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setViewingDocument(doc)}
                    style={{
                      padding: '12px 16px',
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
                      <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{doc.title}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                        Inscrição: {doc.tags.join(', ')} • Validade: {doc.expirationDate ? formatDateBR(doc.expirationDate) : 'Indeterminada'}
                      </div>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewFile(doc);
                      }}
                    >
                      <Eye size={14} /> Ver CAR
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-Aba: Todos os Documentos */}
          {(dossierTab === 'documentos' || dossierTab === 'fiscal') && (
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '12px' }}>
                Documentos Associados à Fazenda ({dossierTab === 'fiscal' ? fiscalDocs.length : propDocs.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(dossierTab === 'fiscal' ? fiscalDocs : propDocs).map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setViewingDocument(doc)}
                    style={{
                      padding: '12px 16px',
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
                      <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{doc.title}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                        {doc.category} {doc.propertySubtype ? `• ${doc.propertySubtype}` : ''} • {formatDate(doc.issueDate)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewFile(doc);
                        }}
                      >
                        <Eye size={14} />
                      </button>
                      <StatusBadge status={doc.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-Aba: Patrimônio Vinculado */}
          {dossierTab === 'patrimonio' && (
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '12px' }}>
                Máquinas e Frotas Alocadas nesta Propriedade ({propEquipment.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {propEquipment.map((eq) => (
                  <div
                    key={eq.id}
                    onClick={() => {
                      setActiveTab('equipment');
                      setActiveEquipmentDetailId(eq.id);
                    }}
                    className="card"
                    style={{ padding: '14px', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Tractor size={20} color="var(--primary)" />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13.5px' }}>{eq.name}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                          {eq.brand} • Série: {eq.plateOrSerial}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
