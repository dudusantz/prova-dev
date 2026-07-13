const apiUrl = () => Cypress.env('apiUrl') || 'http://localhost:8080/api';

function suffix() {
  return `${Date.now()}${Cypress._.random(100, 999)}`;
}

/** Gera um CPF matematicamente válido (formato 000.000.000-00). */
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

Cypress.Commands.add('apiGet', (path, qs = {}) => {
  return cy.request({
    method: 'GET',
    url: `${apiUrl()}${path}`,
    qs,
    failOnStatusCode: true,
  });
});

Cypress.Commands.add('apiPost', (path, body) => {
  return cy.request({
    method: 'POST',
    url: `${apiUrl()}${path}`,
    body,
    failOnStatusCode: true,
  });
});

Cypress.Commands.add('apiPut', (path, body) => {
  return cy.request({
    method: 'PUT',
    url: `${apiUrl()}${path}`,
    body,
    failOnStatusCode: true,
  });
});

Cypress.Commands.add('criarCargoApi', (overrides = {}) => {
  const id = suffix();
  const payload = {
    codigoCargo: overrides.codigoCargo || `C${id}`.slice(0, 50),
    descricao: overrides.descricao || `Cargo E2E ${id}`,
  };
  return cy.apiPost('/cargos', payload).then((res) => res.body);
});

Cypress.Commands.add('criarDepartamentoApi', (overrides = {}) => {
  const id = suffix();
  const payload = {
    codigoDepartamento: overrides.codigoDepartamento || `D${id}`.slice(0, 50),
    descricao: overrides.descricao || `Depto E2E ${id}`,
  };
  return cy.apiPost('/departamentos', payload).then((res) => res.body);
});

Cypress.Commands.add('criarFuncionarioApi', (overrides = {}) => {
  const id = suffix();
  const nome = overrides.nome || `Funcionario E2E ${id}`;
  const cpf = overrides.cpf || gerarCpf();

  const cargoChain = overrides.cargoId
    ? cy.wrap({ id: overrides.cargoId })
    : cy.criarCargoApi();

  return cargoChain.then((cargo) => {
    const deptoChain = overrides.departamentoId
      ? cy.wrap({ id: overrides.departamentoId })
      : cy.criarDepartamentoApi();

    return deptoChain.then((depto) => {
      const payload = {
        nome,
        cpf,
        vinculos: overrides.vinculos || [
          {
            empresa: overrides.empresa || `Empresa ${id}`,
            matricula: overrides.matricula || `M${id}`.slice(0, 20),
            cargoId: cargo.id,
            departamentoId: depto.id,
          },
        ],
      };

      return cy.apiPost('/funcionarios', payload).then(() =>
        cy.apiGet('/funcionarios', { nome, page: 0, size: 20 }).then((res) => {
          const encontrado = (res.body.content || []).find((f) => f.cpf === cpf || f.nome === nome);
          return {
            ...payload,
            id: encontrado?.id,
            cargoId: cargo.id,
            departamentoId: depto.id,
          };
        })
      );
    });
  });
});

Cypress.Commands.add('preencherCampoPorLegenda', (legenda, valor) => {
  cy.contains('legend', legenda).parent().find('input').clear({ force: true });
  cy.contains('legend', legenda).parent().find('input').type(valor, { delay: 0, force: true });
});

Cypress.Commands.add('clicarBotao', (texto) => {
  cy.contains('button', texto).click();
});

Cypress.Commands.add('garantirPaginasCargos', (minTotal = 11) => {
  cy.apiGet('/cargos', { page: 0, size: 1 }).then((res) => {
    const total = res.body.totalElements || 0;
    const faltam = Math.max(0, minTotal - total);
    for (let i = 0; i < faltam; i += 1) {
      cy.criarCargoApi();
    }
  });
});

Cypress.Commands.add('garantirPaginasDepartamentos', (minTotal = 11) => {
  cy.apiGet('/departamentos', { page: 0, size: 1 }).then((res) => {
    const total = res.body.totalElements || 0;
    const faltam = Math.max(0, minTotal - total);
    for (let i = 0; i < faltam; i += 1) {
      cy.criarDepartamentoApi();
    }
  });
});

Cypress.Commands.add('garantirPaginasFuncionarios', (minTotal = 11) => {
  cy.apiGet('/funcionarios', { page: 0, size: 1 }).then((res) => {
    const total = res.body.totalElements || 0;
    const faltam = Math.max(0, minTotal - total);
    for (let i = 0; i < faltam; i += 1) {
      cy.criarFuncionarioApi();
    }
  });
});
