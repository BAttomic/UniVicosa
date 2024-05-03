-- Tabela Funcionario
CREATE TABLE Funcionario (
    CPF VARCHAR(11) PRIMARY KEY,
    Primeiro_Nome VARCHAR(50),
    Nome_Meio VARCHAR(50),
    Ultimo_Nome VARCHAR(50),
    Data_Nascimento DATE,
    Endereco VARCHAR(100),
    Sexo CHAR(1),
    Salario DECIMAL(10, 2),
    CPF_Supervisor VARCHAR(11),
    Numero_Departamento INT
);

-- Tabela Departamento
CREATE TABLE Departamento (
    Numero_Departamento INT PRIMARY KEY,
    Nome_Departamento VARCHAR(100),
    CPF_Gerente VARCHAR(11),
    Data_Inicio_Gerente DATE
);

-- Tabela Localizacoes_Departamento
CREATE TABLE Localizacoes_Departamento (
    Numero_Departamento INT,
    Local VARCHAR(100),
    PRIMARY KEY (Numero_Departamento, Local)
);

-- Tabela Projeto
CREATE TABLE Projeto (
    Numero_Projeto INT PRIMARY KEY,
    Nome_Projeto VARCHAR(100),
    Local_Projeto VARCHAR(100),
    Numero_Departamento INT
);

-- Tabela Trabalha_Em
CREATE TABLE Trabalha_Em (
    CPF_Funcionario VARCHAR(11),
    Numero_Projeto INT,
    Horas INT,
    PRIMARY KEY (CPF_Funcionario, Numero_Projeto)
);

-- Tabela Dependente
CREATE TABLE Dependente (
    CPF_Funcionario VARCHAR(11),
    Nome_Dependente VARCHAR(100),
    Sexo CHAR(1),
    Data_Nascimento DATE,
    Parentesco VARCHAR(50),
    PRIMARY KEY (CPF_Funcionario, Nome_Dependente)
);
