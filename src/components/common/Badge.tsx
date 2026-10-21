import React from 'react';
import { DocumentStatus, TransactionStatus } from '../../types';

interface BadgeProps {
  status?: DocumentStatus | TransactionStatus | 'overdue' | 'neutral' | 'green';
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, label, className = '' }) => {
  let badgeClass = 'badge-neutral';
  let defaultLabel = label;

  switch (status) {
    case 'paid':
      badgeClass = 'badge-paid';
      defaultLabel = label || 'Pago / Realizado';
      break;
    case 'open':
      badgeClass = 'badge-open';
      defaultLabel = label || 'Em Aberto';
      break;
    case 'overdue':
      badgeClass = 'badge-overdue';
      defaultLabel = label || 'Atrasado';
      break;
    case 'organized':
      badgeClass = 'badge-paid';
      defaultLabel = label || 'Organizado';
      break;
    case 'pending':
      badgeClass = 'badge-pending';
      defaultLabel = label || 'Pendente de Classificação';
      break;
    case 'archived':
      badgeClass = 'badge-neutral';
      defaultLabel = label || 'Arquivado';
      break;
    case 'green':
      badgeClass = 'badge-green';
      break;
    default:
      badgeClass = 'badge-neutral';
  }

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      {defaultLabel}
    </span>
  );
};
