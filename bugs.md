# Registro de Bugs — Beedoo QA Challenge 2026

---

## BUG-001: Exclusão de curso não funcional — endpoint hardcoded e localStorage não atualizado

| Campo | Detalhe |
|---|---|
| **Título** | Exclusão de curso não remove o registro e usa endpoint fixo |
| **Severidade** | **Crítica** |
| **Módulo** | Listagem de Cursos — Botão "Excluir curso" |
| **Ambiente** | Produção — https://creative-sherbet-a51eac.netlify.app/ |

### Passos para reproduzir

1. Acessar a aplicação em https://creative-sherbet-a51eac.netlify.app/
2. Cadastrar pelo menos 2 cursos (e.g., "Curso A" e "Curso B")
3. Na listagem, clicar no botão **"Excluir curso"** de qualquer card (ex: "Curso B")
4. Observar a mensagem de sucesso exibida
5. Abrir o DevTools (F12) > aba **Network** e repetir o passo 3
6. Recarregar a página (F5)

### Resultado atual

- A mensagem **"Curso excluído com sucesso!"** é exibida (toast verde)
- A requisição HTTP enviada é sempre `DELETE /test-api/courses/1`, independentemente de qual curso foi clicado
- O endpoint `/test-api/courses/1` retorna **404** (não existe)
- O curso **NÃO** é removido do `localStorage`
- Após recarregar a página, **todos os cursos reaparecem** na listagem

### Resultado esperado

- O curso selecionado deveria ser removido permanentemente do `localStorage`
- A requisição DELETE deveria usar o ID correto do curso
- Após reload, o curso excluído não deveria mais aparecer
- Se a API falhar, a mensagem de sucesso não deveria ser exibida

### Análise técnica

No código-fonte (`IndexPage.da5f52bb.js`), a função de exclusão executa:
```javascript
const a = async () => {
    const r = await fetch("/test-api/courses/1", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    });
    return ie.create({ message: "Curso excluído com sucesso!", color: "green", position: "top" }), r;
};
```
**Problemas:**
1. O ID é fixo (`/test-api/courses/1`) ao invés de dinâmico
2. O `localStorage` nunca é atualizado (não há `localStorage.setItem` ou `removeItem`)
3. A mensagem de sucesso é exibida incondicionalmente, sem verificar o status da resposta

---

## BUG-002: Ausência total de validações no formulário de cadastro

| Campo | Detalhe |
|---|---|
| **Título** | Formulário de cadastro permite envio com todos os campos vazios |
| **Severidade** | **Crítica** |
| **Módulo** | Cadastro de Cursos — Formulário (`/new-course`) |
| **Ambiente** | Produção — https://creative-sherbet-a51eac.netlify.app/new-course |

### Passos para reproduzir

1. Acessar https://creative-sherbet-a51eac.netlify.app/new-course
2. Sem preencher nenhum campo, clicar no botão **"Cadastrar curso"**

### Resultado atual

- O curso é cadastrado com sucesso com **todos os campos vazios**
- A mensagem "Curso cadastrado com sucesso!" é exibida
- O usuário é redirecionado para a listagem
- Um card "vazio" (sem nome, sem descrição, sem imagem) aparece na listagem

### Resultado esperado

- O sistema deveria validar os campos obrigatórios (ao menos: Nome, Descrição, Instrutor, Data de início, Data de fim, Número de vagas, Tipo de curso)
- Mensagens de erro deveriam ser exibidas nos campos inválidos
- O botão "Cadastrar curso" deveria permanecer desabilitado ou não executar ação até que os campos obrigatórios estejam preenchidos

---

## BUG-003: Sem validação de coerência entre datas de início e fim

| Campo | Detalhe |
|---|---|
| **Título** | Sistema aceita data de fim anterior à data de início |
| **Severidade** | **Alta** |
| **Módulo** | Cadastro de Cursos — Campos de Data |
| **Ambiente** | Produção — https://creative-sherbet-a51eac.netlify.app/new-course |

### Passos para reproduzir

1. Acessar a página de cadastro de curso
2. Preencher o campo "Data de início" com **2026-06-15**
3. Preencher o campo "Data de fim" com **2026-06-10** (5 dias antes)
4. Preencher os demais campos normalmente
5. Clicar em "Cadastrar curso"

### Resultado atual

- O curso é cadastrado normalmente com a data de fim anterior à data de início
- Na listagem, o card exibe "início: 2026-06-15" e "fim: 2026-06-10"
- Nenhuma mensagem de erro é exibida

### Resultado esperado

- O sistema deveria bloquear o cadastro e exibir mensagem de erro indicando que a data de fim não pode ser anterior à data de início

---

## BUG-004: Campo "Número de vagas" aceita valores negativos

| Campo | Detalhe |
|---|---|
| **Título** | É possível cadastrar curso com número de vagas negativo |
| **Severidade** | **Alta** |
| **Módulo** | Cadastro de Cursos — Campo "Número de vagas" |
| **Ambiente** | Produção — https://creative-sherbet-a51eac.netlify.app/new-course |

### Passos para reproduzir

1. Acessar a página de cadastro de curso
2. Preencher o campo "Número de vagas" com **-5**
3. Preencher os demais campos normalmente
4. Clicar em "Cadastrar curso"

### Resultado atual

- O curso é cadastrado com **-5 vagas**
- Na listagem, o card exibe "-5 vagas"
- Nenhuma mensagem de erro é exibida

### Resultado esperado

