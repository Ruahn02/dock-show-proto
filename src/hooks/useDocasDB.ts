import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchAllRows } from '@/lib/supabasePagination';
import { withRetry } from '@/lib/supabaseRetry';
import { Doca, StatusDoca } from '@/types';

function mapFromDB(row: any): Doca {
  return {
    id: row.id,
    numero: row.numero,
    status: row.status as StatusDoca,
    cargaId: row.carga_id ?? undefined,
    conferenteId: row.conferente_id ?? undefined,
    volumeConferido: row.volume_conferido ?? undefined,
    rua: row.rua ?? undefined,
    senhaId: row.senha_id ?? undefined,
  };
}

function mapToDB(data: Partial<Doca>): any {
  const result: any = {};
  if (data.numero !== undefined) result.numero = data.numero;
  if (data.status !== undefined) result.status = data.status;
  if ('cargaId' in data) result.carga_id = data.cargaId ?? null;
  if ('conferenteId' in data) result.conferente_id = data.conferenteId ?? null;
  if ('volumeConferido' in data) result.volume_conferido = data.volumeConferido ?? null;
  if ('rua' in data) result.rua = data.rua ?? null;
  if ('senhaId' in data) result.senha_id = data.senhaId ?? null;
  return result;
}

export function useDocasDB() {
  const [docas, setDocas] = useState<Doca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchDocas = useCallback(async () => {
    const { data, error: err } = await fetchAllRows('docas', '*', [{ column: 'numero' }]);
    if (!mountedRef.current) return;
    if (err) {
      console.error('[useDocasDB] fetch error:', err);
      setError('Falha ao carregar docas');
    } else if (data) {
      setDocas(data.map(mapFromDB));
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchDocas();

    const channel = supabase
      .channel('docas-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'docas' }, () => {
        fetchDocas();
      })
      .subscribe();

    return () => {
      mountedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [fetchDocas]);

  const atualizarDoca = useCallback(async (id: string, dados: Partial<Doca>) => {
    const { data, error } = await withRetry(() =>
      supabase.from('docas').update(mapToDB(dados)).eq('id', id).select().single()
    );
    if (!error && data) {
      const atualizada = mapFromDB(data);
      setDocas(prev => prev.map(d => d.id === id ? atualizada : d));
      return atualizada;
    }
    throw error;
  }, []);

  const criarDoca = useCallback(async (numero: number) => {
    const { data, error } = await withRetry(() =>
      supabase.from('docas').insert({ numero, status: 'livre' }).select().single()
    );
    if (!error && data) {
      const nova = mapFromDB(data);
      setDocas(prev => [...prev, nova].sort((a, b) => a.numero - b.numero));
      return nova;
    }
    throw error;
  }, []);

  return { docas, loading, error, atualizarDoca, criarDoca, refetch: fetchDocas };
}
