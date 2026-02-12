
-- Passo 1: Quebrar ciclos de FK circular
UPDATE cargas SET senha_id = NULL, doca_id = NULL;
UPDATE senhas SET carga_id = NULL;
UPDATE docas SET carga_id = NULL, senha_id = NULL, conferente_id = NULL;

-- Passo 2: Deletar na ordem correta
DELETE FROM cross_docking;
DELETE FROM docas;
DELETE FROM senhas;
DELETE FROM cargas;
DELETE FROM solicitacoes;
DELETE FROM conferentes;
DELETE FROM fornecedores;
