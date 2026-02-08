import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

  const fetchDocas = useCallback(async () => {
    const { data, error } = await supabase
      .from('docas')
      .select('*')
      .order('numero');
    if (!error && data) {
      setDocas(data.map(mapFromDB));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDocas();

    const channel = supabase
      .channel('docas-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'docas' }, () => {
        fetchDocas();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchDocas]);

  const atualizarDoca = useCallback(async (id: string, dados: Partial<Doca>) => {
    const { data, error } = await supabase
      .from('docas')
      .update(mapToDB(dados))
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      const atualizada = mapFromDB(data);
      setDocas(prev => prev.map(d => d.id === id ? atualizada : d));
      return atualizada;
    }
    throw error;
  }, []);

  const criarDoca = useCallback(async (numero: number) => {
    const { data, error } = await supabase
      .from('docas')
      .insert({ numero, status: 'livre' })
      .select()
      .single();
    if (!error && data) {
      const nova = mapFromDB(data);
      setDocas(prev => [...prev, nova].sort((a, b) => a.numero - b.numero));
      return nova;
    }
    throw error;
  }, []);

  return { docas, loading, atualizarDoca, criarDoca, refetch: fetchDocas };
}
