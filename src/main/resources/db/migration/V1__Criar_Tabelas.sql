CREATE TABLE cargos (
    id BIGSERIAL PRIMARY KEY,
    codigo_cargo VARCHAR(50) UNIQUE NOT NULL,
    descricao VARCHAR(150) NOT NULL
);

CREATE TABLE departamentos (
    id BIGSERIAL PRIMARY KEY,
    codigo_departamento VARCHAR(50) UNIQUE NOT NULL,
    descricao VARCHAR(150) NOT NULL
);

CREATE TABLE funcionarios (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL
);

CREATE TABLE vinculos (
    id BIGSERIAL PRIMARY KEY,
    empresa VARCHAR(150) NOT NULL,
    matricula VARCHAR(50) NOT NULL,
    funcionario_id BIGINT NOT NULL,
    cargo_id BIGINT NOT NULL,
    departamento_id BIGINT NOT NULL,
    CONSTRAINT fk_funcionario FOREIGN KEY (funcionario_id) REFERENCES funcionarios (id),
    CONSTRAINT fk_cargo FOREIGN KEY (cargo_id) REFERENCES cargos (id),
    CONSTRAINT fk_departamento FOREIGN KEY (departamento_id) REFERENCES departamentos (id)
);