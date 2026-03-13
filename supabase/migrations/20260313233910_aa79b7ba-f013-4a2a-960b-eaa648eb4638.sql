
CREATE TABLE public.divergencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carga_id uuid NOT NULL REFERENCES public.cargas(id) ON DELETE CASCADE,
  senha_id uuid REFERENCES public.senhas(id) ON DELETE SET NULL,
  cross_id uuid REFERENCES public.cross_docking(id) ON DELETE SET NULL,
  origem text NOT NULL CHECK (origem IN ('recebimento', 'cross')),
  produto_codigo text NOT NULL,
  produto_descricao text NOT NULL,
  quantidade numeric NOT NULL,
  tipo_divergencia text NOT NULL CHECK (tipo_divergencia IN ('falta','sobra','recusa','produto_errado','descricao_divergente','avaria')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.divergencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_divergencias" ON public.divergencias FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_divergencias" ON public.divergencias FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_divergencias" ON public.divergencias FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_delete_divergencias" ON public.divergencias FOR DELETE TO anon USING (true);
