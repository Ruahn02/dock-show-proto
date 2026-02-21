-- Limpar dados operacionais (manter conferentes e fornecedores)
DELETE FROM cross_docking;

UPDATE docas SET status = 'livre', carga_id = NULL, senha_id = NULL, 
  conferente_id = NULL, volume_conferido = NULL, rua = NULL;

DELETE FROM cargas;
DELETE FROM senhas;
DELETE FROM solicitacoes;