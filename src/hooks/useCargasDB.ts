import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchAllRows } from '@/lib/supabasePagination';
import { withRetry } from '@/lib/supabaseRetry';
import { Carga, StatusCarga, TipoCaminhao } from '@/types';
import { subscribeRealtime } from '@/lib/supabaseCache';

export function mapCargaFromDB(row: any): Carga {
  return {
    id: row.id,
    data: row.data,
    fornecedorId: row.fornecedor_id,
    nfs: row.nfs ?? [],
    volumePrevisto: row.volume_previsto,
    volumeConferido: row.volume_conferido ?? undefined,
    status: row.status as StatusCarga,
    docaId: row.doca_id ?? undefined,
    conferenteId: row.conferente_id ?? undefined,
    rua: row.rua ?? undefined,
    divergencia: row.divergencia ?? undefined,
    chegou: row.chegou ?? undefined,
    horarioPrevisto: row.horario_previsto ?? undefined,
    tipoCaminhao: row.tipo_caminhao as TipoCaminhao ?? undefined,
    quantidadeVeiculos: row.quantidade_veiculos ?? undefined,
    solicitacaoId: row.solicitacao_id ?? undefined,
  };
}

function mapCargaToDB(data: Partial<Carga>): any {
  const result: any = {};
  if (data.data !== undefined) result.data = data.data;
  if (data.fornecedorId !== undefined) result.fornecedor_id = data.fornecedorId;
  if (data.nfs !== undefined) result.nfs = data.nfs;
  if (data.volumePrevisto !== undefined) result.volume_previsto = data.volumePrevisto;
  if ('volumeConferido' in data) result.volume_conferido = data.volumeConferido ?? null;
  if (data.status !== undefined) result.status = data.status;
  if ('docaId' in data) result.doca_id = data.docaId ?? null;
  if ('conferenteId' in data) result.conferente_id = data.conferenteId ?? null;
  if ('rua' in data) result.rua = data.rua ?? null;
  if ('divergencia' in data) result.divergencia = data.divergencia ?? null;
  if ('chegou' in data) result.chegou = data.chegou ?? null;
  if ('horarioPrevisto' in data) result.horario_previsto = data.horarioPrevisto ?? null;
  if ('tipoCaminhao' in data) result.tipo_caminhao = data.tipoCaminhao ?? null;
  if ('quantidadeVeiculos' in data) result.quantidade_veiculos = data.quantidadeVeiculos ?? null;
  if ('solicitacaoId' in data) result.solicitacao_id = data.solicitacaoId ?? null;
  return result;
}

export function useCargasDB() {
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchCargas = useCallback(async () => {
    const { data, error: err } = await fetchAllRows('cargas', '*', [
      { column: 'data' },
      { column: 'horario_previsto' },
    ]);
    if (!mountedRef.current) return;
    if (err) {
      console.error('[useCargasDB] fetch error:', err);
      setError('Falha ao carregar cargas');
    } else if (data) {
      setCargas(data.map(mapCargaFromDB));
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchCargas();
    const unsub = subscribeRealtime('cargas', 'cargas', fetchCargas);

    return () => {
      mountedRef.current = false;
      unsub();
    };
  }, [fetchCargas]);

  const criarCarga = useCallback(async (dados: {
    data: string;
    fornecedorId: string;
    nfs: string[];
    volumePrevisto: number;
    horarioPrevisto?: string;
    tipoCaminhao?: TipoCaminhao;
    quantidadeVeiculos?: number;
    solicitacaoId?: string;
  }) => {
    const { data: existente } = await withRetry(() =>
      supabase.from('cargas').select('*')
        .eq('fornecedor_id', dados.fornecedorId)
        .eq('data', dados.data)
        .eq('status', 'aguardando_chegada')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()
    );

    if (existente) {
      const nfsAtualizadas = [...(existente.nfs || []), ...dados.nfs];
      const { data: atualizada, error } = await withRetry(() =>
        supabase.from('cargas').update({
          volume_previsto: existente.volume_previsto + dados.volumePrevisto,
          quantidade_veiculos: (existente.quantidade_veiculos || 1) + (dados.quantidadeVeiculos || 1),
          nfs: nfsAtualizadas,
        }).eq('id', existente.id).select().single()
      );
      if (!error && atualizada) {
        const unificada = mapCargaFromDB(atualizada);
        setCargas(prev => prev.map(c => c.id === existente.id ? unificada : c));
        return unificada;
      }
      throw error;
    }

    const { data, error } = await withRetry(() =>
      supabase.from('cargas').insert({
        data: dados.data,
        fornecedor_id: dados.fornecedorId,
        nfs: dados.nfs,
        volume_previsto: dados.volumePrevisto,
        horario_previsto: dados.horarioPrevisto ?? null,
        tipo_caminhao: dados.tipoCaminhao ?? null,
        quantidade_veiculos: dados.quantidadeVeiculos ?? null,
        solicitacao_id: dados.solicitacaoId ?? null,
        status: 'aguardando_chegada',
        chegou: false,
      }).select().single()
    );
    if (!error && data) {
      const nova = mapCargaFromDB(data);
      setCargas(prev => [...prev, nova]);
      return nova;
    }
    throw error;
  }, []);

  const atualizarCarga = useCallback(async (id: string, dados: Partial<Carga>) => {
    const { data, error } = await withRetry(() =>
      supabase.from('cargas').update(mapCargaToDB(dados)).eq('id', id).select().single()
    );
    if (!error && data) {
      const atualizada = mapCargaFromDB(data);
      setCargas(prev => prev.map(c => c.id === id ? atualizada : c));
      return atualizada;
    }
    throw error;
  }, []);

  const excluirCarga = useCallback(async (id: string) => {
    await withRetry(() => supabase.from('senhas').delete().eq('carga_id', id));
    await withRetry(() => supabase.from('docas').update({ status: 'livre', carga_id: null, senha_id: null, conferente_id: null, volume_conferido: null, rua: null }).eq('carga_id', id));
    await withRetry(() => supabase.from('divergencias').delete().eq('carga_id', id));
    await withRetry(() => supabase.from('cross_docking').delete().eq('carga_id', id));
    const { error } = await withRetry(() => supabase.from('cargas').delete().eq('id', id));
    if (error) throw error;
    setCargas(prev => prev.filter(c => c.id !== id));
  }, []);

  return { cargas, setCargas, loading, error, criarCarga, atualizarCarga, excluirCarga, refetch: fetchCargas };
}
