/**
 * Execução automatizada dos 25 casos de teste — Beedoo QA Challenge 2026
 * Traduzido de Playwright (executar_testes.py) para Cypress
 */

// ── Fixtures ───────────────────────────────────────────────────────
const SAMPLE_COURSE_ONLINE = {
  id: 1,
  name: 'Curso Visível',
  description: 'Descrição teste',
  instructor: 'Prof.',
  cover: 'https://picsum.photos/640/480',
  startDate: '2026-04-01',
  endDate: '2026-05-01',
  numberOfVagas: 25,
  type: { label: 'Online', value: 'online' },
  url: 'https://example.com',
};

const makeCourse = (overrides = {}) => ({
  id: 1,
  name: 'Curso Teste',
  description: 'Desc',
  instructor: 'Inst',
  cover: 'https://picsum.photos/640/480',
  startDate: '2026-04-01',
  endDate: '2026-05-01',
  numberOfVagas: 10,
  type: { label: 'Online', value: 'online' },
  url: 'https://example.com',
  ...overrides,
});

// ── Suíte: Cadastro de curso ──────────────────────────────────────
describe('Cadastro de curso — Fluxo principal', () => {
  beforeEach(() => {
    cy.gotoHome();
    cy.clearCourses();
  });

  it('CT-001: Cadastro curso online completo', () => {
    cy.gotoForm();
    cy.fillCourse({
      nome: 'Curso de Automação de Testes',
      descricao: 'Curso completo de automação com Cypress',
      instrutor: 'João Silva',
      capa: 'https://picsum.photos/640/480',
      inicio: '2026-04-01',
      fim: '2026-05-01',
      vagas: '30',
      tipo: 'Online',
      link: 'https://example.com/inscricao',
    });
    cy.screenshot('CT-001_form');
    cy.clickCadastrar();
    cy.screenshot('CT-001');
    cy.getCourses().then((courses) => {
      expect(courses).to.have.length(1);
      expect(courses[0].name).to.eq('Curso de Automação de Testes');
      expect(courses[0].type.value).to.eq('online');
      expect(courses[0].numberOfVagas).to.eq("30");
    });
  });

  it('CT-002: Cadastro curso presencial completo', () => {
    cy.gotoForm();
    cy.fillCourse({
      nome: 'Workshop de QA',
      descricao: 'Workshop prático de garantia de qualidade',
      instrutor: 'Maria Souza',
      capa: 'https://picsum.photos/640/481',
      inicio: '2026-06-10',
      fim: '2026-06-12',
      vagas: '20',
      tipo: 'Presencial',
      endereco: 'Av. Paulista, 1000 - São Paulo/SP',
    });
    cy.screenshot('CT-002_form');
    cy.clickCadastrar();
    cy.screenshot('CT-002');
    cy.getCourses().then((courses) => {
      expect(courses).to.have.length(1);
      expect(courses[0].name).to.eq('Workshop de QA');
      expect(courses[0].type.value).to.eq('presencial');
      expect(courses[0].address).to.eq('Av. Paulista, 1000 - São Paulo/SP');
    });
  });

  it('CT-003: Múltiplos cursos em sequência', () => {
    // Curso A
    cy.gotoForm();
    cy.fillCourse({
      nome: 'Curso A - Sequencial',
      descricao: 'Primeiro curso',
      instrutor: 'Ana',
      capa: 'https://picsum.photos/640/480',
      inicio: '2026-04-01',
      fim: '2026-05-01',
      vagas: '10',
      tipo: 'Online',
      link: 'https://example.com/a',
    });
    cy.clickCadastrar();

    // Curso B
    cy.gotoForm();
    cy.fillCourse({
      nome: 'Curso B - Sequencial',
      descricao: 'Segundo curso',
      instrutor: 'Bruno',
      capa: 'https://picsum.photos/640/481',
      inicio: '2026-06-01',
      fim: '2026-06-15',
      vagas: '20',
      tipo: 'Online',
      link: 'https://example.com/b',
    });
    cy.clickCadastrar();

    // Curso C
    cy.gotoForm();
    cy.fillCourse({
      nome: 'Curso C - Sequencial',
      descricao: 'Terceiro curso',
      instrutor: 'Carlos',
      capa: 'https://picsum.photos/640/482',
      inicio: '2026-07-01',
      fim: '2026-07-15',
      vagas: '15',
      tipo: 'Online',
      link: 'https://example.com/c',
    });
    cy.clickCadastrar();
    cy.gotoHome();
    cy.screenshot('CT-003');
    cy.getCourses().then((courses) => {
      expect(courses).to.have.length(3);
      const names = courses.map(c => c.name);
      expect(names).to.include('Curso A - Sequencial');
      expect(names).to.include('Curso B - Sequencial');
      expect(names).to.include('Curso C - Sequencial');
      // IDs devem ser distintos
      const ids = courses.map(c => c.id);
      expect(new Set(ids).size).to.eq(3);
    });
  });
});

