-- Questão A
-- Seleciona o Primeiro_Nome, Nome_Meio, Ultimo_Nome e Endereco de Funcionario
-- Faz um join entre a tabela Funcionario e a tabela Departamento, relacionando através do número do departamento
-- Filtra os resultados para apenas aqueles onde o Nome_Departamento é 'Pesquisa'
SELECT F.Primeiro_Nome, F.Nome_Meio, F.Ultimo_Nome, F.Endereco 
FROM Funcionario F 
JOIN Departamento D ON F.Numero_Departamento = D.Numero_Departamento
WHERE D.Nome_Departamento = 'Pesquisa';

-- Questão B
-- Seleciona o Numero_Projeto, Numero_Departamento, Sobrenome_Gerente, Endereco_Gerente e Data_Nascimento_Gerente de Projeto
-- Faz joins entre as tabelas Projeto, Departamento e Funcionario, relacionando através de chaves estrangeiras
-- Filtra os resultados para apenas aqueles onde o Local_Projeto é 'Mauá'
SELECT P.Numero_Projeto, P.Numero_Departamento, 
       F.Ultimo_Nome AS Sobrenome_Gerente, F.Endereco AS Endereco_Gerente, F.Data_Nascimento AS Data_Nascimento_Gerente
FROM Projeto P
JOIN Departamento D ON P.Numero_Departamento = D.Numero_Departamento
JOIN Funcionario F ON D.CPF_Gerente = F.CPF
WHERE P.Local_Projeto = 'Mauá';

-- Questão C
-- Seleciona Primeiro_Nome_Funcionario, Ultimo_Nome_Funcionario, Primeiro_Nome_Supervisor e Ultimo_Nome_Supervisor
-- Faz um LEFT JOIN entre a tabela Funcionario e ela mesma, relacionando pelo CPF do supervisor
SELECT F.Primeiro_Nome AS Primeiro_Nome_Funcionario, F.Ultimo_Nome AS Ultimo_Nome_Funcionario,
       FS.Primeiro_Nome AS Primeiro_Nome_Supervisor, FS.Ultimo_Nome AS Ultimo_Nome_Supervisor
FROM Funcionario F
LEFT JOIN Funcionario FS ON F.CPF_Supervisor = FS.CPF;

-- Questão D
-- Seleciona CPF e Salario de Funcionario
SELECT CPF, Salario
FROM Funcionario;

-- Questão E
-- Seleciona valores únicos de Salario de Funcionario
SELECT DISTINCT Salario
FROM Funcionario;

-- Questão f
-- Seleciona valores distintos de Numero_Projeto de Projeto
-- Faz joins entre as tabelas Projeto, Departamento e Funcionario, relacionando através de chaves estrangeiras
-- Filtra os resultados para apenas aqueles onde o Ultimo_Nome é 'Silva' (seja como funcionário ou gerente)
SELECT DISTINCT P.Numero_Projeto
FROM Projeto P
JOIN Departamento D ON P.Numero_Departamento = D.Numero_Departamento
JOIN Funcionario F ON (P.Numero_Departamento = F.Numero_Departamento AND F.Ultimo_Nome = 'Silva')
   OR (D.CPF_Gerente = F.CPF AND F.Ultimo_Nome = 'Silva');

-- Questão G
-- Seleciona todas as colunas de Funcionario
-- Filtra os resultados para apenas aqueles onde o Endereco contém 'Belo Horizonte, MG'
SELECT *
FROM Funcionario
WHERE Endereco LIKE '%Belo Horizonte, MG%';

-- Questão H
-- Seleciona todas as colunas de Funcionario
-- Filtra os resultados para apenas aqueles onde o ano de Data_Nascimento está entre 1950 e 1959
SELECT *
FROM Funcionario
WHERE YEAR(Data_Nascimento) BETWEEN 1950 AND 1959;

-- Questão I
-- Seleciona CPF e o novo Salario, calculado como 10% a mais do Salario atual, de Funcionario
-- Faz joins entre as tabelas Funcionario, Trabalha_Em e Projeto, relacionando através de chaves estrangeiras
-- Filtra os resultados para apenas aqueles onde o Nome_Projeto é 'ProdutoX'
SELECT F.CPF, F.Salario * 1.10 AS Novo_Salario
FROM Funcionario F
JOIN Trabalha_Em TE ON F.CPF = TE.CPF_Funcionario
JOIN Projeto P ON TE.Numero_Projeto = P.Numero_Projeto
WHERE P.Nome_Projeto = 'ProdutoX';

-- Questão J
-- Seleciona todas as colunas de Funcionario
-- Filtra os resultados para apenas aqueles onde o Numero_Departamento é 5 e o Salario está entre 30000 e 40000
SELECT *
FROM Funcionario
WHERE Numero_Departamento = 5 AND Salario BETWEEN 30000 AND 40000;