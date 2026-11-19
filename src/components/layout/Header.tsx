import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Bell,
  Plus,
  Menu,
  Building2,
  ChevronDown,
  User,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  onOpenSearch,
}) => {
  const {
    activeTab,
    setActiveTab,
    properties,
    selectedPropertyId,
    setSelectedPropertyId,
    notifications,
    setIsNotificationsDrawerOpen,
    setIsAddDocModalOpen,
    globalSearchQuery,
    setGlobalSearchQuery,
    reliabilityMetrics,
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const activeNotificationsCount = notifications.length;

  // Atalho de teclado global Ctrl+K / Cmd+K para busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  // Rótulo amigável da aba atual para o Breadcrumb
  const tabLabels: Record<string, string> = {
    overview: 'Visão Geral / Painel do Produtor',
    inbox: 'Caixa de Entrada Operacional',
    pendencies: 'Fila de Pendências',
    deadlines: 'Central de Vencimentos',
    tasks: 'Agenda & Tarefas Administrativas',
    parties: 'Cliente & Pessoas',
    properties: 'Propriedades Rurais',
    equipment: 'Patrimônio & Infraestrutura',
    purchases: 'Compras & Fornecedores',
    inventory: 'Estoques & Saldos',
    commercial: 'Comercialização da Safra',
    financial: 'Financeiro & Crédito Rural',
    fiscal: 'Fiscal & Contábil',
    insurance: 'Seguros Rurais & Patrimoniais',
    documents: 'Central de Documentos',
    contracts: 'Central de Contratos Transversal',
    reports: 'Relatórios & Confiabilidade',
    settings: 'Auditoria & Configurações',
  };

  const selectedProp = properties.find((p) => p.id === selectedPropertyId);

  return (
    <header className="top-header" style={{ height: '70px', padding: '0 24px', borderBottom: '1px solid var(--border-color)', backgroundColor: '#FFFFFF' }}>
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        <button
          onClick={onToggleMobileMenu}
          className="btn-icon-round"
          style={{ display: 'none' }}
          id="mobile-menu-btn"
          aria-label="Abrir menu lateral"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb Contextual (LSA UX) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <span
            onClick={() => setActiveTab('overview')}
            style={{ fontWeight: 600, color: 'var(--primary-dark)', cursor: 'pointer' }}
          >
            LSA Agro
          </span>
          <ChevronRight size={14} color="var(--text-light)" />
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
            {tabLabels[activeTab] || 'Visão Geral'}
          </span>
          {selectedProp && (
            <>
              <ChevronRight size={14} color="var(--text-light)" />
              <span
                style={{
                  backgroundColor: 'var(--primary-subtle)',
                  color: 'var(--primary-dark)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '11.5px',
                  border: '1px solid var(--primary-border)',
                }}
              >
                {selectedProp.name}
              </span>
            </>
          )}
        </div>

        {/* Campo de Busca Global com atalho visual */}
        <div
          className="global-search-container"
          onClick={onOpenSearch}
          style={{ maxWidth: '420px', marginLeft: 'auto', marginRight: '12px' }}
        >
          <Search size={17} className="search-icon-pos" color="var(--primary)" />
          <input
            type="text"
            className="global-search-input"
            placeholder="Buscar fazenda, trator, contrato, NF, safra..."
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            onFocus={onOpenSearch}
          />
          <kbd
            style={{
              padding: '2px 6px',
              fontSize: '10.5px',
              fontWeight: 700,
              backgroundColor: '#F3F4F6',
              border: '1px solid #E5E7EB',
              borderRadius: '4px',
              color: '#6B7280',
              marginRight: '8px',
            }}
          >
            Ctrl+K
          </kbd>
        </div>
      </div>

      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Seletor de Propriedade */}
        <div className="property-selector-wrapper" title="Filtrar contexto por propriedade">
          <Building2 size={16} color="var(--primary)" />
          <select
            className="property-selector-select"
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
          >
            <option value="all">Todas as propriedades</option>
            {properties.map((prop) => (
              <option key={prop.id} value={prop.id}>
                {prop.name} ({prop.city} - {prop.state})
              </option>
            ))}
          </select>
        </div>

        {/* Central de Notificações */}
        <button
          className="btn-icon-round"
          onClick={() => setIsNotificationsDrawerOpen(true)}
          title="Notificações e pendências"
          aria-label="Notificações"
          style={{ position: 'relative' }}
        >
          <Bell size={19} />
          {activeNotificationsCount > 0 && (
            <span className="notification-badge-dot" />
          )}
        </button>

        {/* Botão em destaque: Adicionar Documento / Fluxo do Operador */}
        <button
          className="btn btn-primary"
          onClick={() => setIsAddDocModalOpen(true)}
          id="btn-add-document-top"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 16px',
            fontWeight: 600,
            borderRadius: 'var(--radius-md)',
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Novo Documento</span>
        </button>

        {/* Perfil do Operador / Produtor */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px 4px 6px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '13px',
              }}
            >
              <User size={16} />
            </div>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
                Roberto Mendonça
              </span>
              <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>
                Produtor • LSA Backoffice
              </span>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {isProfileOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '46px',
                width: '280px',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-modal)',
                border: '1px solid var(--border-color)',
                padding: '16px',
                zIndex: 45,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary-dark)', marginBottom: '4px' }}>
                Organização Rural LSA
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Grupo Agrícola Mendonça & Associados
              </div>

              <div
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11.5px',
                  color: 'var(--primary-dark)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                  <ShieldCheck size={14} color="var(--primary)" />
                  Porta de Qualidade: {reliabilityMetrics.overallScore}%
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {reliabilityMetrics.validatedPercentage}% dos documentos validados
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => {
                    setActiveTab('inbox');
                    setIsProfileOpen(false);
                  }}
                >
                  Abrir Caixa de Entrada
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setIsProfileOpen(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