// ── Suíte: Listagem de cursos ─────────────────────────────────────
describe('Listagem de cursos', () => {
  beforeEach(() => {
    cy.gotoHome();
    cy.clearCourses();
  });

  it('CT-004: Listagem vazia', () => {
    cy.get('.q-card').should('not.exist');
    cy.contains('Lista de cursos').should('be.visible');
    cy.screenshot('CT-004');
  });

  it('CT-005: Visualizar cursos cadastrados', () => {
    cy.setCourses([SAMPLE_COURSE_ONLINE]);
    cy.gotoHome();
    cy.get('.q-card').should('have.length', 1);
    cy.get('.q-card').first().within(() => {
      cy.contains('Curso Visível').should('be.visible');
    });
    cy.screenshot('CT-005');
  });

  it('CT-006: Exclusão de curso', () => {
    cy.setCourses([SAMPLE_COURSE_ONLINE]);
    cy.gotoHome();
    cy.get('.q-card').should('have.length', 1);
    cy.intercept('DELETE', '**/*').as('deleteReq006');
    cy.contains('button', 'Excluir').first().click();
    cy.wait('@deleteReq006');
    cy.screenshot('CT-006_toast');
    cy.reload();
    cy.screenshot('CT-006');
    // BUG-001: exclusão não remove do localStorage
    cy.getCourses().then((courses) => {
      cy.log(`[EVIDÊNCIA BUG-001] Cursos no localStorage após exclusão e reload: ${courses.length}`);
      cy.log(`[EVIDÊNCIA BUG-001] Conteúdo: ${JSON.stringify(courses.map(c => c.name))}`);
      cy.screenshot('CT-006_evidencia_localStorage').then(() => {
        expect(courses).to.have.length(0);
      });
    });
  });
});

