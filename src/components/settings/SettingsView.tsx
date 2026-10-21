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
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { resetDemoData, showToast } = useApp();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const supabaseSqlSchema = `-- AgroArquivo: Esquema SQL Futuro para Supabase (PostgreSQL + RLS)

-- 1. Tabela de Organizações
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Membros e Permissões (Perfis: admin, collaborator, viewer)
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'collaborator', 'viewer')) DEFAULT 'collaborator',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- 3. Propriedades Rurais
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state VARCHAR(2) NOT NULL,
  area_hectares NUMERIC(10,2) NOT NULL,
  responsible TEXT,
  main_crops TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Veículos e Máquinas (Patrimônio)
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  year INT,
  plate_or_serial TEXT,
  acquisition_date DATE,
  acquisition_value_cents BIGINT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Fornecedores e Clientes
CREATE TABLE entity_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('supplier', 'client', 'both')) DEFAULT 'supplier',
  contact TEXT,
  city TEXT,
  state VARCHAR(2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Documentos Fiscais e Cadastrais
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE RESTRICT,
  party_id UUID REFERENCES entity_parties(id) ON DELETE SET NULL,
  equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  original_file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Caminho privado no Supabase Storage
  file_type TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  category TEXT NOT NULL,
  property_subtype TEXT,
  issue_date DATE NOT NULL,
  value_cents BIGINT,
  invoice_number TEXT,
  access_key VARCHAR(44),
  crop_season TEXT,
  tags TEXT[],
  expiration_date DATE,
  status TEXT CHECK (status IN ('pending', 'organized', 'archived')) DEFAULT 'organized',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Lançamentos Financeiros (Fluxo de Caixa)
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE RESTRICT,
  party_id UUID REFERENCES entity_parties(id) ON DELETE SET NULL,
  equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  amount_cents BIGINT NOT NULL,
  category TEXT NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  status TEXT CHECK (status IN ('open', 'paid')) DEFAULT 'open',
  payment_method TEXT,
  crop_season TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Políticas de Segurança (Row Level Security - RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- Exemplo de Política RLS: Usuário acessa apenas registros da sua organização
CREATE POLICY "Acesso apenas membros da organização" ON properties
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(supabaseSqlSchema);
    setCopiedSql(true);
    showToast('Esquema SQL copiado para a área de transferência!');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="content-container">
      {/* Cabeçalho */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Configurações do Sistema</h1>
          <p className="page-description">
            Gerencie preferências, restaure a base demonstrativa e conheça o plano arquitetural de integração com o Supabase.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Bloco 1: Perfil Demonstrativo e Organização */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Shield size={18} color="var(--primary)" /> Perfil e Organização Demonstrativa
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
            }}
          >
            <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Usuário Ativo</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-dark)', marginTop: '2px' }}>
                Roberto Mendonça
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>roberto@agromendonca.com.br</div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Organização / Grupo</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-dark)', marginTop: '2px' }}>
                Agropecuária Mendonça Ltda
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>CNPJ: 14.821.902/0001-44</div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Nível de Acesso</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-dark)', marginTop: '2px' }}>
                Administrador da Propriedade
              </div>
              <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>Permissão Total</div>
            </div>
          </div>
        </div>

        {/* Bloco 2: Gestão da Base de Demonstração */}
        <div className="card" style={{ borderLeft: '4px solid #16A34A' }}>
          <div className="card-header">
            <div className="card-title">
              <RotateCcw size={18} color="var(--primary)" /> Restaurar Base Demonstrativa
            </div>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '16px', maxWidth: '680px' }}>
            Caso tenha modificado registros, adicionado novas notas ou marcado despesas como pagas durante seus testes, você pode reiniciar todos os dados para o estado original de demonstração a qualquer momento.
          </p>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="btn btn-secondary"
            id="btn-open-reset-demo"
          >
            <RotateCcw size={16} /> Restaurar dados de demonstração
          </button>
        </div>

        {/* Bloco 3: Arquitetura e Integração Futura com Supabase */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Database size={18} color="var(--primary)" /> Integração Futura com Supabase
            </div>
            <button
              onClick={handleCopySql}
              className="btn btn-outline-green btn-sm"
              title="Copiar script SQL"
            >
              <Copy size={14} /> {copiedSql ? 'Copiado!' : 'Copiar DDL SQL'}
            </button>
          </div>

          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            O AgroArquivo foi arquitetado seguindo rigorosamente a separação de responsabilidades (Clean Architecture). Os repositórios em memória desta versão possuem as mesmas interfaces necessárias para conexão direta com o Supabase.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '6px' }}>
                <Lock size={16} color="var(--primary)" /> Supabase Auth & Perfis
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Autenticação segura via e-mail/senha ou OTP. Suporte a papéis de <em>Administrador</em> (produtor/proprietário), <em>Colaborador</em> (capataz/gerente operacional) e <em>Consulta</em> (contador/agrônomo).
              </p>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '6px' }}>
                <Cloud size={16} color="var(--primary)" /> Storage Privado & URLs Assinadas
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Bucket privado <code style={{ backgroundColor: '#E2E8F0', padding: '2px 4px', borderRadius: '3px' }}>farm-documents</code>. Arquivos protegidos são acessados exclusivamente por links temporários com tempo de expiração programado (Signed URLs).
              </p>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '6px' }}>
                <Layers size={16} color="var(--primary)" /> Row Level Security (RLS)
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Isolamento estrito multi-inquilino (multi-tenant) a nível de banco de dados. Um produtor jamais terá visibilidade sobre notas ou finanças de outra organização.
              </p>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '6px' }}>
              Esquema DDL de Tabelas PostgreSQL (Pronto para Supabase SQL Editor):
            </div>
            <pre
              style={{
                backgroundColor: '#0F172A',
                color: '#E2E8F0',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '11.5px',
                fontFamily: 'monospace',
                overflowX: 'auto',
                maxHeight: '260px',
              }}
            >
              {supabaseSqlSchema}
            </pre>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Restauração */}
      {isResetConfirmOpen && (
        <div className="modal-overlay" onClick={() => setIsResetConfirmOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div className="modal-title" style={{ color: '#DC2626' }}>
                Confirmar Restauração
              </div>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <AlertTriangle size={24} color="#DC2626" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: '13.5px', color: 'var(--text-main)' }}>
                  Tem certeza que deseja restaurar a base de dados demonstrativa? Todos os documentos e lançamentos adicionados durante a sessão atual serão substituídos pelos dados originais.
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
                id="btn-confirm-reset-demo"
              >
                Sim, restaurar dados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
