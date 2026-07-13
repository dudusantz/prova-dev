describe('Funcionários', () => {
  const uniq = () => `${Date.now()}${Cypress._.random(10, 99)}`;

  function gerarCpf() {
    const n = Array.from({ length: 9 }, () => Math.floor(Math.random() * 9));
    const calc = (base, factor) => {
      const sum = base.reduce((acc, digit, i) => acc + digit * (factor - i), 0);
      const mod = (sum * 10) % 11;
      return mod === 10 ? 0 : mod;
    };
    n.push(calc(n, 10));
    n.push(calc(n, 11));
    const s = n.join('');
    return `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6, 9)}-${s.slice(9)}`;
  }

  it('cadastra um novo funcionário com vínculo pela UI', () => {
    const nome = `Func UI ${uniq()}`;
    const cpf = gerarCpf();
    const empresa = `Empresa UI ${uniq()}`;
    const matricula = `MU${uniq()}`.slice(0, 20);

    cy.criarCargoApi().then((cargo) => {
      cy.criarDepartamentoApi().then((depto) => {
        cy.visit('/funcionarios/novo');
        cy.contains('h1', 'Cadastro de Funcionário').should('be.visible');

        cy.preencherCampoPorLegenda('Nome do Funcionário', nome);
        cy.preencherCampoPorLegenda('CPF', cpf.replace(/\D/g, ''));

        cy.clicarBotao('Novo Vínculo');
        cy.contains('h3', 'Novo Vínculo').should('be.visible');

        cy.contains('h3', 'Novo Vínculo')
          .parent()
          .within(() => {
            cy.preencherCampoPorLegenda('Nome da Empresa', empresa);
            cy.preencherCampoPorLegenda('Matrícula', matricula);
            cy.contains('legend', 'Cargo').parent().find('select').select(String(cargo.id));
            cy.contains('legend', 'Departamento').parent().find('select').select(String(depto.id));
            cy.contains('button', 'Confirmar').click();
          });

        cy.contains('h3', 'Novo Vínculo').should('not.exist');
        cy.contains('td', empresa).should('be.visible');
        cy.contains('button', 'Confirmar').should('be.visible').click();

        cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
        cy.preencherCampoPorLegenda('Nome do Funcionário', nome);
        cy.clicarBotao('Filtrar');
        cy.contains('td', nome).should('be.visible');
        cy.contains('td', cpf).should('be.visible');
      });
    });
  });

  it('edita um funcionário existente', () => {
    cy.criarFuncionarioApi().then((func) => {
      const novoNome = `Func Editado ${uniq()}`;

      cy.visit(`/funcionarios/editar/${func.id}`);
      cy.contains('h1', 'Editar Funcionário').should('be.visible');
      cy.preencherCampoPorLegenda('Nome do Funcionário', novoNome);
      cy.clicarBotao('Salvar');

      cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
      cy.preencherCampoPorLegenda('Nome do Funcionário', novoNome);
      cy.clicarBotao('Filtrar');
      cy.contains('td', novoNome).should('be.visible');
    });
  });

  it('pesquisa por nome e CPF', () => {
    cy.criarFuncionarioApi({ nome: `Busca Cypress ${uniq()}` }).then((func) => {
      cy.visit('/');
      cy.preencherCampoPorLegenda('Nome do Funcionário', func.nome);
      cy.clicarBotao('Filtrar');
      cy.contains('td', func.cpf).should('be.visible');

      cy.clicarBotao('Limpar Filtros');
      cy.preencherCampoPorLegenda('CPF', func.cpf);
      cy.clicarBotao('Filtrar');
      cy.contains('td', func.nome).should('be.visible');
    });
  });

  it('navega pela paginação quando há mais de 10 registos', () => {
    cy.garantirPaginasFuncionarios(11);
    cy.visit('/');
    cy.contains('A visualizar página 1 de').scrollIntoView().should('be.visible');
    cy.clicarBotao('Próxima');
    cy.contains('A visualizar página 2 de').scrollIntoView().should('be.visible');
    cy.clicarBotao('Anterior');
    cy.contains('A visualizar página 1 de').scrollIntoView().should('be.visible');
  });

  it('gera relatório PDF via backend com todos os filtrados', () => {
    cy.criarFuncionarioApi().then((func) => {
      cy.intercept('GET', '**/api/funcionarios/relatorio*').as('relatorio');
      cy.visit('/');
      cy.preencherCampoPorLegenda('Nome do Funcionário', func.nome);
      cy.clicarBotao('Filtrar');
      cy.contains('td', func.nome).should('be.visible');
      cy.clicarBotao('Baixar Relatório');
      cy.wait('@relatorio').its('response.statusCode').should('eq', 200);
      cy.get('@relatorio').its('response.headers.content-type').should('include', 'application/pdf');
    });
  });
});