// ── Suíte: Cenários negativos ─────────────────────────────────────
describe('Cenários negativos do cadastro', () => {
  beforeEach(() => {
    cy.gotoHome();
    cy.clearCourses();
  });

  it('CT-007: Cadastro com todos os campos vazios', () => {
    cy.gotoForm();
    cy.screenshot('CT-007_before');
    cy.clickCadastrar();
    cy.screenshot('CT-007');
    // BUG-002: formulário deveria bloquear envio com campos vazios
    cy.getCourses().then((courses) => {
      cy.log(`[EVIDÊNCIA BUG-002] Curso criado com campos vazios: ${courses.length > 0 ? 'SIM' : 'NÃO'}`);
      if (courses.length) cy.log(`[EVIDÊNCIA BUG-002] Dados: ${JSON.stringify(courses[courses.length - 1])}`);
      cy.screenshot('CT-007_evidencia_campos_vazios').then(() => {
        expect(courses).to.have.length(0);
      });
    });
  });

  it('CT-008: Cadastro sem selecionar tipo de curso', () => {
    cy.gotoForm();
    cy.get("input[aria-label='Nome do curso']").type('Curso Sem Tipo');
    cy.screenshot('CT-008_before');
    cy.clickCadastrar();
    cy.screenshot('CT-008');
    // BUG-002: formulário deveria exigir seleção de tipo
    cy.getCourses().then((courses) => {
      cy.log(`[EVIDÊNCIA BUG-002] Curso criado sem tipo: ${courses.length > 0 ? 'SIM' : 'NÃO'}`);
      if (courses.length) cy.log(`[EVIDÊNCIA BUG-002] Tipo salvo: ${JSON.stringify(courses[courses.length - 1].type)}`);
      cy.screenshot('CT-008_evidencia_sem_tipo').then(() => {
        expect(courses).to.have.length(0);
      });
    });
  });

  it('CT-009: Data fim anterior à data de início', () => {
    cy.gotoForm();
    cy.fillCourse({
      nome: 'Curso Datas Invertidas',
      descricao: 'Teste datas',
      instrutor: 'Inst',
      capa: 'https://picsum.photos/640/480',
      inicio: '2026-06-15',
      fim: '2026-06-10',
      vagas: '10',
      tipo: 'Online',
      link: 'https://example.com',
    });
    cy.screenshot('CT-009_form');
    cy.clickCadastrar();
    cy.screenshot('CT-009');
    // BUG-003: formulário deveria rejeitar data fim < data início
    cy.getCourses().then((courses) => {
      if (courses.length) {
        const last = courses[courses.length - 1];
        cy.log(`[EVIDÊNCIA BUG-003] Datas invertidas aceitas — início: ${last.startDate}, fim: ${last.endDate}`);
      }
      cy.screenshot('CT-009_evidencia_datas_invertidas').then(() => {
        expect(courses).to.have.length(0);
      });
    });
  });

  it('CT-010: Número de vagas negativo', () => {
    cy.gotoForm();
    cy.fillCourse({
      nome: 'Curso Vagas Negativas',
      descricao: 'Teste',
      instrutor: 'Inst',
      capa: 'https://picsum.photos/640/480',
      inicio: '2026-07-01',
      fim: '2026-07-15',
      vagas: '-5',
      tipo: 'Online',
      link: 'https://example.com',
    });
    cy.screenshot('CT-010_form');
    cy.clickCadastrar();
    cy.gotoHome();
    cy.screenshot('CT-010');
    // BUG-004: formulário deveria rejeitar vagas negativas
    cy.getCourses().then((courses) => {
      if (courses.length) {
        cy.log(`[EVIDÊNCIA BUG-004] Vagas negativas aceitas — valor salvo: ${courses[courses.length - 1].numberOfVagas}`);
      }
      cy.screenshot('CT-010_evidencia_vagas_negativas').then(() => {
        expect(courses).to.have.length(0);
      });
    });
  });

  it('CT-011: URL de imagem inválida', () => {
    cy.gotoForm();
    cy.fillCourse({
      nome: 'Curso URL Invalida',
      descricao: 'Teste',
      instrutor: 'Inst',
      capa: 'texto-invalido',
      inicio: '2026-07-01',
      fim: '2026-07-15',
      vagas: '10',
      tipo: 'Online',
      link: 'https://example.com',
    });
    cy.screenshot('CT-011_form');
    cy.clickCadastrar();
    cy.gotoHome();
    cy.screenshot('CT-011');
    // BUG-005: formulário deveria rejeitar URL de imagem inválida
    cy.getCourses().then((courses) => {
      if (courses.length) {
        cy.log(`[EVIDÊNCIA BUG-005] URL inválida aceita — cover: ${courses[courses.length - 1].cover}`);
      }
      cy.screenshot('CT-011_evidencia_url_invalida').then(() => {
        expect(courses).to.have.length(0);
      });
    });
  });

  it('CT-012: Injeção XSS no campo nome', () => {
    const xssPayload = `<img src="x" onerror="document.body.style.backgroundColor='red'; document.body.innerHTML='<h1 style=\\'color:white;text-align:center;margin-top:20%\\'>XSS EXECUTADO</h1>'">`;
    cy.gotoForm();
    cy.fillCourse({
      nome: xssPayload,
      descricao: 'XSS test',
      instrutor: 'Hacker',
      capa: 'https://picsum.photos/640/480',
      inicio: '2026-07-01',
      fim: '2026-07-15',
      vagas: '10',
      tipo: 'Online',
      link: 'https://example.com',
    });
    cy.screenshot('CT-012_form');
    cy.clickCadastrar();
    cy.gotoHome();
    cy.get('.q-card').should('exist');
    cy.screenshot('CT-012');
    // BUG-006: XSS não deveria ser executado
    cy.get('body').then(($body) => {
      const bgColor = $body.css('background-color');
      const bodyText = $body.text();
      const xssExecuted = bgColor === 'rgb(255, 0, 0)' || bodyText.includes('XSS EXECUTADO');
      cy.log(`[EVIDÊNCIA BUG-006] Background do body: "${bgColor}"`);
      cy.log(`[EVIDÊNCIA BUG-006] Contém "XSS EXECUTADO": ${bodyText.includes('XSS EXECUTADO')}`);
      cy.log(`[EVIDÊNCIA BUG-006] XSS executou: ${xssExecuted ? 'SIM — VULNERÁVEL' : 'NÃO'}`);
      cy.screenshot('CT-012_evidencia_xss').then(() => {
        expect(xssExecuted, 'XSS não deveria ser executado na página').to.be.false;
      });
    });
  });

  it('CT-013: Texto extremamente longo (10.000 chars) no nome', () => {
    const longName = 'A'.repeat(10000);
    cy.gotoForm();
    // invoke('val') + trigger('input') em vez de type() para 10k chars
    cy.get("input[aria-label='Nome do curso']").invoke('val', longName).trigger('input');
    cy.fillCourse({
      descricao: 'Texto longo',
      instrutor: 'Inst',
      capa: 'https://picsum.photos/640/480',
      inicio: '2026-07-01',
      fim: '2026-07-15',
      vagas: '10',
      tipo: 'Online',
      link: 'https://example.com',
    });
    cy.clickCadastrar();
    cy.gotoHome();
    cy.screenshot('CT-013');
    // BUG-007: formulário deveria limitar caracteres no nome
    cy.getCourses().then((courses) => {
      const nameLen = courses.length ? courses[courses.length - 1].name.length : 0;
      cy.log(`[EVIDÊNCIA BUG-007] Comprimento do nome salvo: ${nameLen} caracteres`);
      cy.log(`[EVIDÊNCIA BUG-007] Nome com 10k+ chars aceito: ${nameLen >= 10000 ? 'SIM' : 'NÃO'}`);
      cy.screenshot('CT-013_evidencia_texto_longo').then(() => {
        expect(courses.length === 0 || nameLen < 10000,
          'Nome com 10.000+ caracteres não deveria ser aceito').to.be.true;
      });
    });
  });

  it('CT-014: Exclusão não remove do localStorage', () => {
    cy.setCourses([makeCourse({ name: 'Curso Para Excluir' })]);
    cy.gotoHome();
    cy.screenshot('CT-014_before');
    cy.intercept('DELETE', '**/*').as('deleteReq014');
    cy.contains('button', 'Excluir').first().click();
    cy.wait('@deleteReq014');
    cy.screenshot('CT-014_after_click');
    cy.reload();
    cy.screenshot('CT-014');
    // BUG-001: curso deveria ser removido do localStorage após exclusão
    cy.getCourses().then((courses) => {
      cy.log(`[EVIDÊNCIA BUG-001] Cursos no localStorage após exclusão + reload: ${courses.length}`);
      cy.log(`[EVIDÊNCIA BUG-001] Curso não removido: ${JSON.stringify(courses.map(c => c.name))}`);
      cy.screenshot('CT-014_evidencia_nao_removido').then(() => {
        expect(courses).to.have.length(0);
      });
    });
  });
});

