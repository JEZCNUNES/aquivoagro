import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Property } from '../../types';
import { X, Building2 } from 'lucide-react';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyToEdit?: Property | null;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  isOpen,
  onClose,
  propertyToEdit,
}) => {
  const { addProperty, updateProperty } = useApp();

  const isEdit = Boolean(propertyToEdit);

  const [name, setName] = useState(propertyToEdit?.name || '');
  const [city, setCity] = useState(propertyToEdit?.city || '');
  const [state, setState] = useState(propertyToEdit?.state || 'MT');
  const [areaHectares, setAreaHectares] = useState<number>(
    propertyToEdit?.areaHectares || 1000
  );
  const [responsible, setResponsible] = useState(
    propertyToEdit?.responsible || ''
  );
  const [cropsStr, setCropsStr] = useState(
    propertyToEdit?.mainCrops.join(', ') || 'Soja, Milho'
  );
  const [notes, setNotes] = useState(propertyToEdit?.notes || '');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Informe o nome da propriedade.');
      return;
    }

    const mainCrops = cropsStr.split(',').map((c) => c.trim()).filter(Boolean);

    if (isEdit && propertyToEdit) {
      updateProperty(propertyToEdit.id, {
        name,
        city,
        state,
        areaHectares,
        responsible,
        mainCrops,
        notes,
      });
    } else {
      addProperty({
        name,
        city,
        state,
        areaHectares,
        responsible,
        mainCrops,
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
              <Building2 size={20} />
            </div>
            <div className="modal-title">
              {isEdit ? 'Editar Propriedade' : 'Cadastrar Nova Propriedade Rural'}
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
              <label className="form-label">Nome da Fazenda / Propriedade *</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Fazenda Santa Luzia"
                required
              />
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
                  required
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
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Área Total (Hectares) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={areaHectares}
                  onChange={(e) => setAreaHectares(Number(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Responsável / Gestor</label>
                <input
                  type="text"
                  className="form-input"
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  placeholder="Ex: Roberto Mendonça"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Culturas / Atividades Principais</label>
              <input
                type="text"
                className="form-input"
                value={cropsStr}
                onChange={(e) => setCropsStr(e.target.value)}
                placeholder="Ex: Soja, Milho Safrinha, Pecuária"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Observações e Estrutura</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Silos, galpões, pivôs ou detalhes de solo..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Salvar Alterações' : 'Cadastrar Fazenda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
