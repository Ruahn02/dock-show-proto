import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cachedFetch, subscribeRealtime } from '@/lib/supabaseCache';

export interface TipoVeiculo {
  id: string;
  nome: string;
  ativo: boolean;
  ordem: number;
}

const CACHE_KEY = 'tipos_veiculo';

export function useTiposVeiculoDB() {
  const [tipos, setTipos] = useState<TipoVeiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchTipos = useCallback(async () => {
    const { data, error: err } = await cachedFetch(CACHE_KEY, async () =>
      await supabase.from('tipos_veiculo').select('*').eq('ativo', true).order('ordem', { ascending: true })
    );
    if (!mountedRef.current) return;
    if (err) {
      console.error('[useTiposVeiculoDB] fetch error:', err);
      setError('Falha ao carregar tipos de veículo');
    } else {
      setTipos(data as TipoVeiculo[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchTipos();
    const unsub = subscribeRealtime(CACHE_KEY, 'tipos_veiculo', fetchTipos);

    return () => {
      mountedRef.current = false;
      unsub();
    };
  }, [fetchTipos]);

  const getLabelByNome = useCallback((nome: string): string => {
    const tipo = tipos.find(t => t.nome === nome);
    if (tipo) return tipo.nome.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return nome.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }, [tipos]);

  return { tipos, loading, error, getLabelByNome, refetch: fetchTipos };
}
