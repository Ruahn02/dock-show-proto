# # =========================================================

# 1. VIEW CENTRAL: vw_carga_operacional

# =========================================================

&nbsp;

CREATE OR REPLACE VIEW public.vw_carga_operacional AS

&nbsp;

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

  COALESCE(SUM(d.volume_conferido), 0) AS volume_conferido, -- soma de todas docas

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

GROUP BY c.id, f.id, s.id, d.id;

&nbsp;

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

&nbsp;

# =========================================================

# 2. RPC: rpc_atualizar_fluxo_carga

# =========================================================

&nbsp;

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

  -- Resolver IDs cruzados

  v_senha_id := p_senha_id;

  v_carga_id := p_carga_id;

&nbsp;

  IF v_senha_id IS NULL AND v_carga_id IS NOT NULL THEN

    SELECT senha_id INTO v_senha_id FROM cargas WHERE id = v_carga_id;

  END IF;

&nbsp;

  IF v_carga_id IS NULL AND v_senha_id IS NOT NULL THEN

    SELECT id INTO v_carga_id FROM cargas WHERE senha_id = v_senha_id LIMIT 1;

  END IF;

&nbsp;

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

    -- Liberar docas

    UPDATE docas

      SET status = 'livre',

          carga_id = NULL, senha_id = NULL,

          conferente_id = NULL, volume_conferido = NULL, rua = NULL

      WHERE (v_senha_id IS NOT NULL AND senha_id = v_senha_id)

         OR (v_carga_id IS NOT NULL AND carga_id = v_carga_id);

    RETURN;

  END IF;

&nbsp;

  -- === NO SHOW ===

  IF p_novo_status = 'no_show' THEN

    IF v_carga_id IS NOT NULL THEN

      UPDATE cargas SET status = 'no_show' WHERE id = v_carga_id;

    END IF;

    RETURN;

  END IF;

&nbsp;

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

&nbsp;

  -- === CONFERIDO ===

  IF p_novo_status = 'conferido' THEN

    -- Atualizar volume da doca

    IF p_volume_conferido IS NOT NULL AND v_senha_id IS NOT NULL THEN

      UPDATE docas

      SET volume_conferido = p_volume_conferido

      WHERE senha_id = v_senha_id;

    END IF;

&nbsp;

    -- Atualizar carga com soma de todas docas

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

&nbsp;

    IF v_senha_id IS NOT NULL THEN

      UPDATE senhas SET status = 'conferido' WHERE id = v_senha_id;

    END IF;

&nbsp;

    -- Liberar doca

    UPDATE docas

      SET status = 'livre',

          carga_id = NULL, senha_id = NULL,

          conferente_id = NULL, volume_conferido = NULL, rua = NULL

      WHERE (v_senha_id IS NOT NULL AND senha_id = v_senha_id)

         OR (v_carga_id IS NOT NULL AND carga_id = v_carga_id);

    RETURN;

  END IF;

&nbsp;

  -- === AGUARDANDO CONFERENCIA ===

  IF p_novo_status = 'aguardando_conferencia' THEN

    IF v_carga_id IS NOT NULL THEN

      UPDATE cargas SET status = 'aguardando_conferencia' WHERE id = v_carga_id;

    END IF;

    RETURN;

  END IF;

&nbsp;

END;

$$;

&nbsp;

# =========================================================

# 3. Frontend / Hooks

# =========================================================

&nbsp;

1. Novo hook: `useFluxoOperacional.ts`

   - Consulta `vw_carga_operacional` via `.select('*')`

   - Escuta Realtime nas tabelas `cargas`, `senhas`, `docas` para re-fetch

   - Expondo `atualizarFluxo(params)` → chama RPC `rpc_atualizar_fluxo_carga`

&nbsp;

2. SenhaContext.tsx

   - Substituir `recusarCarga` e transições de status por chamadas RPC

   - Mantem funções não relacionadas a status inalteradas

&nbsp;

3. Docas.tsx

   - `handleModalConfirm` e `handleRecusarCarga` usam RPC

   - `volume_conferido` agora é inserido por doca, `carga.volume_conferido` soma automaticamente

&nbsp;

4. Agenda.tsx e ControleSenhas.tsx

   - Chamadas de recusa, no-show, conferência → RPC

   - Dados exibidos via view

&nbsp;

5. Telas que não mudam

   - PainelSenhas.tsx, SenhaCaminhoneiro.tsx, Dashboard.tsx, Layout, Sidebar, Header → leitura apenas

&nbsp;

# =========================================================

# 4. Regras e Características

# =========================================================

&nbsp;

- Status unificado: `'em_conferencia'` sempre

- Recusa: limpa carga, senha e doca atomico

- Volume conferido consolidado: soma todas docas vinculadas à carga

- Volume previsto opcional

- Nenhuma tabela ou coluna é criada/alterada

- Layout inalterado

- Dashboard continua mock

- Fluxos de vincular senha/carga a doca continuam iguais