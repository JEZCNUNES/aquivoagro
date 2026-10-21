import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FinancialCategory,
  FinancialTransaction,
  PaymentMethod,
  TransactionType,
} from '../../types';
import { X, DollarSign, Calendar, Tractor, Building2 } from 'lucide-react';
import { getTodayIso, parseCurrencyToCents } from '../../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: FinancialTransaction | null;
}

const FINANCIAL_CATEGORIES: FinancialCategory[] = [
  'Venda de Produção',
  'Peças e Manutenção',
  'Combustível e Lubrificantes',
  'Insumos e Defensivos',
  'Sementes e Fertilizantes',
  'Arrendamento de Terras',
  'Seguro Rural e Financiamento',
  'Folha e Serviços de Terceiros',
  'Impostos e Taxas',
  'Aquisição de Imobilizado',
  'Outras Despesas',
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transactionToEdit,
}) => {
  const {
    properties,
    equipment,
    parties,
    selectedPropertyId,
    addTransaction,
    updateTransaction,
  } = useApp();

  const isEdit = Boolean(transactionToEdit);
  const defaultPropId =
    selectedPropertyId !== 'all' ? selectedPropertyId : properties[0]?.id || '';

  const [description, setDescription] = useState(
    transactionToEdit?.description || ''
  );
  const [type, setType] = useState<TransactionType>(
    transactionToEdit?.type || 'expense'
  );
  const [valueStr, setValueStr] = useState(
    transactionToEdit ? (transactionToEdit.amountCents / 100).toFixed(2).replace('.', ',') : ''
  );
  const [category, setCategory] = useState<FinancialCategory>(
    transactionToEdit?.category || 'Peças e Manutenção'
  );
  const [propertyId, setPropertyId] = useState(
    transactionToEdit?.propertyId || defaultPropId
  );
  const [partyId, setPartyId] = useState(transactionToEdit?.partyId || '');
  const [equipmentId, setEquipmentId] = useState(
    transactionToEdit?.equipmentId || ''
  );
  const [issueDate, setIssueDate] = useState(
    transactionToEdit?.issueDate || getTodayIso()
  );
  const [dueDate, setDueDate] = useState(
    transactionToEdit?.dueDate || getTodayIso()
  );
  const [status, setStatus] = useState<'open' | 'paid'>(
    transactionToEdit?.status || 'open'
  );
  const [paymentDate, setPaymentDate] = useState(
    transactionToEdit?.paymentDate || getTodayIso()
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    transactionToEdit?.paymentMethod || 'Boleto Bancário'
  );
  const [cropSeason, setCropSeason] = useState(
    transactionToEdit?.cropSeason || 'Safra 2026/2027'
  );
  const [notes, setNotes] = useState(transactionToEdit?.notes || '');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!description.trim()) {
      setErrorMsg('Informe a descrição do lançamento.');
      return;
    }

    const amountCents = parseCurrencyToCents(valueStr);
    if (amountCents <= 0) {
      setErrorMsg('Informe um valor monetário válido maior que zero.');
      return;
    }

    if (!dueDate) {
      setErrorMsg('Informe a data de vencimento.');
      return;
    }

    if (isEdit && transactionToEdit) {
      updateTransaction(transactionToEdit.id, {
        description,
        type,
        amountCents,
        category,
        propertyId,
        partyId: partyId || undefined,
        equipmentId: equipmentId || undefined,
        issueDate,
        dueDate,
        status,
        paymentDate: status === 'paid' ? paymentDate : undefined,
        paymentMethod,
        cropSeason,
        notes,
      });
    } else {
      addTransaction({
        description,
        type,
        amountCents,
        category,
        propertyId,
        partyId: partyId || undefined,
        equipmentId: equipmentId || undefined,
        issueDate,
        dueDate,
        status,
        paymentDate: status === 'paid' ? paymentDate : undefined,
        paymentMethod,
        cropSeason,
        notes,
      });
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px' }}
      >
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
              <DollarSign size={20} />
            </div>
            <div className="modal-title">
              {isEdit ? 'Editar Lançamento' : 'Novo Lançamento Financeiro'}
            </div>
          </div>
          <button onClick={onClose} className="btn-icon-round">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh' }}>
            {errorMsg && (
              <div
                style={{
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  color: '#991B1B',
                  fontSize: '13px',
                  marginBottom: '14px',
                }}
              >
                {errorMsg}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Tipo de Movimentação</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${type === 'expense' ? '#DC2626' : 'var(--border-color)'}`,
                    backgroundColor: type === 'expense' ? '#FEF2F2' : '#FFFFFF',
                    color: type === 'expense' ? '#991B1B' : 'var(--text-muted)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Despesa (Saída)
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${type === 'income' ? 'var(--primary)' : 'var(--border-color)'}`,
                    backgroundColor: type === 'income' ? 'var(--bg-tertiary)' : '#FFFFFF',
                    color: type === 'income' ? 'var(--primary-dark)' : 'var(--text-muted)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Receita (Entrada)
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Descrição *</label>
              <input
                type="text"
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Aquisição de peças para revisão do trator"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Valor (R$) *</label>
                <input
                  type="text"
                  className="form-input"
                  value={valueStr}
                  onChange={(e) => setValueStr(e.target.value)}
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Categoria Financeira</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FinancialCategory)}
                >
                  {FINANCIAL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Propriedade *</label>
                <select
                  className="form-select"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Máquina/Veículo (opcional)</label>
                <select
                  className="form-select"
                  value={equipmentId}
                  onChange={(e) => setEquipmentId(e.target.value)}
                >
                  <option value="">Nenhuma</option>
                  {equipment.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Data de Emissão</label>
                <input
                  type="date"
                  className="form-input"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Data de Vencimento *</label>
                <input
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Situação</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'open' | 'paid')}
                >
                  <option value="open">Em Aberto (Previsto)</option>
                  <option value="paid">Realizado (Pago/Recebido)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Forma de Pagamento</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                >
                  <option value="Boleto Bancário">Boleto Bancário</option>
                  <option value="Pix">Pix</option>
                  <option value="Transferência Bancária">Transferência Bancária</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>
            </div>

            {status === 'paid' && (
              <div className="form-group" style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <label className="form-label">Data Efetiva de Pagamento / Recebimento</label>
                <input
                  type="date"
                  className="form-input"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Observações</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Salvar Alterações' : 'Salvar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
