import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ReceiptText,
  FileText,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Calendar,
  Building2,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrencyBRL, formatDateBR } from '../../utils/formatters';

type FiscalSubTab = 'all_nfe' | 'declarations' | 'guides' | 'certificates' | 'accounting';

export const FiscalView: React.FC = () => {
  const { documents, setPreviewFile } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<FiscalSubTab>('all_nfe');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtra documentos de natureza fiscal e contábil
  const fiscalDocs = documents.filter((doc) => {
    return (
      doc.category === 'Notas fiscais de compras' ||
      doc.category === 'Notas fiscais de vendas' ||
      doc.propertySubtype === 'ITR' ||
      doc.tags.some((t) => ['ITR', 'Tributos', 'DARF', 'Nota Fiscal', 'Certidão', 'Contabilidade'].includes(t)) ||
      doc.invoiceNumber !== undefined
    );
  });

  const nfeDocs = fiscalDocs.filter(
    (d) => d.category === 'Notas fiscais de compras' || d.category === 'Notas fiscais de vendas' || d.invoiceNumber
  );

  const declarationDocs = fiscalDocs.filter(
    (d) => d.propertySubtype === 'ITR' || d.tags.includes('ITR') || d.tags.includes('Declaração')
  );

  const guideDocs = fiscalDocs.filter(
    (d) => d.tags.includes('Tributos') || d.tags.includes('DARF') || d.title.toLowerCase().includes('guia')
  );

  const certificateDocs = fiscalDocs.filter(
    (d) => d.tags.includes('Certidão') || d.title.toLowerCase().includes('certidão') || d.propertySubtype === 'CCIR'
  );

  const accountingDocs = fiscalDocs.filter(
    (d) => d.tags.includes('Contabilidade') || d.title.toLowerCase().includes('livro caixa') || d.title.toLowerCase().includes('balancete')
  );

  const getActiveList = () => {
    switch (activeSubTab) {
      case 'declarations':
        return declarationDocs;
      case 'guides':
        return guideDocs;
      case 'certificates':
        return certificateDocs;
      case 'accounting':
        return accountingDocs;
      default:
        return nfeDocs;
    }
  };

  const currentList = getActiveList().filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.invoiceNumber?.toLowerCase().includes(q) ||
      d.accessKey?.toLowerCase().includes(q) ||
      d.originalFileName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="content-container">
      {/* Cabeçalho */}
      <div className="view-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="view-title">Fiscal & Contábil</h1>
            <span
              style={{
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary-dark)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '12px',
                border: '1px solid var(--primary-border)',
              }}
            >
              Consulta Transversal Fiscal • Seção 12
            </span>
          </div>
          <p className="view-subtitle">
            Central de notas fiscais (entrada, saída e serviços), guias tributárias (ITR, DARF, Funrural), declarações rurais e regularidades cadastrais integradas à contabilidade.
          </p>
        </div>
      </div>

      {/* Navegação por Módulos Fiscais */}
      <div className="tabs-container" style={{ marginBottom: '20px' }}>
        <button
          className={`tab-btn ${activeSubTab === 'all_nfe' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('all_nfe')}
        >
          Notas Fiscais (NF-e) ({nfeDocs.length})
        </button>
        <button
          className={`tab-btn ${activeSubTab === 'declarations' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('declarations')}
        >
          Declarações Rurais (ITR / LCDPR) ({declarationDocs.length})
        </button>
        <button
          className={`tab-btn ${activeSubTab === 'guides' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('guides')}
        >
          Guias & Tributos ({guideDocs.length})
        </button>
        <button
          className={`tab-btn ${activeSubTab === 'certificates' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('certificates')}
        >
          Certidões & Regularidade ({certificateDocs.length})
        </button>
      </div>

      {/* Busca */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: '18px' }}>
        <div className="global-search-container" style={{ maxWidth: '450px' }}>
          <Search size={16} className="search-icon-pos" />
          <input
            type="text"
            className="global-search-input"
            placeholder="Buscar por número da NF, chave de 44 dígitos, emitente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de Registros Fiscais */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {currentList.length === 0 ? (
          <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-subtle)' }}>
            Nenhum documento fiscal encontrado nesta seção.
          </div>
        ) : (
          currentList.map((doc) => (
            <div
              key={doc.id}
              className="card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ReceiptText size={20} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '14.5px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                      {doc.title}
                    </h4>
                    {doc.invoiceNumber && (
                      <span
                        style={{
                          backgroundColor: '#EFF6FF',
                          color: '#1E40AF',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                        }}
                      >
                        Nº {doc.invoiceNumber}
                      </span>
                    )}
                    <span
                      style={{
                        backgroundColor: '#F3F4F6',
                        color: '#4B5563',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '12px',
                      }}
                    >
                      {doc.category}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-subtle)',
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>Emissão: {formatDateBR(doc.issueDate)}</span>
                    {doc.valueCents ? (
                      <span>
                        Valor Fiscal: <strong style={{ color: 'var(--primary-dark)' }}>{formatCurrencyBRL(doc.valueCents)}</strong>
                      </span>
                    ) : null}
                    {doc.accessKey && (
                      <span>
                        Chave: <code style={{ fontSize: '11px' }}>{doc.accessKey.slice(0, 15)}...</code>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPreviewFile(doc)}
                title="Pré-visualizar Documento Fiscal"
              >
                <Eye size={15} />
                <span>Ver Arquivo</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
