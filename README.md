# DESAFIO QA BEEDOO 2026

## Índice

1. [Análise da Aplicação](#1-análise-da-aplicação)
2. [Cenários e Casos de Teste — Gherkin](#2-cenários-e-casos-de-teste--módulo-de-cursos)
3. [Planilha de Casos de Teste](#3-planilha-de-casos-de-teste)
4. [Execução dos Testes e Evidências](#4-execução-dos-testes-e-evidências)
5. [Registro de Bugs](#5-registro-de-bugs)

---

## 1. Análise da Aplicação

**URL:** https://creative-sherbet-a51eac.netlify.app/

### Qual o objetivo da aplicação?

A aplicação é uma plataforma de **gerenciamento de cursos** (Beedoo QA Challenge), construída com Vue.js 3 e Quasar Framework. Seu objetivo é permitir o cadastro, listagem e exclusão de cursos, servindo como ambiente de teste para processos seletivos de QA na Beedoo. Os dados são persistidos no `localStorage` do navegador.

### Quais são os principais fluxos disponíveis?

| Fluxo | Descrição |
|---|---|
| **Listagem de cursos** | Página inicial (`/`) exibe os cursos cadastrados em formato de cards, com imagem de capa, nome, descrição, tipo, datas de início/fim e número de vagas. |
| **Cadastro de curso** | Página `/new-course` contém um formulário com os campos: Nome do curso, Descrição, Instrutor, URL da imagem de capa, Data de início, Data de fim, Número de vagas, Tipo de curso (Presencial/Online). Campos condicionais: Endereço (quando Presencial) e Link de inscrição (quando Online). |
| **Exclusão de curso** | Cada card de curso na listagem possui um botão "Excluir curso" que dispara uma requisição DELETE para a API. |

### Quais pontos do sistema são mais críticos para teste?

1. **Ausência de validação de campos no cadastro:** O formulário não possui validações visíveis — é possível cadastrar um curso com todos os campos vazios, sem mensagens de erro ou bloqueio.
2. **Endpoint de exclusão hardcoded:** O botão "Excluir curso" faz uma requisição `DELETE` para `/test-api/courses/1` (ID fixo), independentemente do curso selecionado, e não remove o curso do `localStorage`, resultando em comportamento incoerente (mensagem de sucesso sem exclusão real).
3. **Vulnerabilidade XSS:** O campo "nome do curso" é renderizado na listagem usando `innerHTML`, o que permite a injeção de código HTML/JavaScript malicioso.
4. **Geração de IDs frágil:** O ID do curso é calculado como `length + 1` do array no `localStorage`. Após exclusões, pode gerar IDs duplicados.
5. **Campos condicionais (Endereço/Link):** A exibição depende do tipo de curso selecionado — necessário validar que aparecem/desaparecem corretamente e que seus dados são persistidos.
6. **Persistência em localStorage:** Toda a lógica de dados depende do `localStorage`, sem backend real. Comportamento em navegação anônima, limpeza de cache ou múltiplas abas deve ser considerado.
7. **Ausência de funcionalidade de edição:** Não existe fluxo para editar um curso previamente cadastrado.

---

## 2. Cenários e Casos de Teste — Módulo de Cursos

### 2.1 Cadastro de curso — Fluxo principal

```gherkin
Funcionalidade: Cadastro de curso
  Como um usuário da plataforma
  Quero cadastrar novos cursos
  Para que eles fiquem disponíveis na listagem

  Cenário: Cadastro de curso online com todos os campos preenchidos
    Dado que estou na página de cadastro de curso "/new-course"
    Quando preencho o campo "Nome do curso" com "Curso de Automação de Testes"
    E preencho o campo "Descrição do curso" com "Curso completo de automação com Cypress"
    E preencho o campo "Instrutor" com "João Silva"
    E preencho o campo "Url da imagem de capa" com "https://example.com/imagem.jpg"
    E preencho o campo "Data de início" com "2026-04-01"
    E preencho o campo "Data de fim" com "2026-05-01"
    E preencho o campo "Número de vagas" com "30"
    E seleciono "Online" no campo "Tipo de curso"
    E preencho o campo "Link de inscrição" com "https://example.com/inscricao"
    E clico no botão "Cadastrar curso"
    Então devo ver a mensagem de sucesso "Curso cadastrado com sucesso!"
    E devo ser redirecionado para a página de listagem "/"
    E o curso "Curso de Automação de Testes" deve aparecer na listagem

  Cenário: Cadastro de curso presencial com todos os campos preenchidos
    Dado que estou na página de cadastro de curso "/new-course"
    Quando preencho o campo "Nome do curso" com "Workshop de QA"
    E preencho o campo "Descrição do curso" com "Workshop prático de garantia de qualidade"
    E preencho o campo "Instrutor" com "Maria Souza"
    E preencho o campo "Url da imagem de capa" com "https://example.com/workshop.jpg"
    E preencho o campo "Data de início" com "2026-06-10"
    E preencho o campo "Data de fim" com "2026-06-12"
    E preencho o campo "Número de vagas" com "20"
    E seleciono "Presencial" no campo "Tipo de curso"
    E preencho o campo "Endereço" com "Av. Paulista, 1000 - São Paulo/SP"
    E clico no botão "Cadastrar curso"
    Então devo ver a mensagem de sucesso "Curso cadastrado com sucesso!"
    E devo ser redirecionado para a página de listagem "/"
    E o curso "Workshop de QA" deve aparecer na listagem

  Cenário: Cadastro de múltiplos cursos em sequência
    Dado que cadastrei o curso "Curso A"
    Quando acesso a página de cadastro de curso "/new-course"
    E preencho os campos obrigatórios para o curso "Curso B"
    E clico no botão "Cadastrar curso"
    Então ambos "Curso A" e "Curso B" devem aparecer na listagem
    E os cursos devem ter IDs distintos
```

### 2.2 Listagem de cursos

```gherkin
Funcionalidade: Listagem de cursos
  Como um usuário da plataforma
  Quero visualizar os cursos cadastrados
  Para gerenciar os cursos disponíveis

  Cenário: Visualizar listagem vazia quando não há cursos cadastrados
    Dado que não existem cursos cadastrados no localStorage
    Quando acesso a página de listagem "/"
    Então devo ver o título "Lista de cursos"
    E nenhum card de curso deve ser exibido

  Cenário: Visualizar cursos cadastrados na listagem
    Dado que existe um curso "Curso de Testes" cadastrado
    Quando acesso a página de listagem "/"
    Então devo ver um card com o nome "Curso de Testes"
    E o card deve exibir a imagem de capa do curso
    E o card deve exibir o tipo do curso
    E o card deve exibir a descrição do curso
    E o card deve exibir a data de início e a data de fim
    E o card deve exibir o número de vagas

  Cenário: Verificar que a listagem reflete cursos do localStorage
    Dado que existem 3 cursos cadastrados no localStorage
    Quando acesso a página de listagem "/"
    Então devo ver exatamente 3 cards de cursos

  Cenário: Exclusão de curso
    Dado que existe um curso "Curso para Excluir" na listagem
    Quando clico no botão "Excluir curso" do card correspondente
    Então devo ver a mensagem "Curso excluído com sucesso!"
```

### 2.3 Cenários negativos

```gherkin
Funcionalidade: Cenários negativos do cadastro de curso
  Como um testador de QA
  Quero validar o comportamento da aplicação em cenários adversos
  Para identificar falhas e vulnerabilidades

  Cenário: Cadastro de curso com todos os campos vazios
    Dado que estou na página de cadastro de curso "/new-course"
    Quando clico no botão "Cadastrar curso" sem preencher nenhum campo
    Então o sistema deveria exibir mensagens de validação nos campos obrigatórios
    Mas o curso é cadastrado com sucesso sem validação (BUG)

  Cenário: Cadastro de curso sem selecionar o tipo de curso
    Dado que estou na página de cadastro de curso "/new-course"
    Quando preencho apenas o campo "Nome do curso" com "Curso Teste"
    E mantenho o campo "Tipo de curso" com "Selecione..."
    E clico no botão "Cadastrar curso"
    Então o sistema deveria exigir a seleção do tipo de curso
    Mas o curso é cadastrado com tipo vazio (BUG)

  Cenário: Cadastro de curso com data de fim anterior à data de início
    Dado que estou na página de cadastro de curso "/new-course"
    Quando preencho o campo "Data de início" com "2026-06-15"
    E preencho o campo "Data de fim" com "2026-06-10"
    E preencho os demais campos obrigatórios
    E clico no botão "Cadastrar curso"
    Então o sistema deveria bloquear o cadastro com mensagem de erro sobre as datas
    Mas o curso é cadastrado com datas inválidas (BUG)

  Cenário: Cadastro de curso com número de vagas negativo
    Dado que estou na página de cadastro de curso "/new-course"
    Quando preencho o campo "Número de vagas" com "-5"
    E preencho os demais campos obrigatórios
    E clico no botão "Cadastrar curso"
    Então o sistema deveria rejeitar valores negativos no campo de vagas
    Mas o curso é cadastrado com vagas negativas (BUG)

  Cenário: Cadastro de curso com número de vagas zero
    Dado que estou na página de cadastro de curso "/new-course"
    Quando preencho o campo "Número de vagas" com "0"
    E preencho os demais campos obrigatórios
    E clico no botão "Cadastrar curso"
    Então o sistema deveria rejeitar ou alertar sobre vagas zero

  Cenário: Cadastro de curso com URL de imagem inválida
    Dado que estou na página de cadastro de curso "/new-course"
    Quando preencho o campo "Url da imagem de capa" com "texto-invalido"
    E preencho os demais campos obrigatórios
    E clico no botão "Cadastrar curso"
    Então o sistema deveria validar o formato da URL
    Mas o curso é cadastrado com URL inválida (BUG)

  Cenário: Injeção de HTML/XSS no campo de nome do curso
    Dado que estou na página de cadastro de curso "/new-course"
    Quando preencho o campo "Nome do curso" com "<script>alert('xss')</script>"
    E preencho os demais campos obrigatórios
    E clico no botão "Cadastrar curso"
    E acesso a página de listagem "/"
    Então o script injetado não deveria ser executado
    Mas o campo utiliza innerHTML na renderização, possibilitando XSS (BUG - SEGURANÇA)

  Cenário: Cadastro de curso com texto extremamente longo no nome
    Dado que estou na página de cadastro de curso "/new-course"
    Quando preencho o campo "Nome do curso" com um texto de 10.000 caracteres
    E clico no botão "Cadastrar curso"
    Então o sistema deveria limitar o tamanho do campo ou exibir erro
    Mas o curso é cadastrado sem limitação (BUG)

  Cenário: Exclusão de curso não remove do localStorage
    Dado que existe um curso na listagem
    Quando clico no botão "Excluir curso"
    E recarrego a página
    Então o curso que foi "excluído" ainda aparece na listagem (BUG)
    Pois o botão de exclusão chama uma API que não existe e não atualiza o localStorage
```

### 2.4 Validações de campos

```gherkin
Funcionalidade: Validações de campos do formulário
  Como um testador de QA
  Quero verificar as validações dos campos do formulário
  Para garantir a integridade dos dados cadastrados

  Cenário: Campo condicional "Link de inscrição" exibido quando tipo é Online
    Dado que estou na página de cadastro de curso "/new-course"
    Quando seleciono "Online" no campo "Tipo de curso"
    Então o campo "Link de inscrição" deve ser exibido
    E o campo "Endereço" não deve ser exibido

  Cenário: Campo condicional "Endereço" exibido quando tipo é Presencial
    Dado que estou na página de cadastro de curso "/new-course"
    Quando seleciono "Presencial" no campo "Tipo de curso"
    Então o campo "Endereço" deve ser exibido
    E o campo "Link de inscrição" não deve ser exibido

  Cenário: Nenhum campo condicional exibido quando tipo não está selecionado
    Dado que estou na página de cadastro de curso "/new-course"
    Quando o campo "Tipo de curso" está com a opção "Selecione..."
    Então o campo "Link de inscrição" não deve ser exibido
    E o campo "Endereço" não deve ser exibido

  Cenário: Alternar tipo de curso de Online para Presencial
    Dado que estou na página de cadastro de curso "/new-course"
    E selecionei "Online" no campo "Tipo de curso"
    E preenchi o campo "Link de inscrição" com "https://example.com"
    Quando altero o tipo de curso para "Presencial"
    Então o campo "Link de inscrição" deve desaparecer
    E o campo "Endereço" deve ser exibido

  Cenário: Campo "Número de vagas" aceita apenas números
    Dado que estou na página de cadastro de curso "/new-course"
    Quando tento digitar "abc" no campo "Número de vagas"
    Então o campo não deve aceitar caracteres não numéricos

  Cenário: Campo "Data de início" possui formato date
    Dado que estou na página de cadastro de curso "/new-course"
    Então o campo "Data de início" deve ser do tipo "date"
    E deve permitir seleção de data via date picker

  Cenário: Campo "Data de fim" possui formato date
    Dado que estou na página de cadastro de curso "/new-course"
    Então o campo "Data de fim" deve ser do tipo "date"
    E deve permitir seleção de data via date picker

  Cenário: Cadastro de curso com caracteres especiais nos campos de texto
    Dado que estou na página de cadastro de curso "/new-course"
    Quando preencho o campo "Nome do curso" com "Curso @#$%! àéîõü 日本語"
    E preencho o campo "Descrição do curso" com "Descrição com acentos: ãõéí"
    E preencho os demais campos obrigatórios
    E clico no botão "Cadastrar curso"
    Então o curso deve ser cadastrado corretamente com os caracteres especiais
```

### 2.5 Comportamentos inesperados

```gherkin
Funcionalidade: Comportamentos inesperados
  Como um testador de QA
  Quero validar cenários de borda e comportamentos inesperados
  Para garantir a robustez do sistema

  Cenário: Acessar página inexistente
    Quando acesso a URL "/pagina-inexistente"
    Então devo ser redirecionado para a página de erro 404

  Cenário: Acessar cadastro de curso com localStorage corrompido
    Dado que o localStorage contém dados inválidos (JSON corrompido) na chave "@beedoo-qa-tests/courses"
    Quando acesso a página de cadastro e clico em "Cadastrar curso"
    Então o sistema deveria tratar o erro de parsing do JSON

  Cenário: Acessar listagem com localStorage corrompido
    Dado que o localStorage contém dados inválidos na chave "@beedoo-qa-tests/courses"
    Quando acesso a página de listagem "/"
    Então o sistema deveria exibir a listagem vazia ou uma mensagem de erro

  Cenário: IDs duplicados após exclusão manual e novo cadastro
    Dado que existem 3 cursos com IDs 1, 2 e 3 no localStorage
    E eu removo manualmente o curso com ID 3 do localStorage
    Quando cadastro um novo curso
    Então o novo curso recebe ID 3 (duplicado com o anterior)
    Pois a lógica de geração de ID usa length + 1 (BUG)

  Cenário: Navegação entre listagem e cadastro
    Dado que estou na página de listagem "/"
    Quando clico no botão "CADASTRAR CURSO"
    Então devo ser redirecionado para "/new-course"
    E o formulário deve estar vazio

  Cenário: Usar botão voltar do navegador após cadastro
    Dado que acabei de cadastrar um curso com sucesso
    E fui redirecionado para a listagem
    Quando clico no botão voltar do navegador
    Então devo voltar para a página de cadastro
    E o formulário deve estar vazio (não reenviar dados)

  Cenário: Duplo clique no botão "Cadastrar curso"
    Dado que estou na página de cadastro com todos os campos preenchidos
    Quando clico rapidamente duas vezes no botão "Cadastrar curso"
    Então apenas um curso deve ser cadastrado
    Mas é possível que dois cursos sejam criados (BUG)

  Cenário: Verificar persistência dos dados após recarregar a página
    Dado que cadastrei cursos na aplicação
    Quando recarrego a página de listagem (F5)
    Então todos os cursos cadastrados devem continuar visíveis

  Cenário: Botão "Excluir curso" envia ID fixo na requisição DELETE
    Dado que existem múltiplos cursos na listagem
    Quando clico em "Excluir curso" em qualquer card
    Então a requisição DELETE é sempre enviada para "/test-api/courses/1"
    E o curso não é removido do localStorage (BUG)

  Cenário: Acessar aplicação em navegação privada/anônima
    Dado que estou em uma janela de navegação privada
    Quando cadastro um curso
    E fecho e reabro a janela anônima
    Então os cursos cadastrados não estarão mais disponíveis
    Pois o localStorage é limpo ao fechar a sessão anônima
```

---

## 3. Planilha de Casos de Teste

Os 25 casos de teste documentados estão disponíveis na planilha do Google Sheets:

**🔗 [Planilha de Casos de Teste — Google Sheets](https://docs.google.com/spreadsheets/d/1VxnfoMxqARFvnc7n8963BL4bs1o0PN7BeUbLdmWRCxI/edit?usp=sharing)**

A planilha contém as colunas: ID, Suíte, Cenário, Pré-condições, Passos, Resultado Esperado, Resultado Obtido, Status (Aprovado/Reprovado), Severidade, Evidência e Observações.

> O arquivo `casos-de-teste.csv` neste repositório contém a mesma base de dados e pode ser importado diretamente no Google Sheets.

### Resumo da execução

| Métrica | Valor |
|---|---|
| Total de casos de teste | 25 |
| Aprovados | 14 |
| Reprovados | 11 |
| Taxa de aprovação | 56% |

---

## 4. Execução dos Testes e Evidências

### Migração para Cypress

Os 25 casos de teste, originalmente executados manualmente no Google Chrome, foram **automatizados com Cypress**. O arquivo original em Playwright (`executar_testes.py`) foi traduzido para Cypress (`cypress/e2e/cursos.cy.js`) com comandos customizados reutilizáveis (`cypress/support/commands.js`).

### Pré-requisitos

- **Node.js** ≥ 18
- **npm** (incluído com o Node.js)

### Como executar

```bash
# 1. Instalar dependências
npm install

# 2. Executar todos os testes (headless)
npx cypress run

# 3. Executar com interface gráfica (opcional)
npx cypress open
```

### Estrutura dos testes

| Arquivo | Descrição |
|---|---|
| `cypress/e2e/cursos.cy.js` | 25 casos de teste automatizados |
| `cypress/support/commands.js` | Comandos customizados (`clearCourses`, `fillCourse`, `clickCadastrar`, etc.) |
| `cypress.config.js` | Configuração do Cypress (baseUrl, evidências, vídeo) |
| `executar_testes.py` | Testes originais em Playwright (mantido como referência) |

### Evidências

As evidências são geradas automaticamente pelo Cypress a cada execução:

- **Screenshots:** `evidencias/screenshots/` — capturados automaticamente em falhas e em pontos estratégicos dos testes (ex: antes de asserções que evidenciam bugs)
- **Vídeos:** `evidencias/videos/` — gravação completa de cada spec

As evidências também estão disponíveis no Google Drive:

**🔗 [Evidências de Execução — Google Drive](https://drive.google.com/drive/folders/1zNXnQGmg79w63_ewBkLUNJS8Us6M-GTo?usp=sharing)**

### Resultado esperado

Dos 25 testes, **14 passam** e **11 falham**. As falhas são **intencionais** — cada teste que falha evidencia um bug real na aplicação, documentado na seção 5. Os testes negativos utilizam asserções reais (não apenas `cy.log`) para comprovar os defeitos.

### Observações sobre a execução

- Testes automatizados com **Cypress 15** (Electron headless)
- Aplicação testada: https://creative-sherbet-a51eac.netlify.app/
- Todos os `cy.wait(ms)` foram substituídos por esperas inteligentes (asserções de visibilidade, interceptação de requisições)
- Para cada caso de teste reprovado, há um bug correspondente registrado na seção 5

---

## 5. Registro de Bugs

Durante a execução dos testes, foram identificados **8 bugs**, sendo 3 de severidade **Crítica**, 2 de severidade **Alta** e 3 de severidade **Média**.

O registro completo está documentado no arquivo [`bugs.md`](bugs.md) deste repositório, com o seguinte formato para cada bug:
- **Título**
- **Severidade** (Crítica / Alta / Média / Baixa)
- **Passos para reproduzir**
- **Resultado atual**
- **Resultado esperado**
- **Análise técnica** (quando aplicável)

### Resumo dos bugs encontrados

| ID | Título | Severidade |
|---|---|---|
| BUG-001 | Exclusão de curso não funcional (endpoint hardcoded + localStorage não atualizado) | Crítica |
| BUG-002 | Ausência total de validações no formulário de cadastro | Crítica |
| BUG-003 | Sem validação de coerência entre datas de início e fim | Alta |
| BUG-004 | Campo "Número de vagas" aceita valores negativos | Alta |
| BUG-005 | Sem validação de formato de URL no campo de imagem de capa | Média |
| BUG-006 | Vulnerabilidade XSS no campo "Nome do curso" (innerHTML) | Crítica (Segurança) |
| BUG-007 | Sem limitação de caracteres nos campos de texto | Média |
| BUG-008 | Duplo clique no botão "Cadastrar curso" cria registros duplicados | Média |

### Classificação por severidade

| Severidade | Quantidade | IDs |
|---|---|---|
| Crítica | 3 | BUG-001, BUG-002, BUG-006 |
| Alta | 2 | BUG-003, BUG-004 |
| Média | 3 | BUG-005, BUG-007, BUG-008 |