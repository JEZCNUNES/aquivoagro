# 🌾 LSA AGRO — ERP Rural & Gestão Documental

Plataforma web completa, moderna e responsiva voltada para a organização documental, controle financeiro de fluxo de caixa, gestão patrimonial e governança da operação rural brasileira.

![Identidade Visual](https://img.shields.io/badge/Identidade-Verde%20e%20Branco-16A34A?style=for-the-badge)
![React](https://img.shields.io/badge/React%2019-TypeScript-14532D?style=for-the-badge)
![Moeda](https://img.shields.io/badge/Moeda-BRL%20(R$)-16A34A?style=for-the-badge)
![Arquitetura](https://img.shields.io/badge/LSA%20ERP-Taxonomia%20V1.0-22C55E?style=for-the-badge)

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

3. Abra no seu navegador:
   **`http://localhost:5173/`**

---

## 🎨 Identidade Visual (Verde & Branco Mandatória)

O design foi concebido com base na referência de software agro de alta precisão:
- **Branco (`#FFFFFF`)**: Fundo principal e miolo de cartões.
- **Verde-escuro (`#14532D`)**: Menu lateral recolhível, tipografia de títulos e cabeçalhos.
- **Verde vibrante (`#16A34A`)**: Botões de ação primária, ícones ativos e destaques positivos.
- **Verde bem claro (`#F0FDF4`)**: Fundos auxiliares, tags e linhas selecionadas.
- **Cinza-escuro (`#1F2937`)**: Textos e tabelas de alta legibilidade.
- **Cinza-claro (`#E5E7EB`)**: Divisórias e bordas sutis.

---

## 🏛️ Arquitetura de Navegação & Taxonomia Documental (LSA V0.1 / V1.0)

O sistema segue o **Princípio-Mãe da LSA**: *a barra lateral não representa onde o arquivo mora fisicamente, mas sim como o produtor e o operador chegam naturalmente à informação*. O documento lógico é único (**DOC-01 + DOC-02**); os caminhos de acesso são múltiplos através de vínculos relacionais (**DOC-03**).

### 📌 1. Visão e Trabalho (Entrada Operacional)
- **Visão Geral / Painel do Produtor**:
  - **Selo de Confiabilidade da Base (Porta de Qualidade LSA)**: Exibe a integridade oficial com `% Validado`, `% Rateio Fechado`, `% Conciliado` e `% Vinculado`.
  - **9 Indicadores HUD**: Saldo Disponível, Resultado de Caixa, Receitas Recebidas, Despesas Pagas, Contas a Pagar/Receber, Contas Atrasadas, Documentos Ativos e Inclusões.
  - Drill-down direto de cada indicador para o respectivo módulo.
- **Caixa de Entrada Operacional**:
  - Fila transitória de arquivos recebidos por upload, e-mail ou portal.
  - Abas: *Novos / Não Tratados*, *Aguardando Classificação*, *Aguardando Vínculo*, *Aguardando Validação* e *Possível Duplicidade*.
  - Ações de 1 clique para validação formal, resolução de duplicidades e vinculação de propriedades/máquinas.
- **Fila de Pendências**:
  - Classificadas em *Documentais*, *Cadastrais*, *Contratuais*, *Financeiras (Rateios Incompletos)* e *Administrativas*.
- **Central de Vencimentos**:
  - Agenda transversal unificada cobrindo janelas de risco em **7, 30, 60 e 90 dias** para contratos, apólices de seguro, certidões fundiárias e contas a pagar/receber.
- **Agenda / Tarefas**:
  - Gestão de rotinas administrativas do backoffice com níveis de prioridade e responsáveis.

### 👤 2. Estrutura do Cliente
- **Cliente & Pessoas (Governança ID-01)**:
  - Cadastro canônico de partes sem duplicação: titular, sócios-participantes, cônjuge, procuradores legais e equipe de campo.
  - Dossiê 360° da parte com dados cadastrais, certidões com validade, contratos em que participa e documentos correlatos.
- **Propriedades Rurais**:
  - Segmentação fundiária por regime de uso: *Áreas Próprias*, *Áreas Arrendadas* (**Fazenda Santa Cecília**), *Áreas em Parceria* e *Inativas*.
  - Dossiê em 10 coleções: Visão Geral, Cadastro & Localização, Fundiário (Matrículas/Escrituras/CCIR), Ambiental (CAR/Licenças), Fiscal Rural (ITR/Guias), Contratos da Propriedade, Financeiro Vinculado, Patrimônio Alocado e Acervo Completo.
- **Patrimônio & Infraestrutura**:
  - Cadastro e dossiê de tratores, colhedoras, pulverizadores, implementos, caminhões, utilitários e infraestrutura (armazéns/silos).

### 🛒 3. Negócios & Operações
- **Compras & Fornecedores**:
  - Dois caminhos complementares de consulta: por **Contraparte Fornecedora** e por **Categoria Canônica de Compra** (*Defensivos Químicos, Sementes, Nutrição & Fertilidade, Peças, Combustíveis, Serviços, etc.*).
  - Dossiê de Defensivos Químicos com rastreio de ordens de compra, NFs vinculadas e cumprimento físico (**Entregas na Fazenda vs Saldo Retido no Fornecedor**).
- **Estoques & Saldos**:
  - Diferenciação precisa entre **Estoque Físico** (no barracão da fazenda) e **Saldo no Fornecedor / Armazéns Gerais**.
- **Comercialização da Safra**:
  - Acompanhamento da venda de grãos (Soja e Milho) com volume negociado em sacas, fixações de preço, entregas físicas no armazém e liquidações financeiras recebidas.

### 💰 4. Finanças & Conformidade
- **Financeiro & Crédito Rural**:
  - Contas a pagar, contas a receber, conciliação e garantia de **Rateio Gerencial Fechado (100%)** por Propriedade, Safra, Cultura, Centro de Custo e Categoria.
- **Fiscal & Contábil**:
  - Central transversal de Notas Fiscais (NF-e de entrada, saída e serviços), Declarações Rurais (ITR, LCDPR), Guias (DARF, Funrural) e Certidões Negativas.
- **Seguros Rurais & Patrimoniais**:
  - Apólices de seguro agrícola multirrisco de lavoura e proteção de maquinário com controle de vigência e capitais segurados.

### 📁 5. Documentos & Contratos
- **Central de Documentos**: Acervo transversal completo com busca avançada por metadados combinados.
- **Central de Contratos Transversal (ADR-03)**:
  - Consulta unificada de contratos de arrendamento, parceria, fornecimento, venda futura de grãos, CPR/financiamento e seguros sem duplicar registros.
- **Relatórios & Análise**: Demonstrativos de safra, custos por propriedade e comparativos entre períodos.

### ⚙️ 6. Sistema & Governança
- **Trilha de Auditoria (SYS-01)**: Histórico imutável de alterações (quem fez, data/hora, ação realizada e detalhes).
- **Taxonomias & Categorias Canônicas**: Vocabulário controlado para evitar dispersão de dados.
- **Esquema DDL para Supabase**: Estrutura pronta para PostgreSQL com Row Level Security (RLS).

---

## 🔍 Busca Global Onipresente (Atalho: `Ctrl + K`)

Permite localizar em uma única consulta instantânea:
- Propriedades (*ex: "Santa Cecília"* ou *"Santa Luzia"*)
- Contratos (*ex: "Arrendamento"* ou *"ARR-2024"*)
- Documentos e Notas Fiscais (*ex: "NF 15328"* ou chave de 44 dígitos)
- Máquinas e Frotas (*ex: "6110M"*, *"Case"* ou *"Volvo"*)
- Compras e Insumos (*ex: "Agrofértil"* ou *"Fungicida Elatus"*)
- Pessoas, Sócios e Parceiros

---

## 📦 Estrutura de Diretórios

```
GIT PRONTO/
├── public/                 # Favicon e arquivos públicos
├── src/
│   ├── components/         # Módulos da aplicação
│   │   ├── commercial/     # Vendas de grãos e fixações
│   │   ├── common/         # Badges e modais
│   │   ├── contracts/      # Central transversal de contratos
│   │   ├── dashboard/      # HUD gerencial e Selo de Confiabilidade
│   │   ├── documents/      # Central documental e fluxo de upload
│   │   ├── equipment/      # Patrimônio mecânico e dossiês
│   │   ├── financial/      # Contas a pagar/receber e rateios
│   │   ├── fiscal/         # NF-e transversal, ITR e certidões
│   │   ├── inbox/          # Caixa de entrada, pendências, vencimentos e tarefas
│   │   ├── insurance/      # Apólices de seguro rural e maquinário
│   │   ├── inventory/      # Estoque físico vs saldo no fornecedor
│   │   ├── layout/         # Header com breadcrumb, Sidebar e notificações
│   │   ├── parties/        # Cliente, sócios, equipe e fornecedores
│   │   ├── properties/     # Propriedades e dossiê em 10 coleções
│   │   ├── purchases/      # Compras e insumos agrícolas
│   │   ├── reports/        # Relatórios e exportação CSV
│   │   ├── search/         # Busca global onipresente (Ctrl+K)
│   │   └── settings/       # Auditoria SYS-01, taxonomias e DDL Supabase
│   ├── context/            # Estado global (AppContext)
│   ├── data/               # Bases de dados demonstrativas (seedData e lsaData)
│   ├── types/              # Definições canônicas TypeScript (V1.0)
│   ├── utils/              # Indicadores de qualidade, formatadores e cálculos
│   ├── App.tsx             # Componente raiz com roteamento de abas
│   ├── index.css           # Design System Verde & Branco
│   └── main.tsx            # Ponto de entrada React
├── ENVIAR_PARA_O_GITHUB.bat # Script de automação git push para Windows
├── INICIAR_LOCAL.bat       # Inicialização em 1 clique
├── index.html              # Template HTML com fontes Outfit e Jakarta Sans
├── package.json            # Scripts e dependências
├── tsconfig.json           # Configurações TypeScript
└── vite.config.ts          # Configuração Vite
```
