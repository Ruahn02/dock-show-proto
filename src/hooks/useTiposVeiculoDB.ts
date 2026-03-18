import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TipoVeiculo {
  id: string;
  nome: string;
  ativo: boolean;
  ordem: number;
}

export function useTiposVeiculoDB() {
  const [tipos, setTipos] = useState<TipoVeiculo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTipos = useCallback(async () => {
    const { data, error } = await supabase
      .from('tipos_veiculo')
      .select('*')
      .eq('ativo', true)
      .order('ordem', { ascending: true });
    if (!error && data) {
      setTipos(data as TipoVeiculo[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTipos();
  }, [fetchTipos]);

  const getLabelByNome = useCallback((nome: string): string => {
    const tipo = tipos.find(t => t.nome === nome);
    if (tipo) return tipo.nome.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    // Fallback for old values like bi_truck
    return nome.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }, [tipos]);

  return { tipos, loading, getLabelByNome, refetch: fetchTipos };
}
