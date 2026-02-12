
-- =========================================================
-- 1. VIEW CENTRAL: vw_carga_operacional
-- =========================================================

CREATE OR REPLACE VIEW public.vw_carga_operacional AS

-- Parte 1: Cargas (com ou sem senha/doca)
SELECT
  c.id              AS carga_id,
  c.fornecedor_id   AS fornecedor_id,
  f.nome            AS fornecedor_nome,
  f.email           AS fornecedor_email,
  c.tipo_caminhao   AS tipo_veiculo,
  c.quantidade_veiculos,
  c.nfs             AS nota_fiscal,
  c.volume_previsto,
  d.volume_conferido AS volume_conferido,
  c.status          AS status_carga,
  c.data            AS data_agendada,
  c.horario_previsto,
  c.chegou,
  c.conferente_id,
  c.rua             AS rua_carga,
  c.divergencia,
  c.solicitacao_id,
  s.id              AS senha_id,
  s.numero          AS senha_numero,
  s.status          AS status_senha,
  s.local_atual,
  s.doca_numero     AS senha_doca_numero,
  s.nome_motorista,
  s.hora_chegada,
  s.tipo_caminhao   AS senha_tipo_veiculo,
  s.liberada        AS senha_liberada,
  s.rua             AS rua_senha,
  d.id              AS doca_id,
  d.numero          AS doca_numero,
  d.status          AS status_doca,
  d.conferente_id   AS doca_conferente_id,
  d.volume_conferido AS doca_volume_conferido,
  d.rua             AS doca_rua
FROM cargas c
LEFT JOIN fornecedores f ON f.id = c.fornecedor_id
LEFT JOIN senhas s ON s.id = c.senha_id
LEFT JOIN docas d ON d.carga_id = c.id

UNION ALL

-- Parte 2: Senhas órfãs (vinculadas a doca mas sem carga)
SELECT
  NULL              AS carga_id,
  s.fornecedor_id,
  f.nome            AS fornecedor_nome,
  f.email           AS fornecedor_email,
  s.tipo_caminhao   AS tipo_veiculo,
  NULL::integer     AS quantidade_veiculos,
  '{}'::text[]      AS nota_fiscal,
  NULL::integer     AS volume_previsto,
  NULL::integer     AS volume_conferido,
  NULL::text        AS status_carga,
  NULL::date        AS data_agendada,
  NULL::text        AS horario_previsto,
  NULL::boolean     AS chegou,
  NULL::uuid        AS conferente_id,
  NULL::text        AS rua_carga,
  NULL::text        AS divergencia,
  NULL::uuid        AS solicitacao_id,
  s.id              AS senha_id,
  s.numero          AS senha_numero,
  s.status          AS status_senha,
  s.local_atual,
  s.doca_numero     AS senha_doca_numero,
  s.nome_motorista,
  s.hora_chegada,
  s.tipo_caminhao   AS senha_tipo_veiculo,
  s.liberada        AS senha_liberada,
  s.rua             AS rua_senha,
  d.id              AS doca_id,
  d.numero          AS doca_numero,
  d.status          AS status_doca,
  d.conferente_id   AS doca_conferente_id,
  d.volume_conferido AS doca_volume_conferido,
  d.rua             AS doca_rua
FROM senhas s
LEFT JOIN fornecedores f ON f.id = s.fornecedor_id
LEFT JOIN docas d ON d.senha_id = s.id
WHERE NOT EXISTS (
  SELECT 1 FROM cargas c WHERE c.senha_id = s.id
);

-- =========================================================
-- 2. RPC: rpc_atualizar_fluxo_carga
-- =========================================================

