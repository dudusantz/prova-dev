describe('Cargos', () => {
  const uniq = () => `${Date.now()}${Cypress._.random(10, 99)}`;

  it('cadastra um novo cargo pela UI', () => {
    const codigo = `UI${uniq()}`.slice(0, 50);
    const descricao = `Cargo UI ${uniq()}`;

    cy.visit('/cargos/novo');
    cy.contains('h1', 'Cadastro de Cargo').should('be.visible');
    cy.preencherCampoPorLegenda('Descrição do Cargo', descricao);
    cy.preencherCampoPorLegenda('Código do Cargo', codigo);
    cy.clicarBotao('Confirmar');

    cy.url().should('include', '/cargos');
    cy.contains('h1', 'Cargos').should('be.visible');

    cy.intercept('GET', '**/api/cargos*').as('filtrarCargos');
    cy.preencherCampoPorLegenda('Código', codigo);
    cy.clicarBotao('Filtrar');
    cy.wait('@filtrarCargos');
    cy.contains('td', codigo).should('be.visible');
    cy.contains('td', descricao).should('be.visible');
  });

  it('edita um cargo existente', () => {
    cy.criarCargoApi().then((cargo) => {
      const novaDescricao = `Cargo Editado ${uniq()}`;

      cy.visit(`/cargos/editar/${cargo.id}`);
      cy.contains('h1', 'Editar Cargo').should('be.visible');
      cy.preencherCampoPorLegenda('Descrição do Cargo', novaDescricao);
      cy.clicarBotao('Salvar');

      cy.url().should('include', '/cargos');
      cy.preencherCampoPorLegenda('Código', cargo.codigoCargo);
      cy.clicarBotao('Filtrar');
      cy.contains('td', novaDescricao).should('be.visible');
    });
  });

  it('pesquisa por descrição e código', () => {
    cy.criarCargoApi({ descricao: 'Analista Cypress Unique', codigoCargo: `AQ${uniq()}` }).then((cargo) => {
      cy.visit('/cargos');
      cy.preencherCampoPorLegenda('Descrição do Cargo', 'Analista Cypress Unique');
      cy.clicarBotao('Filtrar');
      cy.contains('td', cargo.codigoCargo).should('be.visible');

      cy.clicarBotao('Limpar Filtros');
      cy.preencherCampoPorLegenda('Código', cargo.codigoCargo);
      cy.clicarBotao('Filtrar');
      cy.contains('td', 'Analista Cypress Unique').should('be.visible');
    });
  });

  it('navega pela paginação quando há mais de 10 registos', () => {
    cy.garantirPaginasCargos(11);
    cy.visit('/cargos');
    cy.contains('A visualizar página 1 de').scrollIntoView().should('be.visible');
    cy.contains('button', '2').click();
    cy.contains('A visualizar página 2 de').scrollIntoView().should('be.visible');
    cy.clicarBotao('Anterior');
    cy.contains('A visualizar página 1 de').scrollIntoView().should('be.visible');
  });

  it('gera relatório PDF via backend', () => {
    cy.criarCargoApi().then((cargo) => {
      cy.intercept('GET', '**/api/cargos/relatorio*').as('relatorio');
      cy.visit('/cargos');
      cy.preencherCampoPorLegenda('Código', cargo.codigoCargo);
      cy.clicarBotao('Filtrar');
      cy.contains('td', cargo.codigoCargo).should('be.visible');
      cy.clicarBotao('Baixar Relatório');
      cy.wait('@relatorio').its('response.statusCode').should('eq', 200);
      cy.get('@relatorio').its('response.headers.content-type').should('include', 'application/pdf');
    });
  });

  it('inativa um cargo pela edição e lista nos inativos', () => {
    cy.criarCargoApi().then((cargo) => {
      cy.visit(`/cargos/editar/${cargo.id}`);
      cy.contains('legend', 'Situação').parent().find('select').select('inativo');
      cy.clicarBotao('Salvar');

      cy.url().should('include', '/cargos');
      cy.preencherCampoPorLegenda('Código', cargo.codigoCargo);
      cy.clicarBotao('Filtrar');
      cy.contains('td', cargo.codigoCargo).should('not.exist');

      cy.contains('legend', 'Situação').parent().find('select').select('inativo');
      cy.clicarBotao('Filtrar');
      cy.contains('td', cargo.codigoCargo).should('be.visible');
      cy.contains('td', 'Inativo').should('be.visible');
    });
  });
});
