
-- 1. Criar tabela fornecedores
CREATE TABLE public.fornecedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Criar tabela conferentes
CREATE TABLE public.conferentes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Criar tabela solicitacoes
CREATE TABLE public.solicitacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fornecedor_id uuid NOT NULL REFERENCES public.fornecedores(id),
  tipo_caminhao text NOT NULL,
  quantidade_veiculos integer NOT NULL DEFAULT 1,
  volume_previsto integer NOT NULL,
  observacoes text,
  status text NOT NULL DEFAULT 'pendente',
  data_solicitacao date NOT NULL DEFAULT current_date,
  data_agendada date,
  horario_agendado text,
  email_contato text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Criar tabela cargas (sem FK para senhas ainda)
CREATE TABLE public.cargas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL,
  fornecedor_id uuid NOT NULL REFERENCES public.fornecedores(id),
  nfs text[] NOT NULL DEFAULT '{}',
  volume_previsto integer NOT NULL,
  volume_conferido integer,
  status text NOT NULL DEFAULT 'aguardando_chegada',
  doca_id uuid,
  conferente_id uuid REFERENCES public.conferentes(id),
  rua text,
  divergencia text,
  chegou boolean DEFAULT false,
  senha_id uuid,
  horario_previsto text,
  tipo_caminhao text,
  quantidade_veiculos integer,
  solicitacao_id uuid REFERENCES public.solicitacoes(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Criar tabela senhas
CREATE TABLE public.senhas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero serial NOT NULL,
  fornecedor_id uuid NOT NULL REFERENCES public.fornecedores(id),
  carga_id uuid REFERENCES public.cargas(id),
  doca_numero integer,
  status text NOT NULL DEFAULT 'aguardando_doca',
  hora_chegada text NOT NULL,
  nome_motorista text NOT NULL,
  tipo_caminhao text NOT NULL,
  horario_previsto text,
  local_atual text NOT NULL DEFAULT 'aguardando_doca',
  rua text,
  liberada boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Criar tabela docas
CREATE TABLE public.docas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero integer NOT NULL,
  status text NOT NULL DEFAULT 'livre',
  carga_id uuid REFERENCES public.cargas(id),
  conferente_id uuid REFERENCES public.conferentes(id),
  volume_conferido integer,
  rua text,
  senha_id uuid REFERENCES public.senhas(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Criar tabela cross_docking
CREATE TABLE public.cross_docking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carga_id uuid NOT NULL REFERENCES public.cargas(id),
  fornecedor_id uuid NOT NULL REFERENCES public.fornecedores(id),
  nfs text[] NOT NULL DEFAULT '{}',
  data date NOT NULL,
  rua text NOT NULL,
  volume_recebido integer NOT NULL,
  status text NOT NULL DEFAULT 'aguardando_decisao',
  numero_cross text,
  separador_id uuid REFERENCES public.conferentes(id),
  tem_divergencia boolean,
  observacao text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Resolver referências circulares
ALTER TABLE public.cargas ADD CONSTRAINT cargas_doca_id_fkey FOREIGN KEY (doca_id) REFERENCES public.docas(id);
ALTER TABLE public.cargas ADD CONSTRAINT cargas_senha_id_fkey FOREIGN KEY (senha_id) REFERENCES public.senhas(id);

-- 9. Habilitar RLS em todas as tabelas
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conferentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cargas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.senhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.docas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_docking ENABLE ROW LEVEL SECURITY;

-- 10. Criar politicas de acesso publico (anon) em todas as tabelas
-- Fornecedores
CREATE POLICY "anon_select_fornecedores" ON public.fornecedores FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_fornecedores" ON public.fornecedores FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_fornecedores" ON public.fornecedores FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_delete_fornecedores" ON public.fornecedores FOR DELETE TO anon USING (true);

-- Conferentes
CREATE POLICY "anon_select_conferentes" ON public.conferentes FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_conferentes" ON public.conferentes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_conferentes" ON public.conferentes FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_delete_conferentes" ON public.conferentes FOR DELETE TO anon USING (true);

-- Solicitacoes
CREATE POLICY "anon_select_solicitacoes" ON public.solicitacoes FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_solicitacoes" ON public.solicitacoes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_solicitacoes" ON public.solicitacoes FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_delete_solicitacoes" ON public.solicitacoes FOR DELETE TO anon USING (true);

-- Cargas
CREATE POLICY "anon_select_cargas" ON public.cargas FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_cargas" ON public.cargas FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_cargas" ON public.cargas FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_delete_cargas" ON public.cargas FOR DELETE TO anon USING (true);

-- Senhas
CREATE POLICY "anon_select_senhas" ON public.senhas FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_senhas" ON public.senhas FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_senhas" ON public.senhas FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_delete_senhas" ON public.senhas FOR DELETE TO anon USING (true);

-- Docas
CREATE POLICY "anon_select_docas" ON public.docas FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_docas" ON public.docas FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_docas" ON public.docas FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_delete_docas" ON public.docas FOR DELETE TO anon USING (true);

-- Cross Docking
CREATE POLICY "anon_select_cross_docking" ON public.cross_docking FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_cross_docking" ON public.cross_docking FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_cross_docking" ON public.cross_docking FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_delete_cross_docking" ON public.cross_docking FOR DELETE TO anon USING (true);
