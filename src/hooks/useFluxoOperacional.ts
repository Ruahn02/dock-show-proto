import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { withRetry } from '@/lib/supabaseRetry';
import { cachedFetch, subscribeRealtime } from '@/lib/supabaseCache';

export interface FluxoOperacional {
  carga_id: string | null;
  fornecedor_id: string;
  fornecedor_nome: string;
  fornecedor_email: string | null;
  tipo_veiculo: string | null;
  quantidade_veiculos: number | null;
  nota_fiscal: string[];
  volume_previsto: number | null;
  volume_conferido: number | null;
  status_carga: string | null;
  data_agendada: string | null;
  horario_previsto: string | null;
  chegou: boolean | null;
  conferente_id: string | null;
  rua_carga: string | null;
  divergencia: string | null;
  solicitacao_id: string | null;
  senha_id: string | null;
  senha_numero: number | null;
  status_senha: string | null;
  local_atual: string | null;
  senha_doca_numero: number | null;
  nome_motorista: string | null;
  hora_chegada: string | null;
  senha_tipo_veiculo: string | null;
  senha_liberada: boolean | null;
  rua_senha: string | null;
  doca_id: string | null;
  doca_numero: number | null;
  status_doca: string | null;
  doca_conferente_id: string | null;
  doca_volume_conferido: number | null;
  doca_rua: string | null;
}

interface AtualizarFluxoParams {
  p_carga_id?: string | null;
  p_senha_id?: string | null;
  p_novo_status: string;
  p_conferente_id?: string | null;
  p_rua?: string | null;
  p_volume_conferido?: number | null;
  p_divergencia?: string | null;
}

const CACHE_KEY = 'vw_carga_operacional';

export function useFluxoOperacional() {
  const [dados, setDados] = useState<FluxoOperacional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchDados = useCallback(async () => {
    const { data, error: err } = await cachedFetch(CACHE_KEY, async () =>
      await (supabase.from as any)('vw_carga_operacional').select('*')
    );
    if (!mountedRef.current) return;
    if (err) {
      console.error('[FETCH ERROR] vw_carga_operacional:', err);
      setError('Falha ao carregar dados operacionais');
    } else {
      setDados(data as unknown as FluxoOperacional[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchDados();

    const unsub1 = subscribeRealtime(`${CACHE_KEY}_cargas`, 'cargas', fetchDados);
    const unsub2 = subscribeRealtime(`${CACHE_KEY}_senhas`, 'senhas', fetchDados);
    const unsub3 = subscribeRealtime(`${CACHE_KEY}_docas`, 'docas', fetchDados);

    return () => {
      mountedRef.current = false;
      unsub1();
      unsub2();
      unsub3();
    };
  }, [fetchDados]);

  const atualizarFluxo = useCallback(async (params: AtualizarFluxoParams) => {
    const { error } = await withRetry(() =>
      supabase.rpc('rpc_atualizar_fluxo_carga', {
        p_carga_id: params.p_carga_id || null,
        p_senha_id: params.p_senha_id || null,
        p_novo_status: params.p_novo_status,
        p_conferente_id: params.p_conferente_id || null,
        p_rua: params.p_rua || null,
        p_volume_conferido: params.p_volume_conferido ?? null,
        p_divergencia: params.p_divergencia || null,
      })
    );

    if (error) {
      console.error('Erro ao atualizar fluxo:', error);
      throw error;
    }

    await fetchDados();
  }, [fetchDados]);

  return { dados, loading, error, atualizarFluxo, refetch: fetchDados };
}
