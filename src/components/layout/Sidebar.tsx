import React from 'react';
import { useApp } from '../../context/AppContext';
import { ViewTab } from '../../types';
import {
  LayoutDashboard,
  Inbox,
  AlertCircle,
  Clock,
  CalendarCheck2,
  Users,
  MapPin,
  Tractor,
  ShoppingCart,
  Boxes,
  TrendingUp,
  DollarSign,
  ReceiptText,
  ShieldCheck,
  FolderOpen,
  FileSignature,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Leaf,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (m: boolean) => void;
}

interface NavSection {
  title: string;
  items: {
    id: ViewTab;
    label: string;
    icon: React.ReactNode;
    badgeCount?: number;
    badgeColor?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const {
    activeTab,
    setActiveTab,
    documents,
    transactions,
    tasks,
    contracts,
    insurance,
    reliabilityMetrics,
  } = useApp();

  // Contadores dinâmicos para a Caixa de Entrada e Pendências
  const inboxCount = documents.filter(
    (d) => d.status === 'pending' || d.isDuplicateSuspect || d.validationStatus === 'draft' || !d.propertyId
  ).length;

  const criticalPendenciesCount = tasks.filter((t) => t.status !== 'completed' && (t.priority === 'urgent' || t.priority === 'high')).length;

  const overdueCount = transactions.filter(
    (t) => t.status === 'open' && t.type === 'expense' && t.dueDate < new Date().toISOString().split('T')[0]
  ).length;

  const expiringContractsCount = contracts.filter((c) => c.status === 'expiring').length;
  const expiringInsuranceCount = insurance.filter((i) => i.status === 'expiring').length;
  const totalUpcomingDeadlines = overdueCount + expiringContractsCount + expiringInsuranceCount;

  // Mapa Macro da Barra Lateral (LSA V0.1 / V1.0)
  const navSections: NavSection[] = [
    {
      title: 'Visão e Trabalho',
      items: [
        {
          id: 'overview',
          label: 'Visão Geral',
          icon: <LayoutDashboard size={19} />,
        },
        {
          id: 'inbox',
          label: 'Caixa de Entrada',
          icon: <Inbox size={19} />,
          badgeCount: inboxCount > 0 ? inboxCount : undefined,
          badgeColor: '#D97706', // Âmbar
        },
        {
          id: 'pendencies',
          label: 'Pendências',
          icon: <AlertCircle size={19} />,
          badgeCount: criticalPendenciesCount > 0 ? criticalPendenciesCount : undefined,
          badgeColor: '#DC2626', // Vermelho
        },
        {
          id: 'deadlines',
          label: 'Vencimentos',
          icon: <Clock size={19} />,
          badgeCount: totalUpcomingDeadlines > 0 ? totalUpcomingDeadlines : undefined,
          badgeColor: '#2563EB', // Azul
        },
        {
          id: 'tasks',
          label: 'Agenda / Tarefas',
          icon: <CalendarCheck2 size={19} />,
        },
      ],
    },
    {
      title: 'Estrutura do Cliente',
      items: [
        {
          id: 'parties',
          label: 'Cliente & Pessoas',
          icon: <Users size={19} />,
        },
        {
          id: 'properties',
          label: 'Propriedades',
          icon: <MapPin size={19} />,
        },
        {
          id: 'equipment',
          label: 'Patrimônio & Infra',
          icon: <Tractor size={19} />,
        },
      ],
    },
    {
      title: 'Negócios & Operações',
      items: [
        {
          id: 'purchases',
          label: 'Compras & Fornecedores',
          icon: <ShoppingCart size={19} />,
        },
        {
          id: 'inventory',
          label: 'Estoques & Saldos',
          icon: <Boxes size={19} />,
        },
        {
          id: 'commercial',
          label: 'Comercialização',
          icon: <TrendingUp size={19} />,
        },
      ],
    },
    {
      title: 'Finanças & Conformidade',
      items: [
        {
          id: 'financial',
          label: 'Financeiro & Crédito',
          icon: <DollarSign size={19} />,
        },
        {
          id: 'fiscal',
          label: 'Fiscal & Contábil',
          icon: <ReceiptText size={19} />,
        },
        {
          id: 'insurance',
          label: 'Seguros',
          icon: <ShieldCheck size={19} />,
        },
      ],
    },
    {
      title: 'Documentos & Análise',
      items: [
        {
          id: 'documents',
          label: 'Central de Documentos',
          icon: <FolderOpen size={19} />,
        },
        {
          id: 'contracts',
          label: 'Central de Contratos',
          icon: <FileSignature size={19} />,
        },
        {
          id: 'reports',
          label: 'Relatórios & Custos',
          icon: <BarChart3 size={19} />,
        },
      ],
    },
    {
      title: 'Sistema',
      items: [
        {
          id: 'settings',
          label: 'Auditoria & Configurações',
          icon: <Settings size={19} />,
        },
      ],
    },
  ];

  const handleSelectTab = (tab: ViewTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Overlay para fechar no celular */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 55,
          }}
        />
      )}

      <aside
        className={`sidebar ${collapsed ? 'collapsed' : ''} ${
          mobileOpen ? 'mobile-open' : ''
        }`}
        style={{
          width: collapsed ? '80px' : '268px',
          background: 'linear-gradient(180deg, #14532D 0%, #0F3E22 100%)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Cabeçalho da Barra Lateral */}
        <div className="sidebar-header" style={{ padding: '20px 16px' }}>
          <div className="brand-wrapper">
            <div
              className="brand-logo-icon"
              style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#86EFAC',
              }}
            >
              <Leaf size={22} />
            </div>
            {!collapsed && (
              <div>
                <div className="brand-title" style={{ fontSize: '16px', letterSpacing: '-0.02em' }}>
                  LSA AGRO
                </div>
                <div className="brand-subtitle" style={{ fontSize: '10.5px', color: '#86EFAC' }}>
                  ERP Rural & Gestão Documental
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="btn-icon-round"
            style={{
              width: '28px',
              height: '28px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderColor: 'transparent',
              color: '#FFFFFF',
            }}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navegação Estruturada por Domínios */}
        <nav
          className="sidebar-nav"
          style={{
            padding: '12px 10px',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
          }}
        >
          {navSections.map((section, sIdx) => (
            <div key={sIdx} style={{ marginBottom: '14px' }}>
              {!collapsed && (
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#86EFAC',
                    padding: '8px 10px 4px 10px',
                    opacity: 0.85,
                  }}
                >
                  {section.title}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {section.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      title={collapsed ? item.label : undefined}
                      style={{
                        padding: '9px 12px',
                        fontSize: '13px',
                        fontWeight: isActive ? 600 : 500,
                        backgroundColor: isActive
                          ? 'rgba(34, 197, 94, 0.22)'
                          : 'transparent',
                        color: isActive ? '#FFFFFF' : '#E2E8F0',
                        borderLeft: isActive
                          ? '3px solid #4ADE80'
                          : '3px solid transparent',
                        borderRadius: '8px',
                      }}
                    >
                      <div
                        style={{
                          flexShrink: 0,
                          color: isActive ? '#4ADE80' : '#A7F3D0',
                        }}
                      >
                        {item.icon}
                      </div>
                      {!collapsed && (
                        <>
                          <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                          {item.badgeCount !== undefined && item.badgeCount > 0 && (
                            <span
                              className="nav-badge"
                              style={{
                                backgroundColor: item.badgeColor || 'rgba(255,255,255,0.2)',
                                color: '#FFFFFF',
                                fontWeight: 700,
                                fontSize: '10.5px',
                                padding: '1px 6px',
                                borderRadius: '10px',
                              }}
                            >
                              {item.badgeCount}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Rodapé com Selo de Confiabilidade da Base (Porta de Qualidade LSA V1.0) */}
        {!collapsed && (
          <div
            className="sidebar-footer"
            style={{
              padding: '12px 14px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'rgba(0,0,0,0.12)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                color: '#E2E8F0',
                marginBottom: '4px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor:
                    reliabilityMetrics.overallScore >= 90
                      ? '#4ADE80'
                      : reliabilityMetrics.overallScore >= 75
                      ? '#FBBF24'
                      : '#F87171',
                }}
              />
              <span style={{ fontWeight: 600 }}>Confiabilidade da Base:</span>
              <strong style={{ color: '#4ADE80' }}>{reliabilityMetrics.overallScore}%</strong>
            </div>
            <div style={{ fontSize: '10px', color: '#9CA3AF' }}>
              {reliabilityMetrics.validatedPercentage}% validado • {reliabilityMetrics.criticalIssuesCount} pendência(s)
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