// ── Suíte: Validações de campos ───────────────────────────────────
describe('Validações de campos do formulário', () => {
  it('CT-015: Campo condicional — tipo Online mostra Link', () => {
    cy.gotoForm();
    cy.selectTipo('Online');
    cy.get("input[aria-label='Link de inscrição']").should('exist');
    cy.get("input[aria-label='Endereço']").should('not.exist');
    cy.screenshot('CT-015');
  });

  it('CT-016: Campo condicional — tipo Presencial mostra Endereço', () => {
    cy.gotoForm();
    cy.selectTipo('Presencial');
    cy.get("input[aria-label='Endereço']").should('exist');
    cy.get("input[aria-label='Link de inscrição']").should('not.exist');
    cy.screenshot('CT-016');
  });

  it('CT-017: Nenhum campo condicional quando tipo não selecionado', () => {
    cy.gotoForm();
    cy.get("input[aria-label='Link de inscrição']").should('not.exist');
    cy.get("input[aria-label='Endereço']").should('not.exist');
    cy.screenshot('CT-017');
  });

  it('CT-018: Alternar tipo Online → Presencial troca campos', () => {
    cy.gotoForm();
    cy.selectTipo('Online');
    cy.get("input[aria-label='Link de inscrição']").type('https://example.com');
    cy.screenshot('CT-018_online');
    cy.selectTipo('Presencial');
    cy.get("input[aria-label='Endereço']").should('exist');
    cy.get("input[aria-label='Link de inscrição']").should('not.exist');
    cy.screenshot('CT-018');
  });

  it('CT-019: Campo vagas é do tipo number', () => {
    cy.gotoForm();
    cy.get("input[aria-label='Número de vagas']")
      .should('have.attr', 'type', 'number');
    cy.screenshot('CT-019');
  });

  it('CT-020: Caracteres especiais nos campos de texto', () => {
    cy.gotoHome();
    cy.clearCourses();
    const specialName = 'Curso @#$%! àéîõü 日本語';
    cy.gotoForm();
    cy.fillCourse({
      nome: specialName,
      descricao: 'Acentos: ãõéí',
      instrutor: 'José María',
      capa: 'https://picsum.photos/640/480',
      inicio: '2026-07-01',
      fim: '2026-07-15',
      vagas: '10',
      tipo: 'Online',
      link: 'https://example.com',
    });
    cy.clickCadastrar();
    cy.screenshot('CT-020');
    cy.getCourses().then((courses) => {
      expect(courses).to.have.length(1);
      expect(courses[0].name).to.eq(specialName);
      expect(courses[0].instructor).to.eq('José María');
    });
  });
});