CREATE OR REPLACE FUNCTION public.rpc_atualizar_fluxo_carga(
  p_carga_id UUID DEFAULT NULL,
  p_senha_id UUID DEFAULT NULL,
  p_novo_status TEXT DEFAULT NULL,
  p_conferente_id UUID DEFAULT NULL,
  p_rua TEXT DEFAULT NULL,
  p_volume_conferido INTEGER DEFAULT NULL,
  p_divergencia TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_senha_id UUID;
  v_carga_id UUID;
BEGIN
  v_senha_id := p_senha_id;
  v_carga_id := p_carga_id;

  IF v_senha_id IS NULL AND v_carga_id IS NOT NULL THEN
    SELECT senha_id INTO v_senha_id FROM cargas WHERE id = v_carga_id;
  END IF;

  IF v_carga_id IS NULL AND v_senha_id IS NOT NULL THEN
    SELECT id INTO v_carga_id FROM cargas WHERE senha_id = v_senha_id LIMIT 1;
  END IF;

  -- === RECUSADO ===
  IF p_novo_status = 'recusado' THEN
    IF v_carga_id IS NOT NULL THEN
      UPDATE cargas SET status = 'recusado' WHERE id = v_carga_id;
    END IF;
    IF v_senha_id IS NOT NULL THEN
      UPDATE senhas
        SET status = 'recusado', local_atual = 'aguardando_doca', doca_numero = NULL
        WHERE id = v_senha_id;
    END IF;
    UPDATE docas
      SET status = 'livre',
          carga_id = NULL, senha_id = NULL,
          conferente_id = NULL, volume_conferido = NULL, rua = NULL
      WHERE (v_senha_id IS NOT NULL AND senha_id = v_senha_id)
         OR (v_carga_id IS NOT NULL AND carga_id = v_carga_id);
    RETURN;
  END IF;

  -- === NO SHOW ===
  IF p_novo_status = 'no_show' THEN
    IF v_carga_id IS NOT NULL THEN
      UPDATE cargas SET status = 'no_show' WHERE id = v_carga_id;
    END IF;
    RETURN;
  END IF;

  -- === EM CONFERENCIA ===
  IF p_novo_status = 'em_conferencia' THEN
    IF v_carga_id IS NOT NULL THEN
      UPDATE cargas
        SET status = 'em_conferencia',
            conferente_id = COALESCE(p_conferente_id, conferente_id),
            rua = COALESCE(p_rua, rua)
        WHERE id = v_carga_id;
    END IF;
    IF v_senha_id IS NOT NULL THEN
      UPDATE senhas SET status = 'em_conferencia' WHERE id = v_senha_id;
    END IF;
    UPDATE docas
      SET status = 'em_conferencia',
          conferente_id = COALESCE(p_conferente_id, conferente_id),
          rua = COALESCE(p_rua, rua)
      WHERE (v_senha_id IS NOT NULL AND senha_id = v_senha_id)
         OR (v_carga_id IS NOT NULL AND carga_id = v_carga_id);
    RETURN;
  END IF;

  -- === CONFERIDO ===
  IF p_novo_status = 'conferido' THEN
    IF p_volume_conferido IS NOT NULL AND v_senha_id IS NOT NULL THEN
      UPDATE docas
      SET volume_conferido = p_volume_conferido
      WHERE senha_id = v_senha_id;
    END IF;

    IF v_carga_id IS NOT NULL THEN
      UPDATE cargas
      SET status = 'conferido',
          volume_conferido = COALESCE(
            (SELECT SUM(volume_conferido) FROM docas WHERE carga_id = v_carga_id), 0
          ),
          conferente_id = COALESCE(p_conferente_id, conferente_id),
          rua = COALESCE(p_rua, rua),
          divergencia = COALESCE(p_divergencia, divergencia)
      WHERE id = v_carga_id;
    END IF;

    IF v_senha_id IS NOT NULL THEN
      UPDATE senhas SET status = 'conferido' WHERE id = v_senha_id;
    END IF;

    UPDATE docas
      SET status = 'livre',
          carga_id = NULL, senha_id = NULL,
          conferente_id = NULL, volume_conferido = NULL, rua = NULL
      WHERE (v_senha_id IS NOT NULL AND senha_id = v_senha_id)
         OR (v_carga_id IS NOT NULL AND carga_id = v_carga_id);
    RETURN;
  END IF;

  -- === AGUARDANDO CONFERENCIA ===
  IF p_novo_status = 'aguardando_conferencia' THEN
    IF v_carga_id IS NOT NULL THEN
      UPDATE cargas SET status = 'aguardando_conferencia' WHERE id = v_carga_id;
    END IF;
    RETURN;
  END IF;

END;
$$;
