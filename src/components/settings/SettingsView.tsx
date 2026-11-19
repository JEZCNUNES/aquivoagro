import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  RotateCcw,
  Shield,
  Database,
  Cloud,
  CheckCircle,
  Copy,
  Lock,
  Layers,
  AlertTriangle,
  History,
  Tag,
  KeyRound,
  FileCheck2,
  Mail,
  Zap,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { resetDemoData, auditLogs, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'audit' | 'taxonomies' | 'integrations'>('general');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const supabaseSqlSchema = `-- AgroArquivo: Esquema SQL para PostgreSQL + Supabase (LSA ERP Rural V1.0)

-- 1. Organização / Workspace Multicliente
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Membros e Permissões (Operador LSA, Validador, Gestor, Produtor)
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT CHECK (role IN ('operador_lsa', 'validador_lsa', 'gestor_lsa', 'produtor')) DEFAULT 'operador_lsa',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Documento Lógico Único (DOC-01)
CREATE TABLE logical_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL,
  sub_type TEXT,
  issue_date DATE,
  valid_until DATE,
  validation_status TEXT CHECK (validation_status IN ('draft', 'pending_validation', 'validated', 'published', 'cancelled', 'replaced')),
  source TEXT CHECK (source IN ('upload', 'email', 'integracao', 'portal')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Vínculos Documentais Relacionais (DOC-03)
CREATE TABLE document_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES logical_documents(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'property', 'equipment', 'party', 'contract', 'purchase', etc.
  entity_id UUID NOT NULL,
  relation_type TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Contratos (CON-01)
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  number_ref TEXT,
  contract_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  amount_cents BIGINT,
  status TEXT CHECK (status IN ('active', 'expiring', 'expired', 'renewed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Eventos de Auditoria Imutáveis (SYS-01)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT now(),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details TEXT NOT NULL
);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(supabaseSqlSchema);
    setCopiedSql(true);
    showToast('Script SQL copiado com sucesso!');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="content-container">
      {/* Cabeçalho */}
      <div className="view-header">
        <div>
          <h1 className="view-title">Configurações & Governança do Sistema</h1>
          <p className="view-subtitle">
            Auditoria de alterações (SYS-01), controle de taxonomias governadas, perfis de acesso LSA e integração de banco de dados.
          </p>
        </div>
      </div>

      {/* Sub-abas de Configurações */}
      <div className="tabs-container" style={{ marginBottom: '24px' }}>
        <button
          className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          Visão Geral & Sessão
        </button>
        <button
          className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          Trilha de Auditoria (SYS-01) ({auditLogs.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'taxonomies' ? 'active' : ''}`}
          onClick={() => setActiveTab('taxonomies')}
        >
          Taxonomias & Categorias Canônicas
        </button>
        <button
          className={`tab-btn ${activeTab === 'integrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('integrations')}
        >
          Integrações & Supabase DDL
        </button>
      </div>

      {/* Aba 1: Geral */}
      {activeTab === 'general' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Perfil Ativo */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Shield size={18} color="var(--primary)" /> Perfil Operacional e Organização
              </div>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Operador / Usuário</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                  Roberto Mendonça
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>roberto@agromendonca.com.br</div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Organização Rural</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                  Agro Mendonça & Associados
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>Sorriso - Mato Grosso</div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Perfil LSA</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-dark)', marginTop: '2px' }}>
                  Validador & Produtor
                </div>
                <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>Permissão Total</div>
              </div>
            </div>
          </div>

          {/* Restaurar Base */}
          <div className="card" style={{ borderLeft: '4px solid #16A34A' }}>
            <div className="card-header">
              <div className="card-title">
                <RotateCcw size={18} color="var(--primary)" /> Restaurar Base LSA ERP Rural
              </div>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '16px', maxWidth: '680px' }}>
              Caso tenha testado validações, adicionado compras ou resolvido duplicidades, você pode restabelecer a base integral demonstrativa (com todas as fazendas, contratos, estoques e notas fiscais) a qualquer instante.
            </p>

            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="btn btn-secondary"
            >
              <RotateCcw size={16} /> Restaurar dados de demonstração
            </button>
          </div>
        </div>
      )}

      {/* Aba 2: Trilha de Auditoria (SYS-01) */}
      {activeTab === 'audit' && (
        <div className="card" style={{ padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <div className="card-title">
              <History size={18} color="var(--primary)" /> Histórico Imutável de Auditoria (SYS-01)
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
              Princípio P-07: Rastreabilidade de validações, liquidações e criação de contratos
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {auditLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '14px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        backgroundColor:
                          log.action === 'Validação'
                            ? '#DCFCE7'
                            : log.action === 'Rateio Fechado'
                            ? '#EFF6FF'
                            : '#FEF3C7',
                        color:
                          log.action === 'Validação'
                            ? '#166534'
                            : log.action === 'Rateio Fechado'
                            ? '#1E40AF'
                            : '#92400E',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px',
                      }}
                    >
                      {log.action}
                    </span>
                    <strong style={{ fontSize: '13.5px', color: 'var(--text-main)' }}>
                      {log.entityTitle}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                      ({log.entityType})
                    </span>
                  </div>

                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {log.details}
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                    {log.actor}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '2px' }}>
                    {log.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aba 3: Governança de Taxonomias */}
      {activeTab === 'taxonomies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Tag size={18} color="var(--primary)" /> Vocabulário Controlado & Categorias Canônicas (Seção 8 e 17)
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Para garantir consistência e evitar dispersão de dados, os operadores LSA utilizam categorias pré-cadastradas. Categorias de texto livre não são permitidas sem aprovação de governança.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
              }}
            >
              <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '8px' }}>
                  Categorias de Compra (PUR-01)
                </h4>
                <ul style={{ fontSize: '12px', color: 'var(--text-main)', paddingLeft: '18px', lineHeight: 1.8 }}>
                  <li>Defensivos Químicos (Fungicidas, Herbicidas)</li>
                  <li>Sementes & Material Propagativo</li>
                  <li>Nutrição & Fertilidade (Fertilizantes/Corretivos)</li>
                  <li>Biológicos & Adjuvantes</li>
                  <li>Máquinas, Implementos & Peças</li>
                  <li>Combustíveis & Lubrificantes (Diesel S10)</li>
                  <li>Fretes, Logística & Armazenagem</li>
                </ul>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '8px' }}>
                  Tipos de Contratos (CON-01)
                </h4>
                <ul style={{ fontSize: '12px', color: 'var(--text-main)', paddingLeft: '18px', lineHeight: 1.8 }}>
                  <li>Arrendamento Rural (Áreas Terceiros)</li>
                  <li>Parceria Agrícola</li>
                  <li>Fornecimento & Barter de Insumos</li>
                  <li>Venda de Produção (Contratos Futuros de Soja/Milho)</li>
                  <li>Financiamento / Cédula de Produto Rural (CPR)</li>
                  <li>Apólices de Seguro Multirrisco</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aba 4: Integrações e Supabase DDL */}
      {activeTab === 'integrations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Database size={18} color="var(--primary)" /> Esquema DDL para Supabase (PostgreSQL + RLS)
              </div>
              <button onClick={handleCopySql} className="btn btn-outline-green btn-sm">
                <Copy size={14} /> {copiedSql ? 'Copiado!' : 'Copiar DDL SQL'}
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Base alinhada às entidades canônicas do LSA ERP Rural V1.0 (DOC-01, CON-01, PUR-01, SYS-01).
            </p>
            <pre
              style={{
                backgroundColor: '#0F172A',
                color: '#E2E8F0',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '11.5px',
                fontFamily: 'monospace',
                overflowX: 'auto',
                maxHeight: '340px',
              }}
            >
              {supabaseSqlSchema}
            </pre>
          </div>
        </div>
      )}

      {/* Modal Confirmação Reset */}
      {isResetConfirmOpen && (
        <div className="modal-overlay" onClick={() => setIsResetConfirmOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div className="modal-title" style={{ color: '#DC2626' }}>
                Confirmar Restauração LSA
              </div>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <AlertTriangle size={24} color="#DC2626" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: '13.5px', color: 'var(--text-main)' }}>
                  Tem certeza que deseja restaurar a base de dados demonstrativa? Todos os registros manipulados serão redefinidos para o estado padrão aprovado pela LSA.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setIsResetConfirmOpen(false)} className="btn btn-secondary">
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setIsResetConfirmOpen(false);
                }}
                className="btn btn-danger"
              >
                Sim, restaurar base
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
