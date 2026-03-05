
-- 1. Add volume_conferido to senhas
ALTER TABLE senhas ADD COLUMN IF NOT EXISTS volume_conferido integer;

-- 2. Migrate existing data
UPDATE senhas s SET carga_id = c.id
FROM cargas c WHERE c.senha_id = s.id AND s.carga_id IS NULL;

-- 3. Drop view first (depends on senha_id)
DROP VIEW IF EXISTS vw_carga_operacional;

-- 4. Drop FK and column from cargas
ALTER TABLE cargas DROP CONSTRAINT IF EXISTS cargas_senha_id_fkey;
ALTER TABLE cargas DROP COLUMN IF EXISTS senha_id;

-- 5. Rewrite RPC
CREATE OR REPLACE FUNCTION public.rpc_atualizar_fluxo_carga(
  p_carga_id uuid DEFAULT NULL::uuid,
  p_senha_id uuid DEFAULT NULL::uuid,
  p_novo_status text DEFAULT NULL::text,
  p_conferente_id uuid DEFAULT NULL::uuid,
  p_rua text DEFAULT NULL::text,
  p_volume_conferido integer DEFAULT NULL::integer,
  p_divergencia text DEFAULT NULL::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_senha_id UUID;
  v_carga_id UUID;
  v_total_senhas integer;
  v_conferidas integer;
  v_em_conferencia integer;
  v_total_volume integer;
BEGIN
  v_senha_id := p_senha_id;
  v_carga_id := p_carga_id;

  IF v_carga_id IS NULL AND v_senha_id IS NOT NULL THEN
    SELECT carga_id INTO v_carga_id FROM senhas WHERE id = v_senha_id;
  END IF;

  -- Recusado
  IF p_novo_status = 'recusado' THEN
    IF v_senha_id IS NOT NULL THEN
      UPDATE senhas SET status='recusado', local_atual='aguardando_doca', doca_numero=NULL WHERE id=v_senha_id;
      UPDATE docas SET status='livre', carga_id=NULL, senha_id=NULL, conferente_id=NULL, volume_conferido=NULL, rua=NULL
        WHERE senha_id=v_senha_id;
    END IF;

    IF v_carga_id IS NOT NULL THEN
      IF v_senha_id IS NULL THEN
        UPDATE senhas SET status='recusado', local_atual='aguardando_doca', doca_numero=NULL WHERE carga_id=v_carga_id AND status != 'recusado';
        UPDATE docas SET status='livre', carga_id=NULL, senha_id=NULL, conferente_id=NULL, volume_conferido=NULL, rua=NULL
          WHERE carga_id=v_carga_id;
        UPDATE cargas SET status='recusado' WHERE id=v_carga_id;
      ELSE
        SELECT
          COUNT(*) FILTER (WHERE status != 'recusado'),
          COUNT(*) FILTER (WHERE status = 'conferido'),
          COALESCE(SUM(volume_conferido) FILTER (WHERE status != 'recusado'), 0)
        INTO v_total_senhas, v_conferidas, v_total_volume
        FROM senhas WHERE carga_id = v_carga_id;

        IF v_total_senhas = 0 THEN
          UPDATE cargas SET status='recusado' WHERE id=v_carga_id;
        ELSIF v_conferidas = v_total_senhas THEN
          UPDATE cargas SET status='conferido', volume_conferido=v_total_volume WHERE id=v_carga_id;
        ELSIF v_conferidas > 0 THEN
          UPDATE cargas SET status='em_conferencia', volume_conferido=v_total_volume WHERE id=v_carga_id;
        END IF;
      END IF;
    END IF;
    RETURN;
  END IF;

  IF p_novo_status='no_show' THEN
    IF v_carga_id IS NOT NULL THEN UPDATE cargas SET status='no_show' WHERE id=v_carga_id; END IF;
    RETURN;
  END IF;

  IF p_novo_status='em_conferencia' THEN
    IF v_carga_id IS NOT NULL THEN
      UPDATE cargas SET status='em_conferencia',
        conferente_id=COALESCE(p_conferente_id, conferente_id),
        rua=COALESCE(p_rua, rua)
      WHERE id=v_carga_id;
    END IF;
    IF v_senha_id IS NOT NULL THEN
      UPDATE senhas SET status='em_conferencia' WHERE id=v_senha_id;
    END IF;
    UPDATE docas SET status='em_conferencia',
      conferente_id=COALESCE(p_conferente_id, conferente_id),
      rua=COALESCE(p_rua, rua)
    WHERE (v_senha_id IS NOT NULL AND senha_id=v_senha_id)
       OR (v_carga_id IS NOT NULL AND carga_id=v_carga_id);
    RETURN;
  END IF;

  IF p_novo_status='conferido' THEN
    IF v_senha_id IS NOT NULL THEN
      UPDATE senhas SET status='conferido', volume_conferido=p_volume_conferido WHERE id=v_senha_id;
    END IF;

    UPDATE docas SET status='livre', carga_id=NULL, senha_id=NULL, conferente_id=NULL, volume_conferido=NULL, rua=NULL
      WHERE (v_senha_id IS NOT NULL AND senha_id=v_senha_id)
         OR (v_carga_id IS NOT NULL AND carga_id=v_carga_id);

    IF v_carga_id IS NOT NULL THEN
      SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'conferido'),
        COUNT(*) FILTER (WHERE status = 'em_conferencia'),
        COALESCE(SUM(volume_conferido), 0)
      INTO v_total_senhas, v_conferidas, v_em_conferencia, v_total_volume
      FROM senhas WHERE carga_id = v_carga_id AND status != 'recusado';

      IF v_total_senhas > 0 AND v_conferidas = v_total_senhas THEN
        UPDATE cargas SET status='conferido',
          volume_conferido=v_total_volume,
          conferente_id=COALESCE(p_conferente_id, conferente_id),
          rua=COALESCE(p_rua, rua),
          divergencia=COALESCE(p_divergencia, divergencia)
        WHERE id=v_carga_id;
      ELSE
        UPDATE cargas SET status='em_conferencia',
          volume_conferido=v_total_volume,
          conferente_id=COALESCE(p_conferente_id, conferente_id),
          rua=COALESCE(p_rua, rua)
        WHERE id=v_carga_id;
      END IF;
    END IF;
    RETURN;
  END IF;

  IF p_novo_status='aguardando_conferencia' THEN
    IF v_carga_id IS NOT NULL THEN
      UPDATE cargas SET status='aguardando_conferencia' WHERE id=v_carga_id;
    END IF;
    RETURN;
  END IF;