- O campo deveria aceitar apenas valores positivos (>= 1)
- Uma mensagem de validação deveria ser exibida para valores inválidos

---

## BUG-005: Sem validação de formato de URL no campo de imagem de capa

| Campo | Detalhe |
|---|---|
| **Título** | Campo "Url da imagem de capa" aceita texto que não é URL |
| **Severidade** | **Média** |
| **Módulo** | Cadastro de Cursos — Campo "Url da imagem de capa" |
| **Ambiente** | Produção — https://creative-sherbet-a51eac.netlify.app/new-course |

### Passos para reproduzir

1. Acessar a página de cadastro de curso
2. Preencher o campo "Url da imagem de capa" com **"texto-invalido"**
3. Preencher os demais campos normalmente
4. Clicar em "Cadastrar curso"
5. Verificar o card na listagem

### Resultado atual

- O curso é cadastrado com "texto-invalido" como URL de capa
- Na listagem, o componente `<q-img>` tenta carregar "texto-invalido" como imagem, resultando em uma imagem quebrada / loading infinito

### Resultado esperado

- O campo deveria validar que o valor é uma URL válida (formato http:// ou https://)
- Uma mensagem de erro deveria ser exibida para URLs inválidas

---

## BUG-006: Vulnerabilidade XSS no campo "Nome do curso"

| Campo | Detalhe |
|---|---|
| **Título** | Campo "Nome do curso" permite injeção de HTML/JavaScript (XSS) |
| **Severidade** | **Crítica (Segurança)** |
| **Módulo** | Listagem de Cursos — Renderização do nome |
| **Ambiente** | Produção — https://creative-sherbet-a51eac.netlify.app/ |

### Passos para reproduzir

1. Acessar a página de cadastro de curso
2. Preencher o campo "Nome do curso" com: `<img src=x onerror=alert('XSS')>`
3. Preencher os demais campos normalmente
4. Clicar em "Cadastrar curso"
5. Observar a listagem de cursos

### Resultado atual

- O HTML injetado é **interpretado e executado** no navegador
- No caso do payload `<img src=x onerror=alert('XSS')>`, um popup `alert` é exibido
- Isso ocorre porque o card utiliza a propriedade `innerHTML` para renderizar o nome do curso:
  ```javascript
  y("div", {class: "text-h5 q-mt-sm q-mb-xs", innerHTML: (d=e.course)==null?void 0:d.name}, null, 8, Se)
  ```

### Resultado esperado

- O nome do curso deveria ser renderizado como **texto puro** (usando `textContent` ao invés de `innerHTML`)
- Qualquer HTML injetado deveria ser sanitizado/escapado antes da renderização
- Este é um risco de segurança sério que permite ataques como roubo de sessão, redirecionamento malicioso e manipulação da interface

### Classificação de segurança

| Referência | Identificador |
|---|---|
| **OWASP Top 10** | [A03:2021 — Injection](https://owasp.org/Top10/A03_2021-Injection/) |
| **CWE** | [CWE-79 — Improper Neutralization of Input During Web Page Generation (XSS)](https://cwe.mitre.org/data/definitions/79.html) |
| **Tipo** | Stored XSS (Cross-Site Scripting persistido) |

### Remediação sugerida

- Substituir `innerHTML` por `textContent` no componente Vue que renderiza o nome do curso
- Alternativamente, usar a diretiva `v-text` ao invés de `v-html` no template
- Implementar sanitização de entrada no formulário de cadastro (ex: DOMPurify)

---

## BUG-007: Sem limitação de caracteres nos campos de texto

| Campo | Detalhe |
|---|---|
| **Título** | Campos de texto não possuem limite de caracteres |
| **Severidade** | **Média** |
| **Módulo** | Cadastro de Cursos — Campos de texto |
| **Ambiente** | Produção — https://creative-sherbet-a51eac.netlify.app/new-course |

### Passos para reproduzir

1. Acessar a página de cadastro de curso
2. Preencher o campo "Nome do curso" com um texto de **10.000 caracteres**
3. Clicar em "Cadastrar curso"
4. Verificar a listagem

### Resultado atual

- O curso é cadastrado sem nenhuma limitação
- O card na listagem exibe o texto completo, quebrando o layout
- O `localStorage` armazena todo o conteúdo sem restrição, podendo atingir o limite de 5MB do browser

### Resultado esperado

- Os campos de texto deveriam ter um atributo `maxlength` definido
- O formulário deveria exibir um contador de caracteres
- O sistema deveria recusar textos excessivamente longos

---

## BUG-008: Duplo clique no botão "Cadastrar curso" cria registros duplicados

| Campo | Detalhe |
|---|---|
| **Título** | Clique duplo rápido no botão de cadastro gera cursos duplicados |
| **Severidade** | **Média** |
| **Módulo** | Cadastro de Cursos — Botão "Cadastrar curso" |
| **Ambiente** | Produção — https://creative-sherbet-a51eac.netlify.app/new-course |

### Passos para reproduzir

1. Acessar a página de cadastro de curso
2. Preencher todos os campos normalmente
3. Clicar **rapidamente duas vezes** no botão "Cadastrar curso"

### Resultado atual

- Dois cursos idênticos são criados no `localStorage`
- Na listagem, aparecem dois cards iguais
- Duas mensagens de sucesso são exibidas

### Resultado esperado

- Apenas um curso deveria ser cadastrado por submissão
- O botão deveria ser desabilitado após o primeiro clique (debounce/disable)
- Ou o sistema deveria detectar a submissão duplicada e ignorá-la

---

## Resumo dos Bugs

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
