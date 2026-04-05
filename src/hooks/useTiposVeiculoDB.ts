import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TipoVeiculo {
  id: string;
  nome: string;
  ativo: boolean;
  ordem: number;
  quantidade_docas: number;
}

export function useTiposVeiculoDB() {
  const [tipos, setTipos] = useState<TipoVeiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchTipos = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('tipos_veiculo')
      .select('*')
      .order('ordem', { ascending: true });

    if (!mountedRef.current) return;
    if (err) {
      console.error('[FETCH ERROR] tipos_veiculo:', err);
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
    return () => { mountedRef.current = false; };
  }, [fetchTipos]);

  const criarTipo = useCallback(async (tipo: { nome: string; ordem: number; quantidade_docas: number }) => {
    const { error: err } = await supabase.from('tipos_veiculo').insert(tipo);
    if (err) throw err;
    await fetchTipos();
  }, [fetchTipos]);

  const atualizarTipo = useCallback(async (id: string, updates: Partial<Pick<TipoVeiculo, 'nome' | 'ordem' | 'ativo' | 'quantidade_docas'>>) => {
    const { error: err } = await supabase.from('tipos_veiculo').update(updates).eq('id', id);
    if (err) throw err;
    await fetchTipos();
  }, [fetchTipos]);

  const getLabelByNome = useCallback((nome: string): string => {
    const tipo = tipos.find(t => t.nome === nome);
    if (tipo) return tipo.nome.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return nome.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }, [tipos]);

  return { tipos, loading, error, getLabelByNome, refetch: fetchTipos, criarTipo, atualizarTipo };
}