END;
$$;

-- 6. Create rpc_finalizar_entrega
CREATE OR REPLACE FUNCTION public.rpc_finalizar_entrega(p_carga_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM senhas
    WHERE carga_id = p_carga_id AND status != 'conferido' AND status != 'recusado'
  ) THEN
    RAISE EXCEPTION 'Existem senhas não conferidas para esta entrega';
  END IF;

  UPDATE cargas
  SET status = 'conferido',
      volume_conferido = (SELECT COALESCE(SUM(volume_conferido), 0) FROM senhas WHERE carga_id = p_carga_id AND status != 'recusado')
  WHERE id = p_carga_id;
END;
$$;

-- 7. Recreate view with new join (senhas.carga_id instead of cargas.senha_id)
CREATE OR REPLACE VIEW vw_carga_operacional AS
SELECT c.id AS carga_id,
    c.fornecedor_id,
    f.nome AS fornecedor_nome,
    f.email AS fornecedor_email,
    c.tipo_caminhao AS tipo_veiculo,
    c.quantidade_veiculos,
    c.nfs AS nota_fiscal,
    c.volume_previsto,
    c.volume_conferido,
    c.status AS status_carga,
    c.data AS data_agendada,
    c.horario_previsto,
    c.chegou,
    c.conferente_id,
    c.rua AS rua_carga,
    c.divergencia,
    c.solicitacao_id,
    s.id AS senha_id,
    s.numero AS senha_numero,
    s.status AS status_senha,
    s.local_atual,
    s.doca_numero AS senha_doca_numero,
    s.nome_motorista,
    s.hora_chegada,
    s.tipo_caminhao AS senha_tipo_veiculo,
    s.liberada AS senha_liberada,
    s.rua AS rua_senha,
    d.id AS doca_id,
    d.numero AS doca_numero,
    d.status AS status_doca,
    d.conferente_id AS doca_conferente_id,
    d.volume_conferido AS doca_volume_conferido,
    d.rua AS doca_rua
FROM cargas c
  LEFT JOIN fornecedores f ON f.id = c.fornecedor_id
  LEFT JOIN senhas s ON s.carga_id = c.id
  LEFT JOIN docas d ON d.senha_id = s.id
UNION ALL
SELECT NULL::uuid AS carga_id,
    s.fornecedor_id,
    f.nome AS fornecedor_nome,
    f.email AS fornecedor_email,
    s.tipo_caminhao AS tipo_veiculo,
    NULL::integer AS quantidade_veiculos,
    '{}'::text[] AS nota_fiscal,
    NULL::integer AS volume_previsto,
    NULL::integer AS volume_conferido,
    NULL::text AS status_carga,
    NULL::date AS data_agendada,
    NULL::text AS horario_previsto,
    NULL::boolean AS chegou,
    NULL::uuid AS conferente_id,
    NULL::text AS rua_carga,
    NULL::text AS divergencia,
    NULL::uuid AS solicitacao_id,
    s.id AS senha_id,
    s.numero AS senha_numero,
    s.status AS status_senha,
    s.local_atual,
    s.doca_numero AS senha_doca_numero,
    s.nome_motorista,
    s.hora_chegada,
    s.tipo_caminhao AS senha_tipo_veiculo,
    s.liberada AS senha_liberada,
    s.rua AS rua_senha,
    d.id AS doca_id,
    d.numero AS doca_numero,
    d.status AS status_doca,
    d.conferente_id AS doca_conferente_id,
    d.volume_conferido AS doca_volume_conferido,
    d.rua AS doca_rua
FROM senhas s
  LEFT JOIN fornecedores f ON f.id = s.fornecedor_id
  LEFT JOIN docas d ON d.senha_id = s.id
WHERE s.carga_id IS NULL;
