import React, { useState } from 'react';
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
    properties,
    selectedPropertyId,
    setSelectedPropertyId,
    notifications,
    setIsNotificationsDrawerOpen,
    setIsAddDocModalOpen,
    globalSearchQuery,
    setGlobalSearchQuery,
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const activeNotificationsCount = notifications.length;

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          onClick={onToggleMobileMenu}
          className="btn-icon-round"
          style={{ display: 'none' }}
          id="mobile-menu-btn"
          aria-label="Abrir menu lateral"
        >
          <Menu size={20} />
        </button>

        {/* Campo de Busca Global */}
        <div className="global-search-container" onClick={onOpenSearch}>
          <Search size={18} className="search-icon-pos" />
          <input
            type="text"
            className="global-search-input"
            placeholder="Buscar documentos, máquinas, despesas, fornecedores..."
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            onFocus={onOpenSearch}
          />
        </div>
      </div>

      <div className="header-right">
        {/* Seletor de Propriedade */}
        <div className="property-selector-wrapper" title="Filtrar por propriedade">
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
        >
          <Bell size={19} />
          {activeNotificationsCount > 0 && (
            <span className="notification-badge-dot" />
          )}
        </button>

        {/* Botão em destaque: Adicionar Documento */}
        <button
          className="btn btn-primary"
          onClick={() => setIsAddDocModalOpen(true)}
          id="btn-add-document-top"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Adicionar documento</span>
        </button>

        {/* Perfil Demonstrativo */}
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
              <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                Produtor Rural
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
                width: '260px',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-modal)',
                border: '1px solid var(--border-color)',
                padding: '16px',
                zIndex: 45,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary-dark)', marginBottom: '4px' }}>
                Perfil Demonstrativo
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Ambiente de visualização local. Em versões futuras, autenticação será feita via Supabase Auth.
              </div>
              <div
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11.5px',
                  color: 'var(--primary-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '10px',
                }}
              >
                <ShieldCheck size={14} color="var(--primary)" />
                Organização: Agro Mendonça
              </div>
              <button
                className="btn btn-secondary btn-sm"
                style={{ width: '100%' }}
                onClick={() => setIsProfileOpen(false)}
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
