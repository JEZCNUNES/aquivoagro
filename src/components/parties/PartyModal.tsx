import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EntityParty, PartyType } from '../../types';
import { X, Users } from 'lucide-react';

interface PartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  partyToEdit?: EntityParty | null;
}

export const PartyModal: React.FC<PartyModalProps> = ({
  isOpen,
  onClose,
  partyToEdit,
}) => {
  const { addParty, updateParty } = useApp();

  const isEdit = Boolean(partyToEdit);

  const [name, setName] = useState(partyToEdit?.name || '');
  const [type, setType] = useState<PartyType>(partyToEdit?.type || 'supplier');
  const [contact, setContact] = useState(partyToEdit?.contact || '');
  const [city, setCity] = useState(partyToEdit?.city || '');
  const [state, setState] = useState(partyToEdit?.state || 'MT');
  const [notes, setNotes] = useState(partyToEdit?.notes || '');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Informe o nome da empresa ou produtor parceiro.');
      return;
    }

    if (isEdit && partyToEdit) {
      updateParty(partyToEdit.id, {
        name,
        type,
        contact,
        city,
        state,
        notes,
      });
    } else {
      addParty({
        name,
        type,
        contact,
        city,
        state,
        notes,
      });
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
              <Users size={20} />
            </div>
            <div className="modal-title">
              {isEdit ? 'Editar Fornecedor / Cliente' : 'Cadastrar Fornecedor ou Cliente'}
            </div>
          </div>
          <button onClick={onClose} className="btn-icon-round">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errorMsg && (
              <div
                style={{
                  backgroundColor: '#FEE2E2',
                  padding: '10px',
                  borderRadius: '6px',
                  color: '#991B1B',
                  fontSize: '13px',
                  marginBottom: '14px',
                }}
              >
                {errorMsg}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Nome / Razão Social *</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: AgroPeças Central Sorriso"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Cadastro</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value as PartyType)}
              >
                <option value="supplier">Fornecedor</option>
                <option value="client">Cliente (Comprador de Grãos)</option>
                <option value="both">Ambos (Fornecedor e Cliente)</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Município</label>
                <input
                  type="text"
                  className="form-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Sorriso"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estado (UF)</label>
                <input
                  type="text"
                  maxLength={2}
                  className="form-input"
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  placeholder="MT"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contato (Telefone / E-mail / Responsável)</label>
              <input
                type="text"
                className="form-input"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Ex: (66) 3544-2200 / Marcos Peças"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Observações e Linha de Fornecimento</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Peças para colheitadeiras, condições de pagamento..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Salvar Alterações' : 'Salvar Cadastro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
