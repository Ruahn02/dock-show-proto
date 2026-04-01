import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchAllRows } from '@/lib/supabasePagination';
import { withRetry } from '@/lib/supabaseRetry';
import { Conferente } from '@/types';

function mapFromDB(row: any): Conferente {
  return { id: row.id, nome: row.nome, ativo: row.ativo };
}

export function useConferentesDB() {
  const [conferentes, setConferentes] = useState<Conferente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchConferentes = useCallback(async () => {
    const { data, error: err } = await fetchAllRows('conferentes', '*', [{ column: 'nome' }]);
    if (!mountedRef.current) return;
    if (err) {
      console.error('[useConferentesDB] fetch error:', err);
      setError('Falha ao carregar conferentes');
    } else if (data) {
      setConferentes(data.map(mapFromDB));
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchConferentes();

    const channel = supabase
      .channel('conferentes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conferentes' }, () => {
        fetchConferentes();
      })
      .subscribe();

    return () => {
      mountedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [fetchConferentes]);

  const criarConferente = useCallback(async (dados: Partial<Conferente>) => {
    const { data, error } = await withRetry(() =>
      supabase.from('conferentes').insert({ nome: dados.nome!, ativo: dados.ativo ?? true }).select().single()
    );
    if (!error && data) {
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
      const atualizado = mapFromDB(data);
      setConferentes(prev => prev.map(c => c.id === id ? atualizado : c));
      return atualizado;
    }
    throw error;
  }, []);

  return { conferentes, loading, error, criarConferente, atualizarConferente, refetch: fetchConferentes };
}
