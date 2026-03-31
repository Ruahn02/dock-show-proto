import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchAllRows } from '@/lib/supabasePagination';
import { withRetry } from '@/lib/supabaseRetry';

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

export function useFluxoOperacional() {
  const [dados, setDados] = useState<FluxoOperacional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchDados = useCallback(async () => {
    const { data, error: err } = await fetchAllRows('vw_carga_operacional', '*');
    if (!mountedRef.current) return;
    if (err) {
      console.error('[useFluxoOperacional] fetch error:', err);
      setError('Falha ao carregar dados operacionais');
    } else if (data) {
      setDados(data as unknown as FluxoOperacional[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const initDelay = setTimeout(fetchDados, Math.random() * 2000);
    const interval = setInterval(fetchDados, 120000);

    const channel = supabase
      .channel('fluxo-operacional')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cargas' }, () => fetchDados())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'senhas' }, () => fetchDados())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'docas' }, () => fetchDados())
      .subscribe();

    return () => {
      mountedRef.current = false;
      clearTimeout(initDelay);
      clearInterval(interval);
      supabase.removeChannel(channel);
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
