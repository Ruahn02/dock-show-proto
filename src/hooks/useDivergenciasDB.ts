import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { withRetry } from '@/lib/supabaseRetry';
import type { DivergenciaItem } from '@/types';
import { cachedFetch, subscribeRealtime, invalidateCache } from '@/lib/supabaseCache';

const CACHE_KEY = 'divergencias';

export interface DivergenciaRow {
  id: string;
  carga_id: string;
  senha_id: string | null;
  cross_id: string | null;
  origem: string;
  produto_codigo: string;
  produto_descricao: string;
  quantidade: number;
  tipo_divergencia: string;
  created_at: string;
}

const TIPO_LABELS: Record<string, string> = {
  falta: 'falta',
  sobra: 'sobra',
  recusa: 'recusa',
  produto_errado: 'produto errado',
  descricao_divergente: 'descrição divergente',
  avaria: 'avaria',
};

function formatDivergencias(rows: DivergenciaRow[]): string {
  if (rows.length === 0) return '-';
  return rows
    .map(r => `${r.produto_codigo} - ${r.produto_descricao} - ${r.quantidade} - ${TIPO_LABELS[r.tipo_divergencia] || r.tipo_divergencia}`)
    .join('\n');
}

export function useDivergenciasDB() {
  const [divergencias, setDivergencias] = useState<DivergenciaRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchDivergencias = useCallback(async () => {
    const { data, error: err } = await cachedFetch(CACHE_KEY, async () =>
      await supabase.from('divergencias').select('*').order('created_at', { ascending: true })
    );
    if (!mountedRef.current) return;
    if (err) {
      console.error('[useDivergenciasDB] fetch error:', err);
      setError('Falha ao carregar divergências');
    } else {
      setDivergencias(data as unknown as DivergenciaRow[]);
      setError(null);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchDivergencias();
    const unsub = subscribeRealtime(CACHE_KEY, 'divergencias', fetchDivergencias);

    return () => {
      mountedRef.current = false;
      unsub();
    };
  }, [fetchDivergencias]);

  const salvarDivergencias = useCallback(async (
    items: DivergenciaItem[],
    opts: { carga_id: string; senha_id?: string; cross_id?: string; origem: 'recebimento' | 'cross' }
  ) => {
    if (items.length === 0) return;
    const rows = items.map(item => ({
      carga_id: opts.carga_id,
      senha_id: opts.senha_id || null,
      cross_id: opts.cross_id || null,
      origem: opts.origem,
      produto_codigo: item.produto_codigo,
      produto_descricao: item.produto_descricao,
      quantidade: item.quantidade,
      tipo_divergencia: item.tipo_divergencia,
    }));
    const { error } = await withRetry(() => supabase.from('divergencias').insert(rows));
    if (error) {
      console.error('Erro ao salvar divergências:', error);
      throw error;
    }
    invalidateCache(CACHE_KEY);
    await fetchDivergencias();
  }, [fetchDivergencias]);

  const getDivergenciasRecebimento = useCallback((cargaId: string) => {
    return formatDivergencias(divergencias.filter(d => d.carga_id === cargaId && d.origem === 'recebimento'));
  }, [divergencias]);

  const getDivergenciasCross = useCallback((crossId: string) => {
    return formatDivergencias(divergencias.filter(d => d.cross_id === crossId && d.origem === 'cross'));
  }, [divergencias]);

  const getDivergenciasCrossByCarga = useCallback((cargaId: string) => {
    return formatDivergencias(divergencias.filter(d => d.carga_id === cargaId && d.origem === 'cross'));
  }, [divergencias]);

  return { divergencias, error, salvarDivergencias, getDivergenciasRecebimento, getDivergenciasCross, getDivergenciasCrossByCarga, refetch: fetchDivergencias };
}
