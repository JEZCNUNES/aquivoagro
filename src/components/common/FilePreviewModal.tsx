import React from 'react';
import { DocumentRecord } from '../../types';
import { formatFileSize, formatDate, formatCurrency } from '../../utils/formatters';
import { X, Download, FileText, AlertCircle, FileCode, Eye } from 'lucide-react';

interface FilePreviewModalProps {
  document: DocumentRecord | null;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  document,
  onClose,
}) => {
  if (!document) return null;

  const handleDownload = () => {
    if (document.fileDataUrl) {
      const a = window.document.createElement('a');
      a.href = document.fileDataUrl;
      a.download = document.originalFileName;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content wide"
        onClick={(e) => e.stopPropagation()}
        style={{ height: '88vh' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              <FileText size={20} />
            </div>
            <div>
              <div className="modal-title" style={{ fontSize: '16px' }}>
                {document.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {document.originalFileName} • {formatFileSize(document.fileSizeBytes)} • {document.fileType.toUpperCase()}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-icon-round"
            title="Fechar visualizador"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="modal-body"
          style={{
            backgroundColor: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflow: 'auto',
          }}
        >
          {document.fileDataUrl && (document.fileType === 'jpg' || document.fileType === 'png') ? (
            <img
              src={document.fileDataUrl}
              alt={document.title}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              }}
            />
          ) : document.fileType === 'xml' ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#1E293B',
                color: '#E2E8F0',
                padding: '20px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '12.5px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                border: '1px solid #334155',
              }}
            >
              <div style={{ color: '#38BDF8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileCode size={16} /> Estrutura XML da Nota Fiscal Eletrônica (Visualização segura)
              </div>
              {`<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe${document.accessKey || '51240901234567000199550010000120441001204412'}">
      <ide>
        <nNF>${document.invoiceNumber || '1042'}</nNF>
        <dhEmi>${document.issueDate}T10:30:00-03:00</dhEmi>
        <tpNF>1</tpNF>
      </ide>
      <emit>
        <xNome>${document.title}</xNome>
      </emit>
      <total>
        <ICMSTot>
          <vNF>${((document.valueCents || 0) / 100).toFixed(2)}</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`}
            </div>
          ) : (
            /* Simulador Visual de PDF para demonstração */
            <div
              style={{
                width: '100%',
                maxWidth: '620px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '36px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                color: '#1F2937',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '2px solid #16A34A',
                  paddingBottom: '16px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#14532D' }}>
                    DOCUMENTO FISCAL / REGISTRO RURAL
                  </h3>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>
                    AgroArquivo • Demonstração Local
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                    {document.invoiceNumber ? `NF-e Nº ${document.invoiceNumber}` : document.category}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    Emissão: {formatDate(document.issueDate)}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '20px', fontSize: '13.5px' }}>
                <p><strong>Descrição:</strong> {document.title}</p>
                <p><strong>Categoria:</strong> {document.category}</p>
                {document.propertySubtype && (
                  <p><strong>Subtipo de Imóvel:</strong> {document.propertySubtype}</p>
                )}
                {document.valueCents && (
                  <p><strong>Valor Registrado:</strong> <span style={{ color: '#16A34A', fontWeight: 'bold' }}>{formatCurrency(document.valueCents)}</span></p>
                )}
                {document.accessKey && (
                  <p style={{ wordBreak: 'break-all' }}><strong>Chave de Acesso:</strong> {document.accessKey}</p>
                )}
                {document.expirationDate && (
                  <p><strong>Validade do Documento:</strong> {formatDate(document.expirationDate)}</p>
                )}
                {document.notes && (
                  <p style={{ marginTop: '10px', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                    <em>Obs: {document.notes}</em>
                  </p>
                )}
              </div>

              {document.isSimulated && (
                <div
                  style={{
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    fontSize: '12.5px',
                    color: '#92400E',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Arquivo demonstrativo:</strong> O arquivo original não foi carregado nesta sessão. Na versão conectada com Supabase Storage, o PDF real estará armazenado e disponível para download seguro.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Status de Organização: <strong>{document.status === 'organized' ? 'Organizado' : document.status === 'pending' ? 'Pendente' : 'Arquivado'}</strong>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {document.fileDataUrl ? (
              <button onClick={handleDownload} className="btn btn-primary btn-sm">
                <Download size={15} /> Baixar Arquivo da Sessão
              </button>
            ) : (
              <span style={{ fontSize: '12px', color: 'var(--text-subtle)', alignSelf: 'center' }}>
                Arquivo não disponível na demonstração
              </span>
            )}
            <button onClick={onClose} className="btn btn-secondary btn-sm">
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
