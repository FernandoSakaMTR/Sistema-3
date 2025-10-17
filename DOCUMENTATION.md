# Documentação do Sistema de Ordem de Serviço (MTR TOPURA)

## 1. Visão Geral

Este documento detalha a arquitetura, funcionalidades e estrutura do Sistema de Gestão de Ordens de Serviço. A aplicação foi projetada para ser uma ferramenta robusta, rápida e confiável para registrar, monitorar, priorizar e controlar Ordens de Serviço (OS) de manutenção em um ambiente industrial.

Seu principal diferencial é a arquitetura **Offline-First**, que garante o funcionamento contínuo mesmo em locais com conexão de internet instável, como uma fábrica.

---

## 2. Funcionalidades Principais

### 2.1. Gestão Completa de Ordens de Serviço (OS)

O sistema gerencia o ciclo de vida completo de uma OS, desde sua criação até a finalização.

-   **Criação Detalhada:**
    -   Qualquer perfil de usuário pode criar uma nova OS.
    -   O formulário de criação captura informações essenciais: solicitante, setor, equipamento(s), data e hora exata da falha, múltiplos tipos de manutenção (Mecânica, Elétrica), status do equipamento (com destaque visual) e descrição do problema.
    -   Suporte para anexo de múltiplos arquivos (fotos, vídeos, PDFs).

-   **Ciclo de Vida e Ações:**
    -   **Iniciar Atendimento:** A equipe de Manutenção "assume" a OS, registrando o responsável e o início do trabalho.
    -   **Concluir Atendimento:** Ao finalizar, o técnico registra a solução, preenche checklists (se aplicável) e informa quem concluiu o serviço.
    -   **Cancelar OS:** Pedidos podem ser cancelados com um motivo claro, mantendo o registro.
    -   **Editar e Excluir:** Solicitantes podem editar/excluir suas OS apenas antes do início do atendimento.

-   **Visualização e Filtragem:**
    -   **Listas por Perfil:** "Minhas OS" para o usuário logado e "Todas as OS" para manutenção e gestores.
    -   **Navegação por Abas:** Filtros rápidos para OS "Novas", "Em Aberto" e "Finalizadas".
    -   **Histórico Completo:** A aba "Finalizadas" permite consultar o histórico de OS por ano e mês.

### 2.2. Manutenção Preventiva Inteligente

O sistema automatiza e gerencia o fluxo de manutenções preventivas.

-   **Geração Automática:** Monitora as horas de operação das máquinas (simulado via `operationalDataService`) e cria OS preventivas automaticamente ao atingir um limite configurado.
-   **Checklists Padronizados:** As OS preventivas são criadas com checklists específicos para cada tipo de manutenção, garantindo a padronização e a qualidade do serviço.
-   **Fluxo de Aprovação:**
    -   Gestores e Admins possuem uma tela exclusiva de "Aprovações".
    -   Eles podem **aprovar** ou **rejeitar** as preventivas geradas pelo sistema. Uma vez aprovada, a OS entra na fila normal de trabalho.
-   **Aprovação de Conclusão Retroativa:** Se um técnico precisa registrar a conclusão de uma OS com data/hora no passado, essa alteração **requer aprovação de um gestor**, garantindo a integridade dos dados para as métricas.

### 2.3. Dashboard Gerencial com Análise de Dados

Uma tela exclusiva para Gestores e Admins com insights sobre a operação.

-   **Indicadores de Performance (KPIs):** Visão rápida de "Novos Pedidos", "Em Atendimento", "Máquinas Paradas" e "Concluídos no Mês".
-   **Análise de Confiabilidade:** Uma tabela poderosa calcula e exibe métricas cruciais por equipamento:
    -   **MTBF (Tempo Médio Entre Falhas):** Mede a confiabilidade de um equipamento.
    -   **MTTR (Tempo Médio Para Reparo):** Mede a eficiência da equipe de manutenção.
    -   Contagem total de falhas.
-   **Filtros Avançados:** Permite filtrar a análise de confiabilidade por setor da fábrica.

### 2.4. Robustez e Funcionamento Offline (Offline-First)

A aplicação é projetada para nunca parar de funcionar por falta de internet.

