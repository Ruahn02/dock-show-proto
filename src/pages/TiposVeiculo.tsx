import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil } from 'lucide-react';
import { useTiposVeiculoDB, type TipoVeiculo } from '@/hooks/useTiposVeiculoDB';
import { TipoVeiculoModal } from '@/components/tipos-veiculo/TipoVeiculoModal';
import { useToast } from '@/hooks/use-toast';

export default function TiposVeiculo() {
  const { tipos, loading, error, criarTipo, atualizarTipo } = useTiposVeiculoDB();
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<TipoVeiculo | null>(null);
  const { toast } = useToast();

  const handleSave = async (data: { nome: string; ordem: number; quantidade_docas: number }) => {
    try {
      if (editando) {
        await atualizarTipo(editando.id, data);
        toast({ title: 'Tipo atualizado com sucesso' });
      } else {
        await criarTipo(data);
        toast({ title: 'Tipo criado com sucesso' });
      }
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
      throw new Error('save failed');
    }
  };

  const toggleAtivo = async (tipo: TipoVeiculo) => {
    try {
      await atualizarTipo(tipo.id, { ativo: !tipo.ativo });
      toast({ title: `Tipo ${tipo.ativo ? 'desativado' : 'ativado'}` });
    } catch {
      toast({ title: 'Erro ao alterar status', variant: 'destructive' });
    }
  };

  return (
    <Layout title="Tipos de Veículo">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Gerencie os tipos de veículos e quantas docas cada um ocupa.</p>
          <Button onClick={() => { setEditando(null); setModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Novo Tipo
          </Button>
        </div>

        {error && <div className="p-4 rounded-lg bg-destructive/10 text-destructive">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-center">Qtd. Docas</TableHead>
                  <TableHead className="text-center">Ordem</TableHead>
                  <TableHead className="text-center">Ativo</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tipos.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum tipo cadastrado</TableCell></TableRow>
                ) : (
                  tipos.map(tipo => (
                    <TableRow key={tipo.id}>
                      <TableCell className="font-medium">{tipo.nome.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</TableCell>
                      <TableCell className="text-center">{tipo.quantidade_docas}</TableCell>
                      <TableCell className="text-center">{tipo.ordem}</TableCell>
                      <TableCell className="text-center">
                        <Switch checked={tipo.ativo} onCheckedChange={() => toggleAtivo(tipo)} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Button size="icon" variant="ghost" onClick={() => { setEditando(tipo); setModalOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <TipoVeiculoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        tipo={editando}
        onSave={handleSave}
      />
    </Layout>
  );
}
