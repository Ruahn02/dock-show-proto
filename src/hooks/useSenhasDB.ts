import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchAllRows } from '@/lib/supabasePagination';
import { Senha, StatusSenha, LocalSenha, TipoCaminhao } from '@/types';

export function mapSenhaFromDB(row: any): Senha {
  return {
    id: row.id,
    numero: row.numero,
    fornecedorId: row.fornecedor_id,
    cargaId: row.carga_id ?? undefined,
    docaNumero: row.doca_numero ?? undefined,
    status: row.status as StatusSenha,
    horaChegada: row.hora_chegada,
    nomeMotorista: row.nome_motorista,
    tipoCaminhao: row.tipo_caminhao as TipoCaminhao,
    horarioPrevisto: row.horario_previsto ?? undefined,
    localAtual: row.local_atual as LocalSenha,
    rua: row.rua ?? undefined,
    liberada: row.liberada,
    volumeConferido: row.volume_conferido ?? undefined,
  };
}

function mapSenhaToDB(data: Partial<Senha>): any {
  const result: any = {};
  if (data.fornecedorId !== undefined) result.fornecedor_id = data.fornecedorId;
  if ('cargaId' in data) result.carga_id = data.cargaId ?? null;
  if ('docaNumero' in data) result.doca_numero = data.docaNumero ?? null;
  if (data.status !== undefined) result.status = data.status;
  if (data.horaChegada !== undefined) result.hora_chegada = data.horaChegada;
  if (data.nomeMotorista !== undefined) result.nome_motorista = data.nomeMotorista;
  if (data.tipoCaminhao !== undefined) result.tipo_caminhao = data.tipoCaminhao;
  if ('horarioPrevisto' in data) result.horario_previsto = data.horarioPrevisto ?? null;
  if (data.localAtual !== undefined) result.local_atual = data.localAtual;
  if ('rua' in data) result.rua = data.rua ?? null;
  if (data.liberada !== undefined) result.liberada = data.liberada;
  if ('volumeConferido' in data) result.volume_conferido = data.volumeConferido ?? null;
  return result;
}

export function useSenhasDB() {
  const [senhas, setSenhas] = useState<Senha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSenhas = useCallback(async () => {
    const { data, error: err } = await fetchAllRows('senhas', '*', [{ column: 'numero' }]);
    if (err) {
      console.error('[useSenhasDB] fetch error:', err);
      setError('Falha ao carregar senhas');
    } else if (data) {
      setSenhas(data.map(mapSenhaFromDB));
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSenhas();
    const interval = setInterval(fetchSenhas, 30000);

    const channel = supabase
      .channel('senhas-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'senhas' }, () => {
        fetchSenhas();
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [fetchSenhas]);

  const criarSenha = useCallback(async (dados: {
    fornecedorId: string;
    nomeMotorista: string;
    tipoCaminhao: TipoCaminhao;
    horaChegada: string;
    cargaId?: string;
  }) => {
    const { data, error } = await supabase
      .from('senhas')
      .insert({
        fornecedor_id: dados.fornecedorId,
        nome_motorista: dados.nomeMotorista,
        tipo_caminhao: dados.tipoCaminhao,
        hora_chegada: dados.horaChegada,
        carga_id: dados.cargaId ?? null,
        status: 'aguardando_doca',
        local_atual: 'aguardando_doca',
        liberada: false,
      })
      .select()
      .single();
    if (!error && data) {
      const nova = mapSenhaFromDB(data);
      setSenhas(prev => [...prev, nova]);
      return nova;
    }
    throw error;
  }, []);

  const atualizarSenha = useCallback(async (id: string, dados: Partial<Senha>) => {
    const { data, error } = await supabase
      .from('senhas')
      .update(mapSenhaToDB(dados))
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      const atualizada = mapSenhaFromDB(data);
      setSenhas(prev => prev.map(s => s.id === id ? atualizada : s));
      return atualizada;
    }
    throw error;
  }, []);

  return { senhas, setSenhas, loading, error, criarSenha, atualizarSenha, refetch: fetchSenhas };
}