-   **Cache de Aplicação:** Utiliza um **Service Worker (`sw.js`)** para armazenar em cache os arquivos principais da aplicação (HTML, CSS, JS). Isso permite que a aplicação seja carregada instantaneamente, mesmo sem conexão.
-   **Persistência de Dados Local:** Todas as OS, usuários e filas de ações são salvos no `localStorage` do navegador. Os dados estão seguros no dispositivo do usuário.
-   **Sincronização Inteligente com Fila de Ações:**
    -   Toda ação que modifica dados (criar, editar, etc.) é executada localmente de forma imediata e adicionada a uma fila de sincronização (`syncQueue`).
    -   Quando a conexão é restabelecida, a aplicação processa a fila e envia as ações pendentes para o servidor em segundo plano.
    -   Isso elimina a necessidade de "polling" (consultas repetitivas), reduzindo o tráfego de rede e a carga no servidor.
-   **Feedback Visual:** O cabeçalho da aplicação exibe indicadores claros sobre o status da conexão (`Offline`) e da sincronização de dados (`Sincronizando...`, `Sincronizado`, `Pendente`).

### 2.5. Gestão de Usuários e Perfis de Acesso

O sistema possui um controle de acesso baseado em perfis.

-   **Perfis Definidos:**
    -   **Solicitante:** Cria e gerencia suas próprias OS.
    -   **Manutenção:** Visualiza todas as OS e executa o trabalho (iniciar, concluir).
    -   **Gestor:** Acesso da Manutenção + Dashboard e tela de Aprovações.
    -   **Admin:** Acesso total, incluindo o gerenciamento de usuários.
-   **Gerenciamento de Usuários:** A tela "Gerenciar Usuários" (acessível apenas para Admins) permite criar, editar e excluir perfis de usuário.
-   **Perfil Pessoal:** Todo usuário pode editar suas próprias informações (nome, setor, senha).

---

## 3. Arquitetura Técnica

### 3.1. Frontend

-   **Framework:** React com TypeScript.
-   **Estilização:** Tailwind CSS, configurado diretamente no `index.html` para simplicidade.
-   **Componentização:** A interface é dividida em componentes reutilizáveis localizados na pasta `components` e páginas específicas em `pages`.

### 3.2. Gerenciamento de Estado e Dados

-   **Estado Local:** O estado da aplicação é gerenciado principalmente através dos hooks do React (`useState`, `useEffect`, `useCallback`).
-   **Comunicação com API:** O arquivo `services/mockApiService.ts` simula um backend e gerencia toda a lógica de dados, incluindo:
    -   Persistência no `localStorage`.
    -   Implementação da fila de sincronização (`syncQueue`).
    -   Lógica de UI otimista (as alterações são refletidas na interface imediatamente).
-   **Dados Operacionais:** O `services/operationalDataService.ts` simula uma fonte de dados externa para as horas de operação das máquinas, usada para gerar as manutenções preventivas.

### 3.3. Funcionalidade Offline

-   **Service Worker (`sw.js`):** Intercepta as requisições de rede. Se um recurso está em cache, ele é servido diretamente, caso contrário, a requisição é feita à rede e o resultado é cacheado para uso futuro.
-   **Event Listeners:** O `App.tsx` utiliza `window.addEventListener` para os eventos `online` e `offline` para detectar mudanças na conexão e disparar a sincronização.

---

## 4. Estrutura de Arquivos do Projeto

```
.
├── components/         # Componentes React reutilizáveis (Header, Sidebar, Badges, etc.)
├── pages/              # Componentes de página (Dashboard, Login, Lista de OS, etc.)
├── services/           # Lógica de negócio e comunicação de dados
│   ├── mockApiService.ts   # Simula o backend, gerencia localStorage e a fila de sincronização
│   ├── operationalDataService.ts # Simula dados de operação das máquinas
│   └── apiService.ts       # (Exemplo) Estrutura para uma API real
├── App.tsx             # Componente raiz, gerencia a navegação e o estado global
├── constants.ts        # Constantes da aplicação (cores, perfis, checklists)
├── index.html          # Ponto de entrada HTML, carrega scripts e Tailwind CSS
├── index.tsx           # Ponto de entrada do React
├── sw.js               # Lógica do Service Worker para cache e offline
├── types.ts            # Definições de tipos e interfaces TypeScript
└── DOCUMENTATION.md    # Este arquivo
```
