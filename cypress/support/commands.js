const STORAGE_KEY = '@beedoo-qa-tests/courses';

Cypress.Commands.add('clearCourses', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem(STORAGE_KEY);
  });
});

Cypress.Commands.add('setCourses', (courses) => {
  cy.window().then((win) => {
    win.localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  });
});

Cypress.Commands.add('getCourses', () => {
  return cy.window().then((win) => {
    return JSON.parse(win.localStorage.getItem(STORAGE_KEY) || '[]');
  });
});

Cypress.Commands.add('gotoHome', () => {
  cy.visit('/');
  cy.contains('Lista de cursos').should('be.visible');
});

Cypress.Commands.add('gotoForm', () => {
  cy.visit('/');
  cy.get("a[href='/new-course']").click();
  cy.get("input[aria-label='Nome do curso']").should('be.visible');
  cy.contains('button', /cadastrar curso/i).should('be.visible');
});

Cypress.Commands.add('selectTipo', (label) => {
  cy.get('.q-select').click();
  cy.contains('.q-item__label', label).click();
  // Aguarda dropdown fechar
  cy.get('.q-menu').should('not.exist');
});

Cypress.Commands.add('fillCourse', (data) => {
  if (data.nome) cy.get("input[aria-label='Nome do curso']").clear().type(data.nome, { delay: 0 });
  if (data.descricao) cy.get('textarea').clear().type(data.descricao, { delay: 0 });
  if (data.instrutor) cy.get("input[aria-label='Instrutor']").clear().type(data.instrutor, { delay: 0 });
  if (data.capa) cy.get("input[aria-label='Url da imagem de capa']").clear().type(data.capa, { delay: 0 });
  if (data.inicio) cy.get("input[aria-label='Data de início']").clear().type(data.inicio, { delay: 0 });
  if (data.fim) cy.get("input[aria-label='Data de fim']").clear().type(data.fim, { delay: 0 });
  if (data.vagas !== undefined) cy.get("input[aria-label='Número de vagas']").clear().type(String(data.vagas), { delay: 0 });
  if (data.tipo) cy.selectTipo(data.tipo);
  if (data.endereco) cy.get("input[aria-label='Endereço']").clear().type(data.endereco, { delay: 0 });
  if (data.link) cy.get("input[aria-label='Link de inscrição']").clear().type(data.link, { delay: 0 });
});

Cypress.Commands.add('clickCadastrar', () => {
  cy.contains('button', /cadastrar curso/i).click();
  // Aguarda redirecionamento para listagem após cadastro
  cy.contains('Lista de cursos').should('be.visible');
});