// ── Suíte: Comportamentos inesperados ─────────────────────────────
describe('Comportamentos inesperados', () => {
  it('CT-021: Acessar página inexistente (404)', () => {
    cy.visit('/pagina-inexistente', { failOnStatusCode: false });
    cy.get('body').invoke('text').should('match', /404|not found/i);
    cy.screenshot('CT-021');
  });

  it('CT-022: Navegação listagem → cadastro', () => {
    cy.gotoHome();
    cy.screenshot('CT-022_home');
    cy.get("a[href='/new-course']").click();
    cy.get("input[aria-label='Nome do curso']").should('be.visible');
    cy.screenshot('CT-022');
  });

  it('CT-023: Duplo clique no botão Cadastrar', () => {
    cy.gotoHome();
    cy.clearCourses();
    cy.gotoForm();
    cy.fillCourse({
      nome: 'Curso Duplo Clique',
      descricao: 'Teste',
      instrutor: 'Inst',
      capa: 'https://picsum.photos/640/480',
      inicio: '2026-07-01',
      fim: '2026-07-15',
      vagas: '10',
      tipo: 'Online',
      link: 'https://example.com',
    });
    cy.window().then((win) => {
      const btn = win.document.querySelector('button.bg-primary');
      if (btn) { btn.click(); btn.click(); }
    });
    cy.url().should('include', '/');
    cy.gotoHome();
    cy.screenshot('CT-023');
    // BUG-008: duplo clique não deveria criar cursos duplicados
    cy.getCourses().then((courses) => {
      cy.log(`[EVIDÊNCIA BUG-008] Cursos criados após duplo clique: ${courses.length}`);
      cy.log(`[EVIDÊNCIA BUG-008] Nomes: ${JSON.stringify(courses.map(c => c.name))}`);
      cy.screenshot('CT-023_evidencia_duplo_clique').then(() => {
        expect(courses).to.have.length(1);
      });
    });
  });

  it('CT-024: Persistência dos dados após reload', () => {
    cy.gotoHome();
    cy.clearCourses();
    cy.setCourses([makeCourse({ name: 'Curso Persistência', numberOfVagas: 20 })]);
    cy.gotoHome();
    cy.screenshot('CT-024_before');
    cy.reload();
    cy.get('.q-card').should('have.length.gte', 1);
    cy.screenshot('CT-024');
  });

  it('CT-025: DELETE envia ID fixo na requisição', () => {
    cy.gotoHome();
    cy.clearCourses();
    cy.setCourses([
      makeCourse({ id: 1, name: 'Curso Alpha', url: 'https://a.com' }),
      makeCourse({ id: 2, name: 'Curso Beta', type: { label: 'Presencial', value: 'presencial' }, address: 'Rua X' }),
      makeCourse({ id: 3, name: 'Curso Gamma', url: 'https://c.com' }),
    ]);
    cy.gotoHome();
    cy.screenshot('CT-025_3courses');

    cy.intercept('DELETE', '**/*').as('deleteReq');
    cy.contains('button', 'Excluir').last().click();
    cy.wait('@deleteReq').then((interception) => {
      // BUG-001: sempre envia /courses/1 independentemente do curso
      cy.log(`[EVIDÊNCIA BUG-001] URL da requisição DELETE: ${interception.request.url}`);
      cy.log(`[EVIDÊNCIA BUG-001] Esperado: /courses/3 — Recebido: ${interception.request.url.split('/').pop()}`);
      cy.screenshot('CT-025_evidencia_delete_id_fixo').then(() => {
        cy.screenshot('CT-025');
      }).then(() => {
        expect(interception.request.url).to.include('/courses/3',
          'DELETE deveria enviar o ID do curso clicado, não ID fixo');
      });
    });
  });
});