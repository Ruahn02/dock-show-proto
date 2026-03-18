CREATE TABLE tipos_veiculo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  ativo boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tipos_veiculo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_tipos_veiculo" ON tipos_veiculo FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_tipos_veiculo" ON tipos_veiculo FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_tipos_veiculo" ON tipos_veiculo FOR UPDATE TO anon USING (true);
CREATE POLICY "anon_delete_tipos_veiculo" ON tipos_veiculo FOR DELETE TO anon USING (true);

INSERT INTO tipos_veiculo (nome, ordem) VALUES
  ('fiorino', 1),
  ('van', 2),
  ('toco', 3),
  ('truck', 4),
  ('carreta', 5),
  ('bi_carreta', 6);