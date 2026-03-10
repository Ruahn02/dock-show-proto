
CREATE OR REPLACE FUNCTION public.rpc_atualizar_fluxo_carga(p_carga_id uuid DEFAULT NULL::uuid, p_senha_id uuid DEFAULT NULL::uuid, p_novo_status text DEFAULT NULL::text, p_conferente_id uuid DEFAULT NULL::uuid, p_rua text DEFAULT NULL::text, p_volume_conferido integer DEFAULT NULL::integer, p_divergencia text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_senha_id UUID;
  v_carga_id UUID;
  v_total_senhas integer;
  v_conferidas integer;
  v_em_conferencia integer;
  v_total_volume integer;
  v_volume_previsto integer;
  v_status_carga text;
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
      -- BUG 8 fix: only update to em_conferencia, never regress from conferido
      SELECT status INTO v_status_carga FROM cargas WHERE id = v_carga_id;
      IF v_status_carga NOT IN ('em_conferencia', 'conferido') THEN
        UPDATE cargas SET status='em_conferencia',
          conferente_id=COALESCE(p_conferente_id, conferente_id),
          rua=COALESCE(p_rua, rua)
        WHERE id=v_carga_id;
      END IF;
    END IF;
    IF v_senha_id IS NOT NULL THEN
      UPDATE senhas SET status='em_conferencia' WHERE id=v_senha_id;
    END IF;
    -- Only update the specific dock for this senha, not all docks of the carga
    IF v_senha_id IS NOT NULL THEN
      UPDATE docas SET status='em_conferencia',
        conferente_id=COALESCE(p_conferente_id, conferente_id),
        rua=COALESCE(p_rua, rua)
      WHERE senha_id=v_senha_id;
    END IF;
    RETURN;
  END IF;

  IF p_novo_status='conferido' THEN
    IF v_senha_id IS NOT NULL THEN
      UPDATE senhas SET status='conferido', volume_conferido=p_volume_conferido WHERE id=v_senha_id;
    END IF;

    -- BUG 9 fix: only release the dock for THIS specific senha, not all docks of the carga
    IF v_senha_id IS NOT NULL THEN
      UPDATE docas SET status='livre', carga_id=NULL, senha_id=NULL, conferente_id=NULL, volume_conferido=NULL, rua=NULL
        WHERE senha_id=v_senha_id;
    END IF;

    IF v_carga_id IS NOT NULL THEN
      SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'conferido'),
        COUNT(*) FILTER (WHERE status = 'em_conferencia'),
        COALESCE(SUM(volume_conferido), 0)
      INTO v_total_senhas, v_conferidas, v_em_conferencia, v_total_volume
      FROM senhas WHERE carga_id = v_carga_id AND status != 'recusado';

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
      -- Only update if not already in a more advanced state
      SELECT status INTO v_status_carga FROM cargas WHERE id = v_carga_id;
      IF v_status_carga IN ('aguardando_chegada', 'aguardando_conferencia') THEN
        UPDATE cargas SET status='aguardando_conferencia' WHERE id=v_carga_id;
      END IF;
    END IF;
    RETURN;
  END IF;
END;
$function$;
