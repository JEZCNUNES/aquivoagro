import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Equipment, EquipmentType } from '../../types';
import { X, Tractor } from 'lucide-react';
import { getTodayIso, parseCurrencyToCents } from '../../utils/formatters';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentToEdit?: Equipment | null;
}

export const EquipmentModal: React.FC<EquipmentModalProps> = ({
  isOpen,
  onClose,
  equipmentToEdit,
}) => {
  const { properties, selectedPropertyId, addEquipment, updateEquipment } =
    useApp();

  const isEdit = Boolean(equipmentToEdit);
  const defaultProp =
    selectedPropertyId !== 'all' ? selectedPropertyId : properties[0]?.id || '';

  const [name, setName] = useState(equipmentToEdit?.name || '');
  const [type, setType] = useState<EquipmentType>(
    equipmentToEdit?.type || 'tractor'
  );
  const [brand, setBrand] = useState(equipmentToEdit?.brand || '');
  const [model, setModel] = useState(equipmentToEdit?.model || '');
  const [year, setYear] = useState<number>(
    equipmentToEdit?.year || new Date().getFullYear()
  );
  const [plateOrSerial, setPlateOrSerial] = useState(
    equipmentToEdit?.plateOrSerial || ''
  );
  const [propertyId, setPropertyId] = useState(
    equipmentToEdit?.propertyId || defaultProp
  );
  const [acquisitionDate, setAcquisitionDate] = useState(
    equipmentToEdit?.acquisitionDate || getTodayIso()
  );
  const [valStr, setValStr] = useState(
    equipmentToEdit
      ? (equipmentToEdit.acquisitionValueCents / 100).toFixed(2).replace('.', ',')
      : ''
  );
  const [notes, setNotes] = useState(equipmentToEdit?.notes || '');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Informe o nome de identificação da máquina.');
      return;
    }

    const valCents = parseCurrencyToCents(valStr);

    if (isEdit && equipmentToEdit) {
      updateEquipment(equipmentToEdit.id, {
        name,
        type,
        brand,
        model,
        year,
        plateOrSerial,
        propertyId,
        acquisitionDate,
        acquisitionValueCents: valCents,
        notes,
      });
    } else {
      addEquipment({
        name,
        type,
        brand,
        model,
        year,
        plateOrSerial,
        propertyId,
        acquisitionDate,
        acquisitionValueCents: valCents,
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
              <Tractor size={20} />
            </div>
            <div className="modal-title">
              {isEdit ? 'Editar Máquina / Veículo' : 'Cadastrar Nova Máquina ou Veículo'}
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
              <label className="form-label">Nome de Identificação *</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Trator John Deere 6110M"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tipo de Equipamento</label>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value as EquipmentType)}
                >
                  <option value="tractor">Trator</option>
                  <option value="harvester">Colheitadeira</option>
                  <option value="truck">Caminhão</option>
                  <option value="pickup">Caminhonete</option>
                  <option value="implement">Implemento Agrícola</option>
                  <option value="other">Outro Equipamento</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Propriedade Vinculada</label>
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
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Marca</label>
                <input
                  type="text"
                  className="form-input"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Ex: John Deere, Case, Jacto"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Modelo</label>
                <input
                  type="text"
                  className="form-input"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Ex: 6110M Cabinado"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ano de Fabricação</label>
                <input
                  type="number"
                  className="form-input"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Placa ou Número de Série</label>
                <input
                  type="text"
                  className="form-input"
                  value={plateOrSerial}
                  onChange={(e) => setPlateOrSerial(e.target.value)}
                  placeholder="Ex: JD6110M-98214"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Data de Aquisição</label>
                <input
                  type="date"
                  className="form-input"
                  value={acquisitionDate}
                  onChange={(e) => setAcquisitionDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Valor de Aquisição (R$)</label>
                <input
                  type="text"
                  className="form-input"
                  value={valStr}
                  onChange={(e) => setValStr(e.target.value)}
                  placeholder="Ex: 485.000,00"
                />
              </div>
            </div>

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
              {isEdit ? 'Salvar Alterações' : 'Cadastrar Equipamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
