import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { withRetry } from '@/lib/supabaseRetry';
import { Conferente } from '@/types';
import { cachedFetch, subscribeRealtime, invalidateCache } from '@/lib/supabaseCache';

const CACHE_KEY = 'conferentes';

function mapFromDB(row: any): Conferente {
  return { id: row.id, nome: row.nome, ativo: row.ativo };
}

export function useConferentesDB() {
  const [conferentes, setConferentes] = useState<Conferente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchConferentes = useCallback(async () => {
    const { data, error: err } = await cachedFetch(CACHE_KEY, async () =>
      await supabase.from('conferentes').select('*').order('nome', { ascending: true })
    );
    if (!mountedRef.current) return;
    if (err) {
      console.error('[useConferentesDB] fetch error:', err);
      setError('Falha ao carregar conferentes');
    } else {
      setConferentes(data.map(mapFromDB));
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchConferentes();
    const unsub = subscribeRealtime(CACHE_KEY, 'conferentes', fetchConferentes);

    return () => {
      mountedRef.current = false;
      unsub();
    };
  }, [fetchConferentes]);

  const criarConferente = useCallback(async (dados: Partial<Conferente>) => {
    const { data, error } = await withRetry(() =>
      supabase.from('conferentes').insert({ nome: dados.nome!, ativo: dados.ativo ?? true }).select().single()
    );
    if (!error && data) {
      invalidateCache(CACHE_KEY);
      const novo = mapFromDB(data);
      setConferentes(prev => [...prev, novo].sort((a, b) => a.nome.localeCompare(b.nome)));
      return novo;
    }
    throw error;
  }, []);

  const atualizarConferente = useCallback(async (id: string, dados: Partial<Conferente>) => {
    const updateData: any = {};
    if (dados.nome !== undefined) updateData.nome = dados.nome;
    if (dados.ativo !== undefined) updateData.ativo = dados.ativo;

    const { data, error } = await withRetry(() =>
      supabase.from('conferentes').update(updateData).eq('id', id).select().single()
    );
    if (!error && data) {
      invalidateCache(CACHE_KEY);
      const atualizado = mapFromDB(data);
      setConferentes(prev => prev.map(c => c.id === id ? atualizado : c));
      return atualizado;
    }
    throw error;
  }, []);

  return { conferentes, loading, error, criarConferente, atualizarConferente, refetch: fetchConferentes };
}
