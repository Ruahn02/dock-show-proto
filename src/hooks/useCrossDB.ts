import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchAllRows } from '@/lib/supabasePagination';
import { withRetry } from '@/lib/supabaseRetry';
import { CrossDocking, StatusCross } from '@/types';

function mapFromDB(row: any): CrossDocking {
  return {
    id: row.id,
    cargaId: row.carga_id,
    fornecedorId: row.fornecedor_id,
    nfs: row.nfs || [],
    data: row.data,
    rua: row.rua,
    volumeRecebido: row.volume_recebido,
    status: row.status as StatusCross,
    numeroCross: row.numero_cross ?? undefined,
    separadorId: row.separador_id ?? undefined,
    temDivergencia: row.tem_divergencia ?? undefined,
    observacao: row.observacao ?? undefined,
  };
}

function mapToDB(data: Partial<CrossDocking>): any {
  const result: any = {};
  if (data.cargaId !== undefined) result.carga_id = data.cargaId;
  if (data.fornecedorId !== undefined) result.fornecedor_id = data.fornecedorId;
  if (data.nfs !== undefined) result.nfs = data.nfs;
  if (data.data !== undefined) result.data = data.data;
  if (data.rua !== undefined) result.rua = data.rua;
  if (data.volumeRecebido !== undefined) result.volume_recebido = data.volumeRecebido;
  if (data.status !== undefined) result.status = data.status;
  if ('numeroCross' in data) result.numero_cross = data.numeroCross ?? null;
  if ('separadorId' in data) result.separador_id = data.separadorId ?? null;
  if ('temDivergencia' in data) result.tem_divergencia = data.temDivergencia ?? null;
  if ('observacao' in data) result.observacao = data.observacao ?? null;
  return result;
}

export function useCrossDB(initialDelay = 0) {
  const [crossItems, setCrossItems] = useState<CrossDocking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchCross = useCallback(async () => {
    const { data, error: err } = await fetchAllRows('cross_docking', '*', [{ column: 'created_at', ascending: false }]);
    if (!mountedRef.current) return;
    if (err) {
      console.error('[useCrossDB] fetch error:', err);
      setError('Falha ao carregar cross docking');
    } else if (data) {
      setCrossItems(data.map(mapFromDB));
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const timer = setTimeout(() => fetchCross(), initialDelay);

    const channel = supabase
      .channel('cross-docking-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cross_docking' }, () => {
        fetchCross();
      })
      .subscribe();

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [fetchCross]);

  const criarCross = useCallback(async (dados: {
    cargaId: string;
    fornecedorId: string;
    nfs: string[];
    data: string;
    rua: string;
    volumeRecebido: number;
  }) => {
    const { data, error } = await withRetry(() =>
      supabase.from('cross_docking').insert({
        carga_id: dados.cargaId,
        fornecedor_id: dados.fornecedorId,
        nfs: dados.nfs,
        data: dados.data,
        rua: dados.rua,
        volume_recebido: dados.volumeRecebido,
        status: 'aguardando_decisao',
      }).select().single()
    );
    if (!error && data) {
      const novo = mapFromDB(data);
      setCrossItems(prev => [novo, ...prev]);
      return novo;
    }
    throw error;
  }, []);

  const atualizarCross = useCallback(async (id: string, dados: Partial<CrossDocking>) => {
    const { data, error } = await withRetry(() =>
      supabase.from('cross_docking').update(mapToDB(dados)).eq('id', id).select().single()
    );
    if (!error && data) {
      const atualizado = mapFromDB(data);
      setCrossItems(prev => prev.map(c => c.id === id ? atualizado : c));
      return atualizado;
    }
    throw error;
  }, []);

  const deletarCross = useCallback(async (id: string) => {
    const { error } = await withRetry(() =>
      supabase.from('cross_docking').delete().eq('id', id)
    );
    if (!error) {
      setCrossItems(prev => prev.filter(c => c.id !== id));
    }
    if (error) throw error;
  }, []);

  return { crossItems, loading, error, criarCross, atualizarCross, deletarCross, refetch: fetchCross };
}
