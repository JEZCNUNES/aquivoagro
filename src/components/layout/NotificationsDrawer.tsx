import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';
import {
  X,
  AlertTriangle,
  Clock,
  FileQuestion,
  CalendarCheck,
  ChevronRight,
  Bell,
} from 'lucide-react';

export const NotificationsDrawer: React.FC = () => {
  const {
    isNotificationsDrawerOpen,
    setIsNotificationsDrawerOpen,
    notifications,
    setActiveTab,
    documents,
    setViewingDocument,
  } = useApp();

  if (!isNotificationsDrawerOpen) return null;

  const handleItemClick = (
    targetType: 'document' | 'financial',
    targetId: string
  ) => {
    setIsNotificationsDrawerOpen(false);
    if (targetType === 'financial') {
      setActiveTab('financial');
    } else if (targetType === 'document') {
      const doc = documents.find((d) => d.id === targetId);
      if (doc) {
        setViewingDocument(doc);
      } else {
        setActiveTab('documents');
      }
    }
  };

  const overdueList = notifications.filter((n) => n.type === 'overdue');
  const upcomingList = notifications.filter((n) => n.type === 'upcoming');
  const unclassifiedList = notifications.filter((n) => n.type === 'unclassified');
  const expiringList = notifications.filter((n) => n.type === 'expiring');

  return (
    <div
      className="drawer-overlay"
      onClick={() => setIsNotificationsDrawerOpen(false)}
    >
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={20} />
            </div>
            <div>
              <div className="modal-title" style={{ fontSize: '17px' }}>
                Central de Pendências
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                {notifications.length} alerta(s) requerem atenção
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsNotificationsDrawerOpen(false)}
            className="btn-icon-round"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          {notifications.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-muted)',
              }}
            >
              <CalendarCheck size={48} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>Tudo em dia!</h4>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>
                Não existem contas atrasadas, vencimentos imediatos ou documentos pendentes.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Contas Atrasadas */}
              {overdueList.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#DC2626',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <AlertTriangle size={15} /> Contas em Atraso ({overdueList.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {overdueList.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item.targetType, item.targetId)}
                        style={{
                          backgroundColor: '#FEF2F2',
                          border: '1px solid #FCA5A5',
                          borderRadius: 'var(--radius-md)',
                          padding: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: '#991B1B' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '12px', color: '#7F1D1D', marginTop: '2px' }}>
                            {item.description}
                          </div>
                        </div>
                        <ChevronRight size={16} color="#DC2626" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vencimentos Próximos */}
              {upcomingList.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#D97706',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Clock size={15} /> Vencimentos nos Próximos 7 Dias ({upcomingList.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {upcomingList.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item.targetType, item.targetId)}
                        style={{
                          backgroundColor: '#FFFBEB',
                          border: '1px solid #FDE68A',
                          borderRadius: 'var(--radius-md)',
                          padding: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: '#92400E' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '12px', color: '#B45309', marginTop: '2px' }}>
                            {item.description}
                          </div>
                        </div>
                        <ChevronRight size={16} color="#D97706" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documentos sem classificação */}
              {unclassifiedList.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--primary-dark)',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <FileQuestion size={15} /> Documentos sem Classificação ({unclassifiedList.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {unclassifiedList.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item.targetType, item.targetId)}
                        style={{
                          backgroundColor: '#F8FAFC',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          padding: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main)' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {item.description}
                          </div>
                        </div>
                        <ChevronRight size={16} color="var(--text-subtle)" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documentos com validade próxima */}
              {expiringList.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#2563EB',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <CalendarCheck size={15} /> Validade Próxima de Documentos ({expiringList.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {expiringList.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item.targetType, item.targetId)}
                        style={{
                          backgroundColor: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          borderRadius: 'var(--radius-md)',
                          padding: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: '#1E40AF' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '12px', color: '#3B82F6', marginTop: '2px' }}>
                            {item.description}
                          </div>
                        </div>
                        <ChevronRight size={16} color="#2563EB" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
