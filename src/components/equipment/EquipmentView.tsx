import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Equipment, EquipmentType } from '../../types';
import {
  Tractor,
  Plus,
  Search,
  Filter,
  Wrench,
  Fuel,
  FileText,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { calculateEquipmentSpending, filterByProperty } from '../../utils/calculations';
import { EquipmentDetailModal } from './EquipmentDetailModal';
import { EquipmentModal } from './EquipmentModal';

export const EquipmentView: React.FC = () => {
  const {
    equipment,
    properties,
    transactions,
    documents,
    selectedPropertyId,
    activeEquipmentDetailId,
    setActiveEquipmentDetailId,
  } = useApp();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredEquipment = useMemo(() => {
    let list = filterByProperty(equipment, selectedPropertyId);

    if (typeFilter !== 'all') {
      list = list.filter((e) => e.type === typeFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.brand.toLowerCase().includes(q) ||
          e.model.toLowerCase().includes(q) ||
          e.plateOrSerial.toLowerCase().includes(q)
      );
    }

    return list;
  }, [equipment, selectedPropertyId, typeFilter, searchTerm]);

  return (
    <div className="content-container">
      {/* Cabeçalho */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Veículos e Máquinas Agrícolas</h1>
          <p className="page-description">
            Controle do patrimônio mecânico: acompanhe notas fiscais de peças, manutenções preventivas e consumo de combustível por equipamento.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary"
          id="btn-add-equipment"
        >
          <Plus size={18} /> Cadastrar máquina / veículo
        </button>
      </div>

      {/* Barra de Filtros */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} className="search-icon-pos" />
          <input
            type="text"
            className="global-search-input"
            style={{ height: '38px', borderRadius: 'var(--radius-md)' }}
            placeholder="Buscar por nome, marca, modelo ou número de série..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ minWidth: '180px' }}>
          <select
            className="form-select"
            style={{ height: '38px', padding: '0 12px' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Todos os Tipos</option>
            <option value="tractor">Tratores</option>
            <option value="harvester">Colheitadeiras</option>
            <option value="truck">Caminhões</option>
            <option value="pickup">Caminhonetes</option>
            <option value="implement">Implementos Agrícolas</option>
            <option value="other">Outros</option>
          </select>
        </div>
      </div>

      {/* Grid de Máquinas */}
      {filteredEquipment.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <Tractor size={48} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
          <h3>Nenhum equipamento localizado</h3>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>
            Tente outros filtros ou cadastre um novo equipamento.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredEquipment.map((eq) => {
            const prop = properties.find((p) => p.id === eq.propertyId);
            const spending = calculateEquipmentSpending(eq.id, transactions, equipment);
            const docCount = documents.filter((d) => d.equipmentId === eq.id && d.status !== 'archived').length;

            return (
              <div
                key={eq.id}
                className="card"
                onClick={() => setActiveEquipmentDetailId(eq.id)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Tractor size={24} />
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: '#F3F4F6',
                        color: '#374151',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      {eq.type === 'tractor'
                        ? 'Trator'
                        : eq.type === 'harvester'
                        ? 'Colheitadeira'
                        : eq.type === 'truck'
                        ? 'Caminhão'
                        : eq.type === 'pickup'
                        ? 'Caminhonete'
                        : eq.type === 'implement'
                        ? 'Implemento'
                        : 'Equipamento'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '4px' }}>
                    {eq.name}
                  </h3>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-subtle)', marginBottom: '14px' }}>
                    {eq.brand} • {eq.model} ({eq.year}) • Série: {eq.plateOrSerial}
                  </div>

                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px',
                      fontSize: '12.5px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Propriedade:</span>
                      <span style={{ fontWeight: 600 }}>{prop?.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Aquisição:</span>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(spending.acquisitionCents)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Gasto Manutenção:</span>
                      <span style={{ fontWeight: 700, color: '#DC2626' }}>
                        {formatCurrency(spending.maintenanceCents)}
                      </span>
                    </div>
                    {spending.fuelCents > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Diesel / Óleo:</span>
                        <span style={{ fontWeight: 600, color: '#D97706' }}>
                          {formatCurrency(spending.fuelCents)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '12px',
                    fontSize: '12px',
                    color: 'var(--primary-dark)',
                    fontWeight: 600,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileText size={14} color="var(--primary)" /> {docCount} nota(s) vinculada(s)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--primary)' }}>
                    Ver dossiê <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalhes da Máquina */}
      <EquipmentDetailModal
        equipmentId={activeEquipmentDetailId}
        onClose={() => setActiveEquipmentDetailId(null)}
      />

      {/* Modal de Cadastro de Máquina */}
      <EquipmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
