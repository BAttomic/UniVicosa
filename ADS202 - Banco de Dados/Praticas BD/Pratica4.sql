-- Questão A
-- Para cada departamento cujo salário médio do funcionário seja maior que R$ 30000,00,
-- recupere o nome do departamento e o número de funcionários que trabalham nele.
SELECT d.Nome_Departamento, COUNT(f.CPF) AS Numero_Funcionarios
FROM Funcionario f
JOIN Departamento d ON f.Numero_Departamento = d.Numero_Departamento
GROUP BY d.Nome_Departamento
HAVING AVG(f.Salario) > 30000;

-- Questão B
-- Suponha que queiramos o número de funcionários do sexo masculino em cada departamento que ganhe
-- mais de R$ 30000,00. Podemos especificar essa consulta em SQL? Por quê?
-- Sim, podemos especificar essa consulta em SQL, conforme abaixo:
SELECT d.Numero_Departamento, COUNT(f.CPF) AS Numero_Funcionarios
FROM Funcionario f
JOIN Departamento d ON f.Numero_Departamento = d.Numero_Departamento
WHERE f.Sexo = 'M' AND f.Salario > 30000
GROUP BY d.Numero_Departamento;


-- Questão C
-- Para cada departamento, recuperar o número do departamento, o nome do departamento,
-- o número de funcionários no departamento e seu salário médio.
SELECT f.Numero_Departamento, d.Nome_Departamento, COUNT(f.CPF) AS Numero_Funcionarios, 
       ROUND(AVG(f.Salario), 2) AS Salario_Medio
FROM Funcionario f
JOIN Departamento d ON f.Numero_Departamento = d.Numero_Departamento
GROUP BY f.Numero_Departamento, d.Nome_Departamento;

-- Questão D
-- Achar a soma dos salários de todos os funcionários de cada departamento, bem como o salário máximo, 
-- o salário mínimo e a média dos salários para cada departamento.
SELECT f.Numero_Departamento, 
       ROUND(SUM(f.Salario), 2) AS Salario_Total,
       ROUND(MAX(f.Salario), 2) AS Salario_Maximo,
       ROUND(MIN(f.Salario), 2) AS Salario_Minimo,
       ROUND(AVG(f.Salario), 2) AS Salario_Medio
FROM Funcionario f
GROUP BY f.Numero_Departamento;

-- Questão E
-- Recupere os nomes de todos os funcionários que trabalham no departamento que tem o funcionário
-- com o maior salário entre todos os funcionários.
SELECT f.Primeiro_Nome, f.Nome_Meio, f.Ultimo_Nome
FROM Funcionario f
WHERE f.Numero_Departamento = (SELECT f1.Numero_Departamento
                                FROM Funcionario f1
                                ORDER BY f1.Salario DESC
                                LIMIT 1);

-- Questão F
-- Recupere os nomes dos funcionários que ganham pelo menos R$ 10.000,00 a mais que o funcionário que
-- recebe menos na empresa.
SELECT f.Primeiro_Nome, f.Nome_Meio, f.Ultimo_Nome
FROM Funcionario f
WHERE f.Salario >= (SELECT MIN(f1.Salario) + 10000
                    FROM Funcionario f1);

-- Questão G
-- Uma visão que tem o nome do departamento, o nome do gerente e o salário do gerente para cada departamento.
DROP VIEW IF EXISTS Visao_Gerentes;
CREATE VIEW Visao_Gerentes AS
SELECT d.Nome_Departamento, 
       CONCAT(f.Primeiro_Nome, ' ', f.Nome_Meio, ' ', f.Ultimo_Nome) AS Nome_Gerente, 
       f.Salario AS Salario_Gerente
FROM Departamento d
JOIN Funcionario f ON d.CPF_Gerente = f.CPF;
SELECT * FROM Visao_Gerentes;

-- Questão H
-- Uma visão que tenha o nome do projeto, o nome do departamento que o controla, o número de funcionários
-- e o total de horas trabalhadas por semana em cada projeto.
DROP VIEW IF EXISTS Visao_Projetos;
CREATE VIEW Visao_Projetos AS
SELECT p.Nome_Projeto, 
       d.Nome_Departamento, 
       COUNT(te.CPF_Funcionario) AS Numero_Funcionarios, 
       SUM(te.Horas) AS Total_Horas
FROM Projeto p
JOIN Departamento d ON p.Numero_Departamento = d.Numero_Departamento
JOIN Trabalha_Em te ON p.Numero_Projeto = te.Numero_Projeto
GROUP BY p.Nome_Projeto, d.Nome_Departamento;
SELECT * FROM Visao_Projetos;