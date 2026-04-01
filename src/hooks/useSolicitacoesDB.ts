import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchAllRows } from '@/lib/supabasePagination';
import { withRetry } from '@/lib/supabaseRetry';
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
    notaFiscal: row.nota_fiscal ?? undefined,
    numeroPedido: row.numero_pedido ?? undefined,
    comprador: row.comprador ?? undefined,
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
  if ('notaFiscal' in data) result.nota_fiscal = data.notaFiscal ?? null;
  if ('numeroPedido' in data) result.numero_pedido = data.numeroPedido ?? null;
  if ('comprador' in data) result.comprador = data.comprador ?? null;
  return result;
}

export function useSolicitacoesDB(initialDelay = 0) {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoEntrega[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchSolicitacoes = useCallback(async () => {
    const { data, error: err } = await fetchAllRows('solicitacoes', '*', [{ column: 'created_at', ascending: false }]);
    if (!mountedRef.current) return;
    if (err) {
      console.error('[useSolicitacoesDB] fetch error:', err);
      setError('Falha ao carregar solicitações');
    } else if (data) {
      setSolicitacoes(data.map(mapFromDB));
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchSolicitacoes();

    const channel = supabase
      .channel('solicitacoes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitacoes' }, () => {
        fetchSolicitacoes();
      })
      .subscribe();

    return () => {
      mountedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [fetchSolicitacoes]);

  const criarSolicitacao = useCallback(async (dados: Omit<SolicitacaoEntrega, 'id' | 'status' | 'dataSolicitacao'>) => {
    const { data, error } = await withRetry(() =>
      supabase.from('solicitacoes').insert({
        fornecedor_id: dados.fornecedorId,
        tipo_caminhao: dados.tipoCaminhao,
        quantidade_veiculos: dados.quantidadeVeiculos,
        volume_previsto: dados.volumePrevisto,
        observacoes: dados.observacoes ?? null,
        email_contato: dados.emailContato,
        nota_fiscal: dados.notaFiscal ?? null,
        numero_pedido: dados.numeroPedido ?? null,
        comprador: dados.comprador ?? null,
        status: 'pendente',
      }).select().single()
    );
    if (!error && data) {
      const nova = mapFromDB(data);
      setSolicitacoes(prev => [nova, ...prev]);
      return nova;
    }
    throw error;
  }, []);

  const atualizarSolicitacao = useCallback(async (id: string, dados: Partial<SolicitacaoEntrega>) => {
    const { data, error } = await withRetry(() =>
      supabase.from('solicitacoes').update(mapToDB(dados)).eq('id', id).select().single()
    );
    if (!error && data) {
      const atualizada = mapFromDB(data);
      setSolicitacoes(prev => prev.map(s => s.id === id ? atualizada : s));
      return atualizada;
    }
    throw error;
  }, []);

  return { solicitacoes, loading, error, criarSolicitacao, atualizarSolicitacao, refetch: fetchSolicitacoes };
}
