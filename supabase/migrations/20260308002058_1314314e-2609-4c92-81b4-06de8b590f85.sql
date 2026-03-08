
CREATE OR REPLACE FUNCTION public.rpc_atualizar_fluxo_carga(
  p_carga_id uuid DEFAULT NULL,
  p_senha_id uuid DEFAULT NULL,
  p_novo_status text DEFAULT NULL,
  p_conferente_id uuid DEFAULT NULL,
  p_rua text DEFAULT NULL,
  p_volume_conferido integer DEFAULT NULL,
  p_divergencia text DEFAULT NULL
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
  v_volume_previsto integer;
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
        ELSE
          -- Use volume-based rule instead of senha count
          SELECT volume_previsto INTO v_volume_previsto FROM cargas WHERE id = v_carga_id;

          IF v_total_volume >= v_volume_previsto THEN
            UPDATE cargas SET status='conferido', volume_conferido=v_total_volume WHERE id=v_carga_id;
          ELSIF v_conferidas > 0 THEN
            UPDATE cargas SET status='em_conferencia', volume_conferido=v_total_volume WHERE id=v_carga_id;
          END IF;
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

      -- Use volume-based rule instead of senha count
      SELECT volume_previsto INTO v_volume_previsto FROM cargas WHERE id = v_carga_id;

      IF v_total_senhas > 0 AND v_total_volume >= v_volume_previsto THEN
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
