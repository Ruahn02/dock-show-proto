
-- Limpar dados operacionais preservando dados mestres (fornecedores, conferentes)
-- Ordem respeitando foreign keys

-- 1. Cross docking (depende de cargas)
TRUNCATE TABLE public.cross_docking;

-- 2. Docas (limpar vínculos)
UPDATE public.docas SET status = 'livre', carga_id = NULL, senha_id = NULL, conferente_id = NULL, volume_conferido = NULL, rua = NULL;

-- 3. Senhas (depende de cargas e fornecedores)
TRUNCATE TABLE public.senhas CASCADE;

-- 4. Cargas (depende de fornecedores e solicitações)
TRUNCATE TABLE public.cargas CASCADE;

-- 5. Solicitações
TRUNCATE TABLE public.solicitacoes CASCADE;

-- Resetar sequence das senhas
ALTER SEQUENCE senhas_numero_seq RESTART WITH 1;
