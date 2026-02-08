import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Fornecedor } from '@/types';

function mapFromDB(row: any): Fornecedor {
  return {
    id: row.id,
    nome: row.nome,
    ativo: row.ativo,
    email: row.email ?? undefined,
  };
}

export function useFornecedoresDB() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFornecedores = useCallback(async () => {
    const { data, error } = await supabase
      .from('fornecedores')
      .select('*')
      .order('nome');
    if (!error && data) {
      setFornecedores(data.map(mapFromDB));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFornecedores();
  }, [fetchFornecedores]);

  const criarFornecedor = useCallback(async (dados: Partial<Fornecedor>) => {
    const { data, error } = await supabase
      .from('fornecedores')
      .insert({ nome: dados.nome!, ativo: dados.ativo ?? true, email: dados.email ?? null })
      .select()
      .single();
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

    const { data, error } = await supabase
      .from('fornecedores')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      const atualizado = mapFromDB(data);
      setFornecedores(prev => prev.map(f => f.id === id ? atualizado : f));
      return atualizado;
    }
    throw error;
  }, []);

  return { fornecedores, loading, criarFornecedor, atualizarFornecedor, refetch: fetchFornecedores };
}
