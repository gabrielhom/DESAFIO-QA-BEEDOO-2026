/**
 * Testes de acessibilidade (WCAG) — Beedoo QA Challenge 2026
 * Utiliza cypress-axe para validação automática contra WCAG 2.1 AA
 */
describe('Acessibilidade (a11y)', () => {
  it('Página de listagem deve ser acessível', () => {
    cy.gotoHome();
    cy.injectAxe();
    cy.checkA11y(null, null, (violations) => {
      cy.log(`${violations.length} violação(ões) de acessibilidade encontrada(s)`);
      violations.forEach((v) => {
        cy.log(`[${v.impact}] ${v.id}: ${v.description}`);
      });
    });
    cy.screenshot('a11y_listagem');
  });

  it('Formulário de cadastro deve ser acessível', () => {
    cy.gotoForm();
    cy.injectAxe();
    cy.checkA11y(null, null, (violations) => {
      cy.log(`${violations.length} violação(ões) de acessibilidade encontrada(s)`);
      violations.forEach((v) => {
        cy.log(`[${v.impact}] ${v.id}: ${v.description}`);
      });
    });
    cy.screenshot('a11y_formulario');
  });
});
