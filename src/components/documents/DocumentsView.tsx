import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentCategory, DocumentStatus, DocumentRecord } from '../../types';
import {
  FileText,
  Search,
  Filter,
  LayoutGrid,
  List,
  Plus,
  Download,
  Archive,
  CheckCircle,
  Eye,
  Tractor,
  DollarSign,
  Building2,
  Calendar,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  formatDate,
  formatCurrency,
  formatFileSize,
} from '../../utils/formatters';
import { exportToCsv } from '../../utils/csvExport';
import { StatusBadge } from '../common/Badge';

export const DocumentsView: React.FC = () => {
  const {
    documents,
    properties,
    equipment,
    parties,
    selectedPropertyId,
    setSelectedPropertyId,
    setIsAddDocModalOpen,
    setViewingDocument,
    setPreviewFile,
    updateDocument,
    archiveDocument,
    showToast,
  } = useApp();

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  // Categorias disponíveis
  const categories: DocumentCategory[] = [
    'Notas fiscais de compras',
    'Notas fiscais de vendas',
    'Veículos',
    'Máquinas e implementos',
    'Peças e manutenção',
    'Combustíveis',
    'Insumos agrícolas',
    'Contratos e arrendamentos',
    'Documentos da propriedade',
    'Comprovantes de pagamento',
    'Financiamentos e seguros',
    'Outros',
  ];

  // Filtros aplicados
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      // Filtro de propriedade
      if (selectedPropertyId !== 'all' && doc.propertyId !== selectedPropertyId) {
        return false;
      }
      // Filtro de categoria
      if (categoryFilter !== 'all' && doc.category !== categoryFilter) {
        return false;
      }
      // Filtro de status
      if (statusFilter !== 'all') {
        if (statusFilter === 'archived' && doc.status !== 'archived') return false;
        if (statusFilter === 'organized' && doc.status !== 'organized') return false;
        if (statusFilter === 'pending' && doc.status !== 'pending') return false;
        if (statusFilter === 'active' && doc.status === 'archived') return false;
      } else {
        // Por padrão, não mostra arquivados a menos que selecionado explicitamente
        if (doc.status === 'archived') return false;
      }

      // Busca por texto
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(query);
        const matchesFileName = doc.originalFileName.toLowerCase().includes(query);
        const matchesInvoice = doc.invoiceNumber?.toLowerCase().includes(query);
        const matchesTags = doc.tags.some((t) => t.toLowerCase().includes(query));
        const partyName = parties.find((p) => p.id === doc.partyId)?.name.toLowerCase() || '';
        const matchesParty = partyName.includes(query);

        return matchesTitle || matchesFileName || matchesInvoice || matchesTags || matchesParty;
      }

      return true;
    });
  }, [documents, selectedPropertyId, categoryFilter, statusFilter, searchTerm, parties]);

  // Ações em lote
  const handleSelectAll = () => {
    if (selectedDocIds.length === filteredDocs.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(filteredDocs.map((d) => d.id));
    }
  };

  const toggleSelectDoc = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((dId) => dId !== id) : [...prev, id]
    );
  };

  const handleBatchOrganize = () => {
    selectedDocIds.forEach((id) => {
      updateDocument(id, { status: 'organized' });
    });
    setSelectedDocIds([]);
    showToast(`${selectedDocIds.length} documento(s) marcados como organizados!`);
  };

  const handleBatchArchive = () => {
    selectedDocIds.forEach((id) => {
      archiveDocument(id);
    });
    setSelectedDocIds([]);
    showToast(`${selectedDocIds.length} documento(s) arquivados!`);
  };

  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Título',
      'Nome Arquivo',
      'Categoria',
      'Subtipo Propriedade',
      'Propriedade',
      'Data Emissão',
      'Valor (R$)',
      'Número Nota',
      'Máquina Vinculada',
      'Status',
    ];

    const rows = filteredDocs.map((d) => {
      const prop = properties.find((p) => p.id === d.propertyId)?.name || '';
      const eq = equipment.find((e) => e.id === d.equipmentId)?.name || '';
      const val = d.valueCents ? (d.valueCents / 100).toFixed(2).replace('.', ',') : '';
      return [
        d.id,
        d.title,
        d.originalFileName,
        d.category,
        d.propertySubtype || '',
        prop,
        formatDate(d.issueDate),
        val,
        d.invoiceNumber || '',
        eq,
        d.status,
      ];
    });

    exportToCsv('AgroArquivo_Documentos', headers, rows);
    showToast('Exportação de documentos gerada com sucesso!');
  };

  return (
    <div className="content-container">
      {/* Cabeçalho da Página */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Central de Documentos</h1>
          <p className="page-description">
            Organize notas fiscais, contratos, escrituras e comprovantes vinculados ao seu patrimônio.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={handleExportCsv} className="btn btn-secondary btn-sm">
            <Download size={15} /> Exportar CSV
          </button>
          <button
            onClick={() => setIsAddDocModalOpen(true)}
            className="btn btn-primary"
            id="btn-add-doc-page"
          >
            <Plus size={18} /> Adicionar documento
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Visualização */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Busca Textual */}
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={16} className="search-icon-pos" />
            <input
              type="text"
              className="global-search-input"
              style={{ height: '38px', borderRadius: 'var(--radius-md)' }}
              placeholder="Buscar por título, fornecedor, nº da nota ou tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtro por Categoria */}
          <div style={{ minWidth: '200px' }}>
            <select
              className="form-select"
              style={{ height: '38px', padding: '0 12px' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Status */}
          <div style={{ minWidth: '170px' }}>
            <select
              className="form-select"
              style={{ height: '38px', padding: '0 12px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Documentos Ativos</option>
              <option value="organized">Organizados</option>
              <option value="pending">Pendentes de Classificação</option>
              <option value="archived">Arquivados</option>
            </select>
          </div>

          {/* Alternador Tabela / Grade */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              padding: '2px',
            }}
          >
            <button
              onClick={() => setViewMode('table')}
              style={{
                border: 'none',
                background: viewMode === 'table' ? '#FFFFFF' : 'transparent',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: 'pointer',
                color: viewMode === 'table' ? 'var(--primary-dark)' : 'var(--text-muted)',
                boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
              title="Visualização em tabela"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                border: 'none',
                background: viewMode === 'cards' ? '#FFFFFF' : 'transparent',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: 'pointer',
                color: viewMode === 'cards' ? 'var(--primary-dark)' : 'var(--text-muted)',
                boxShadow: viewMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
              title="Visualização em cartões"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>

        {/* Barra de Ações em Lote */}
        {selectedDocIds.length > 0 && (
          <div
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--primary-border)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-dark)' }}>
              {selectedDocIds.length} documento(s) selecionado(s)
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleBatchOrganize} className="btn btn-primary btn-sm">
                <CheckCircle size={14} /> Marcar como Organizados
              </button>
              <button onClick={handleBatchArchive} className="btn btn-secondary btn-sm">
                <Archive size={14} /> Arquivar Selecionados
              </button>
              <button
                onClick={() => setSelectedDocIds([])}
                className="btn btn-secondary btn-sm"
              >
                Limpar seleção
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Resultados da Listagem */}
      {filteredDocs.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: 'var(--text-muted)',
          }}
        >
          <FileText size={48} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--primary-dark)' }}>
            Nenhum documento encontrado
          </h3>
          <p style={{ fontSize: '13.5px', marginTop: '4px', maxWidth: '420px', margin: '4px auto 16px' }}>
            Nenhum registro corresponde aos filtros selecionados. Tente alterar os parâmetros ou adicione um novo documento.
          </p>
          <button onClick={() => setIsAddDocModalOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={16} /> Adicionar primeiro documento
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* VISUALIZAÇÃO EM TABELA */
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <button
                    onClick={handleSelectAll}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    title="Selecionar todos"
                  >
                    {selectedDocIds.length === filteredDocs.length ? (
                      <CheckSquare size={18} color="var(--primary)" />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </th>
                <th>Documento</th>
                <th>Categoria</th>
                <th>Propriedade</th>
                <th>Emissão</th>
                <th>Valor (R$)</th>
                <th>Máquina Vinculada</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => {
                const prop = properties.find((p) => p.id === doc.propertyId);
                const eq = equipment.find((e) => e.id === doc.equipmentId);
                const isSelected = selectedDocIds.includes(doc.id);

                return (
                  <tr
                    key={doc.id}
                    style={{
                      backgroundColor: isSelected ? 'var(--bg-tertiary)' : undefined,
                      cursor: 'pointer',
                    }}
                    onClick={() => setViewingDocument(doc)}
                  >
                    <td
                      style={{ textAlign: 'center' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectDoc(doc.id);
                      }}
                    >
                      {isSelected ? (
                        <CheckSquare size={18} color="var(--primary)" />
                      ) : (
                        <Square size={18} color="var(--text-subtle)" />
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-tertiary)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <FileText size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '13.5px' }}>
                            {doc.title}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                            {doc.originalFileName} • {formatFileSize(doc.fileSizeBytes)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12.5px', color: 'var(--text-main)' }}>
                        {doc.category}
                      </span>
                      {doc.propertySubtype && (
                        <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>
                          {doc.propertySubtype}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '12.5px', color: 'var(--text-main)' }}>
                        {prop?.name || '—'}
                      </span>
                    </td>
                    <td style={{ fontSize: '12.5px', whiteSpace: 'nowrap' }}>
                      {formatDate(doc.issueDate)}
                    </td>
                    <td style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-dark)', whiteSpace: 'nowrap' }}>
                      {doc.valueCents ? formatCurrency(doc.valueCents) : '—'}
                    </td>
                    <td>
                      {eq ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            backgroundColor: 'var(--bg-tertiary)',
                            color: 'var(--primary-dark)',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--primary-border)',
                          }}
                        >
                          <Tractor size={12} /> {eq.name}
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={doc.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div
                        style={{ display: 'inline-flex', gap: '6px' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setPreviewFile(doc)}
                          className="btn-icon-round"
                          style={{ width: '28px', height: '28px' }}
                          title="Visualizar arquivo"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* VISUALIZAÇÃO EM CARTÕES (GRID) */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '18px',
          }}
        >
          {filteredDocs.map((doc) => {
            const prop = properties.find((p) => p.id === doc.propertyId);
            const eq = equipment.find((e) => e.id === doc.equipmentId);

            return (
              <div
                key={doc.id}
                className="card"
                onClick={() => setViewingDocument(doc)}
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FileText size={20} />
                    </div>
                    <StatusBadge status={doc.status} />
                  </div>

                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '4px', lineHeight: 1.3 }}>
                    {doc.title}
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginBottom: '12px' }}>
                    {doc.originalFileName} • {formatFileSize(doc.fileSizeBytes)}
                  </div>

                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                    <div><strong>Categoria:</strong> {doc.category}</div>
                    <div><strong>Propriedade:</strong> {prop?.name || '—'}</div>
                    {doc.valueCents && (
                      <div><strong>Valor:</strong> <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatCurrency(doc.valueCents)}</span></div>
                    )}
                    {eq && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-dark)', fontWeight: 600 }}>
                        <Tractor size={13} color="var(--primary)" /> {eq.name}
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
                    color: 'var(--text-subtle)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Emissão: {formatDate(doc.issueDate)}</span>
                  <button
                    onClick={() => setPreviewFile(doc)}
                    className="btn btn-outline-green btn-sm"
                  >
                    <Eye size={14} /> Ver
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
