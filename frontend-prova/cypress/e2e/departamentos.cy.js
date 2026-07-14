describe('Departamentos', () => {
  const uniq = () => `${Date.now()}${Cypress._.random(10, 99)}`;

  it('cadastra um novo departamento pela UI', () => {
    const codigo = `UI${uniq()}`.slice(0, 50);
    const descricao = `Depto UI ${uniq()}`;

    cy.visit('/departamentos/novo');
    cy.contains('h1', 'Cadastro de Departamento').should('be.visible');
    cy.preencherCampoPorLegenda('Descrição do Departamento', descricao);
    cy.preencherCampoPorLegenda('Código do Departamento', codigo);
    cy.clicarBotao('Confirmar');

    cy.url().should('include', '/departamentos');
    cy.preencherCampoPorLegenda('Código', codigo);
    cy.clicarBotao('Filtrar');
    cy.contains('td', descricao).should('be.visible');
    cy.contains('td', codigo).should('be.visible');
  });

  it('edita um departamento existente', () => {
    cy.criarDepartamentoApi().then((depto) => {
      const novaDescricao = `Depto Editado ${uniq()}`;

      cy.visit(`/departamentos/editar/${depto.id}`);
      cy.contains('h1', 'Editar Departamento').should('be.visible');
      cy.preencherCampoPorLegenda('Descrição do Departamento', novaDescricao);
      cy.clicarBotao('Salvar');

      cy.url().should('include', '/departamentos');
      cy.preencherCampoPorLegenda('Código', depto.codigoDepartamento);
      cy.clicarBotao('Filtrar');
      cy.contains('td', novaDescricao).should('be.visible');
    });
  });

  it('pesquisa por descrição e código', () => {
    cy.criarDepartamentoApi({
      descricao: 'Financeiro Cypress Unique',
      codigoDepartamento: `FQ${uniq()}`,
    }).then((depto) => {
      cy.visit('/departamentos');
      cy.preencherCampoPorLegenda('Descrição do Departamento', 'Financeiro Cypress Unique');
      cy.clicarBotao('Filtrar');
      cy.contains('td', depto.codigoDepartamento).should('be.visible');

      cy.clicarBotao('Limpar Filtros');
      cy.preencherCampoPorLegenda('Código', depto.codigoDepartamento);
      cy.clicarBotao('Filtrar');
      cy.contains('td', 'Financeiro Cypress Unique').should('be.visible');
    });
  });

  it('navega pela paginação quando há mais de 10 registos', () => {
    cy.garantirPaginasDepartamentos(11);
    cy.visit('/departamentos');
    cy.contains('A visualizar página 1 de').scrollIntoView().should('be.visible');
    cy.contains('button', '2').click();
    cy.contains('A visualizar página 2 de').scrollIntoView().should('be.visible');
    cy.clicarBotao('Anterior');
    cy.contains('A visualizar página 1 de').scrollIntoView().should('be.visible');
  });

  it('gera relatório PDF via backend', () => {
    cy.criarDepartamentoApi().then((depto) => {
      cy.intercept('GET', '**/api/departamentos/relatorio*').as('relatorio');
      cy.visit('/departamentos');
      cy.preencherCampoPorLegenda('Código', depto.codigoDepartamento);
      cy.clicarBotao('Filtrar');
      cy.contains('td', depto.codigoDepartamento).should('be.visible');
      cy.clicarBotao('Baixar Relatório');
      cy.wait('@relatorio').its('response.statusCode').should('eq', 200);
      cy.get('@relatorio').its('response.headers.content-type').should('include', 'application/pdf');
    });
  });

  it('inativa um departamento pela edição e lista nos inativos', () => {
    cy.criarDepartamentoApi().then((depto) => {
      cy.visit(`/departamentos/editar/${depto.id}`);
      cy.contains('legend', 'Situação').parent().find('select').select('inativo');
      cy.clicarBotao('Salvar');

      cy.url().should('include', '/departamentos');
      cy.preencherCampoPorLegenda('Código', depto.codigoDepartamento);
      cy.clicarBotao('Filtrar');
      cy.contains('td', depto.codigoDepartamento).should('not.exist');

      cy.contains('legend', 'Situação').parent().find('select').select('inativo');
      cy.clicarBotao('Filtrar');
      cy.contains('td', depto.codigoDepartamento).should('be.visible');
      cy.contains('td', 'Inativo').should('be.visible');
    });
  });
});
