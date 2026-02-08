
-- Seed fornecedores
INSERT INTO fornecedores (nome, ativo, email) VALUES
('Distribuidora ABC Ltda', true, 'contato@abc.com.br'),
('Atacado Nacional S.A.', true, 'logistica@atacadonacional.com'),
('Logística Express', true, 'agendamento@logexpress.com'),
('Fornecedor Master', true, 'entregas@master.com.br'),
('Central de Cargas', true, 'operacoes@centralcargas.com'),
('Transporte Rápido', true, 'atendimento@transporterapido.com'),
('Distribuidora Sul', false, 'contato@distsul.com.br'),
('Mega Atacado', true, 'agendamento@megaatacado.com'),
('Comércio Global', true, 'entregas@comercioglobal.com'),
('Norte Logística', false, 'contato@nortelogistica.com');

-- Seed conferentes
INSERT INTO conferentes (nome, ativo) VALUES
('João Silva', true),
('Maria Santos', true),
('Pedro Oliveira', true),
('Ana Costa', true),
('Carlos Ferreira', true),
('Juliana Lima', true),
('Roberto Alves', false),
('Fernanda Souza', true);

-- Seed docas (6 docas, todas livres inicialmente)
INSERT INTO docas (numero, status) VALUES
(1, 'livre'),
(2, 'livre'),
(3, 'livre'),
(4, 'livre'),
(5, 'livre'),
(6, 'livre');
