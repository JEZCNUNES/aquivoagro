# 🌾 AgroArquivo — Organização Documental e Controle Financeiro Rural

Plataforma web completa, moderna e responsiva voltada para a gestão de documentos fiscais, controle financeiro de fluxo de caixa e patrimônio mecânico do produtor rural brasileiro.

![Identidade Visual](https://img.shields.io/badge/Identidade-Verde%20e%20Branco-16A34A?style=for-the-badge)
![React](https://img.shields.io/badge/React%2019-TypeScript-14532D?style=for-the-badge)
![Moeda](https://img.shields.io/badge/Moeda-BRL%20(R$)-16A34A?style=for-the-badge)
![Modo](https://img.shields.io/badge/Modo-Demonstra%C3%A7%C3%A3o%20em%20Mem%C3%B3ria-22C55E?style=for-the-badge)

---

## ⚡ Como Rodar Localmente

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Abra no navegador:
   **`http://localhost:5173/`**

---

## 🎨 Identidade Visual (Verde & Branco)

- **Branco (`#FFFFFF`)**: Fundo principal e miolo de cartões.
- **Verde-escuro (`#14532D`)**: Menu lateral recolhível, títulos e cabeçalhos.
- **Verde vibrante (`#16A34A`)**: Botões de ação primária, ícones ativos e destaques positivos.
- **Verde bem claro (`#F0FDF4`)**: Fundos auxiliares, tags e linhas selecionadas.
- **Cinza-escuro (`#1F2937`)**: Textos e tabelas de alta legibilidade.
- **Cinza-claro (`#E5E7EB`)**: Divisórias e bordas sutis.

---

## 🚜 Módulos e Funcionalidades

### 1. Painel Principal (HUD Gerencial)
- **Filtros**: Período (*Últimos 30 dias, 90 dias, Ano Atual, Histórico Completo*), Propriedade (*Todas as propriedades, Fazenda Santa Luzia, Fazenda Boa Esperança*) e Safra (*Safra 2026/2027, Safra 2025/2026*).
- **9 Indicadores em Tempo Real**:
  1. *Saldo Disponível*
  2. *Resultado de Caixa do Período* (Receitas recebidas - Despesas pagas)
  3. *Receitas Recebidas*
  4. *Despesas Pagas*
  5. *Contas a Pagar* (Em aberto)
  6. *Contas a Receber* (Em aberto)
  7. *Contas em Atraso* (Valor e contagem com alerta visual)
  8. *Documentos Ativos*
  9. *Inclusões no Período*
- **Resumo Operacional da Propriedade (Cálculos Automáticos sem IA Simulada)**:
  - Categoria com maior concentração de despesas.
  - Total a vencer nos próximos 7 dias.
  - Documentos sem classificação pendentes.
  - Máquina com maior gasto em manutenção registrado.
- **Gráficos em Tons de Verde**:
  - Comparativo semestral de Receitas vs Despesas realizadas por mês.
  - Distribuição percentual de despesas por categoria.
- **Blocos de Alerta**: Documentos recentes, próximas contas a vencer e atalhos rápidos.

### 2. Central de Documentos
- Alternância entre visualização em **Tabela** e em **Cartões (Grid)**.
- 12 categorias fiscais e patrimoniais rurais (Notas fiscais de compras, vendas, peças, combustíveis, insumos, contratos, certidões fundiárias CAR/CCIR/ITR/Matrícula, etc.).
- Busca por título, fornecedor, número de nota fiscal e tags.
- Filtros por categoria, propriedade e status documental (*Organizado, Pendente de Classificação, Arquivado*).
- Ações em lote (*Marcar como Organizados, Arquivar Selecionados*).
- **Painel Lateral (Drawer)**:
  - Metadados completos, número da NF, chave de 44 dígitos, safra e observações.
  - Vínculos em destaque com a **Propriedade**, com a **Máquina** e com o **Lançamento Financeiro**.
  - Ações de visualização prévia, download de arquivo da sessão, arquivar e restaurar.

### 3. Fluxo de Inclusão de Documentos (Wizard em 7 Etapas)
1. **Seleção de Arquivos**: Drag and Drop ou seletor de arquivos (PDF, JPG, PNG, XML até 20 MB).
2. **Conferência**: Alerta de possível duplicidade por nome e tamanho com mensagem amigável.
3. **Preenchimento dos Dados**: Título, valor em R$, data de emissão, número da NF, chave de acesso, safra e tags.
4. **Categoria e Propriedade**: Vinculação à fazenda correspondente e classificação fundiária.
5. **Vínculo Patrimonial**: Associação direta ao trator, colheitadeira ou caminhão.
6. **Lançamento Financeiro Integrado**: Opção explícita de gerar a conta a pagar ou a receber.
7. **Confirmação**: Registro na sessão em memória.

### 4. Controle Financeiro
- Sub-abas: **Contas a Pagar**, **Contas a Receber** e **Movimentações Realizadas**.
- Ação **"Marcar como Pago"**: Confirmação da data efetiva da quitação e do método (Pix, Boleto, Transferência, etc.), atualizando imediatamente o saldo disponível.
- Ação **"Reabrir Lançamento"**.
- Exportação dos dados filtrados para arquivo **CSV** (delimitador `;` e codificação UTF-8 com BOM).

### 5. Veículos e Máquinas (Patrimônio Rural)
- Cadastro de 6 equipamentos demonstrativos (Tratores John Deere, Colheitadeira Case IH Axial-Flow, Caminhão Volvo FH, Hilux SRV, Pulverizador Jacto Uniport, Plantadeira Stara).
- **Dossiê Individual de Cada Bem**:
  - Custos separados: **Aquisição**, **Peças & Manutenção**, **Combustível / Óleo** e **Gasto Total Acumulado**.
  - Lista de todas as notas fiscais vinculadas ao bem.
  - Histórico cronológico unificado.
  - Atalho rápido para cadastrar nova despesa ou nota para aquela máquina.

### 6. Fornecedores e Clientes
- Cadastro de revendas de peças, distribuidoras de diesel, cooperativas e tradings compradoras de grãos.
- Consulta individual com histórico de notas e lançamentos de cada parceiro.

### 7. Relatórios
- 6 demonstrativos analíticos:
  1. *Fluxo de Caixa Realizado (Entradas e Saídas).*
  2. *Demonstrativo por Propriedade Rural.*
  3. *Despesas por Categoria.*
  4. *Custos por Veículo e Máquina.*
  5. *Documentos por Categoria.*
  6. *Contas em Aberto e Atrasadas.*
- Botão funcional de **Exportação CSV** e layout de **Impressão** otimizado (`window.print()`).

### 8. Configurações & Arquitetura Supabase
- Restauração completa da base inicial de demonstração em 1 clique.
- Exibição de perfil e organização demonstrativa.
- Documentação técnica e script SQL para migração futura ao Supabase (Auth, Storage Privado com URLs assinadas e Row Level Security).

---

## 📦 Estrutura de Arquivos

```
GIT PRONTO/
├── public/                 # Favicon e arquivos estáticos
├── src/
│   ├── components/         # Componentes modulares
│   │   ├── common/         # Badges, modais e pré-visualizadores
│   │   ├── dashboard/      # HUD e gráficos gerenciais
│   │   ├── documents/      # Central de documentos e wizard de inclusão
│   │   ├── equipment/      # Veículos, máquinas e dossiês
│   │   ├── financial/      # Contas a pagar, receber e movimentações
│   │   ├── layout/         # Header, Sidebar e Notificações
│   │   ├── parties/        # Fornecedores e clientes
│   │   ├── properties/     # Propriedades e dossiê da fazenda
│   │   ├── reports/        # Relatórios, exportação CSV e impressão
│   │   ├── search/         # Busca global instantânea
│   │   └── settings/       # Configurações e guia Supabase
│   ├── context/            # Estado global (AppContext)
│   ├── data/               # Base de dados demonstrativa inicial
│   ├── types/              # Definições TypeScript
│   ├── utils/              # Cálculos matemáticos em centavos e formatadores
│   ├── App.tsx             # Componente raiz
│   ├── index.css           # Design System Vanilla CSS (Verde e Branco)
│   └── main.tsx            # Ponto de entrada React
├── index.html              # HTML com tipografia e metadados
├── package.json            # Dependências e scripts
├── tsconfig.json           # Configurações do TypeScript
└── vite.config.ts          # Configuração Vite com base relativa
```
