import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SolicitacaoEntrega, StatusSolicitacao, TipoCaminhao } from '@/types';

function mapFromDB(row: any): SolicitacaoEntrega {
  return {
    id: row.id,
    fornecedorId: row.fornecedor_id,
    tipoCaminhao: row.tipo_caminhao as TipoCaminhao,
    quantidadeVeiculos: row.quantidade_veiculos,
    volumePrevisto: row.volume_previsto,
    observacoes: row.observacoes ?? undefined,
    status: row.status as StatusSolicitacao,
    dataSolicitacao: row.data_solicitacao,
    dataAgendada: row.data_agendada ?? undefined,
    horarioAgendado: row.horario_agendado ?? undefined,
    emailContato: row.email_contato,
  };
}

function mapToDB(data: Partial<SolicitacaoEntrega>): any {
  const result: any = {};
  if (data.fornecedorId !== undefined) result.fornecedor_id = data.fornecedorId;
  if (data.tipoCaminhao !== undefined) result.tipo_caminhao = data.tipoCaminhao;
  if (data.quantidadeVeiculos !== undefined) result.quantidade_veiculos = data.quantidadeVeiculos;
  if (data.volumePrevisto !== undefined) result.volume_previsto = data.volumePrevisto;
  if ('observacoes' in data) result.observacoes = data.observacoes ?? null;
  if (data.status !== undefined) result.status = data.status;
  if ('dataAgendada' in data) result.data_agendada = data.dataAgendada ?? null;
  if ('horarioAgendado' in data) result.horario_agendado = data.horarioAgendado ?? null;
  if (data.emailContato !== undefined) result.email_contato = data.emailContato;
  return result;
}

export function useSolicitacoesDB() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoEntrega[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSolicitacoes = useCallback(async () => {
    const { data, error } = await supabase
      .from('solicitacoes')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setSolicitacoes(data.map(mapFromDB));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSolicitacoes();
  }, [fetchSolicitacoes]);

  const criarSolicitacao = useCallback(async (dados: Omit<SolicitacaoEntrega, 'id' | 'status' | 'dataSolicitacao'>) => {
    const { data, error } = await supabase
      .from('solicitacoes')
      .insert({
        fornecedor_id: dados.fornecedorId,
        tipo_caminhao: dados.tipoCaminhao,
        quantidade_veiculos: dados.quantidadeVeiculos,
        volume_previsto: dados.volumePrevisto,
        observacoes: dados.observacoes ?? null,
        email_contato: dados.emailContato,
        status: 'pendente',
      })
      .select()
      .single();
    if (!error && data) {
      const nova = mapFromDB(data);
      setSolicitacoes(prev => [nova, ...prev]);
      return nova;
    }
    throw error;
  }, []);

  const atualizarSolicitacao = useCallback(async (id: string, dados: Partial<SolicitacaoEntrega>) => {
    const { data, error } = await supabase
      .from('solicitacoes')
      .update(mapToDB(dados))
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      const atualizada = mapFromDB(data);
      setSolicitacoes(prev => prev.map(s => s.id === id ? atualizada : s));
      return atualizada;
    }
    throw error;
  }, []);

  return { solicitacoes, loading, criarSolicitacao, atualizarSolicitacao, refetch: fetchSolicitacoes };
}
