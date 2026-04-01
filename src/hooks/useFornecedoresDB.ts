import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchAllRows } from '@/lib/supabasePagination';
import { withRetry } from '@/lib/supabaseRetry';
import { Fornecedor } from '@/types';

function mapFromDB(row: any): Fornecedor {
  return {
    id: row.id,
    nome: row.nome,
    ativo: row.ativo,
    email: row.email ?? undefined,
  };
}

export function useFornecedoresDB(initialDelay = 0) {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchFornecedores = useCallback(async () => {
    const { data, error: err } = await fetchAllRows('fornecedores', '*', [{ column: 'nome' }]);
    if (!mountedRef.current) return;
    if (err) {
      console.error('[useFornecedoresDB] fetch error:', err);
      setError('Falha ao carregar fornecedores');
    } else if (data) {
      setFornecedores(data.map(mapFromDB));
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const timer = setTimeout(() => fetchFornecedores(), initialDelay);

    const channel = supabase
      .channel('fornecedores-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fornecedores' }, () => {
        fetchFornecedores();
      })
      .subscribe();

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [fetchFornecedores]);

  const criarFornecedor = useCallback(async (dados: Partial<Fornecedor>) => {
    const { data, error } = await withRetry(() =>
      supabase.from('fornecedores')
        .insert({ nome: dados.nome!, ativo: dados.ativo ?? true, email: dados.email ?? null })
        .select().single()
    );
    if (!error && data) {
      const novo = mapFromDB(data);
      setFornecedores(prev => [...prev, novo].sort((a, b) => a.nome.localeCompare(b.nome)));
      return novo;
    }
    throw error;
  }, []);

  const atualizarFornecedor = useCallback(async (id: string, dados: Partial<Fornecedor>) => {
    const updateData: any = {};
    if (dados.nome !== undefined) updateData.nome = dados.nome;
    if (dados.ativo !== undefined) updateData.ativo = dados.ativo;
    if (dados.email !== undefined) updateData.email = dados.email;

    const { data, error } = await withRetry(() =>
      supabase.from('fornecedores').update(updateData).eq('id', id).select().single()
    );
    if (!error && data) {
      const atualizado = mapFromDB(data);
      setFornecedores(prev => prev.map(f => f.id === id ? atualizado : f));
      return atualizado;
    }
    throw error;
  }, []);

  return { fornecedores, loading, error, criarFornecedor, atualizarFornecedor, refetch: fetchFornecedores };
}
