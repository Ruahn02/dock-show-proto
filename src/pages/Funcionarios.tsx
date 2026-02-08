import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { ConferenteModal } from '@/components/conferentes/ConferenteModal';
import { useProfile } from '@/contexts/ProfileContext';
import { useConferentesDB } from '@/hooks/useConferentesDB';
import { Conferente } from '@/types';
import { toast } from 'sonner';
import { Plus, Edit, Users } from 'lucide-react';

export default function Funcionarios() {
  const { isAdmin } = useProfile();
  const navigate = useNavigate();
  const { conferentes, criarConferente, atualizarConferente } = useConferentesDB();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConferente, setSelectedConferente] = useState<Conferente | null>(null);

  useEffect(() => {
    if (!isAdmin) navigate('/');
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  const handleNovo = () => { setSelectedConferente(null); setModalOpen(true); };
  const handleEdit = (c: Conferente) => { setSelectedConferente(c); setModalOpen(true); };

  const handleSave = async (data: Partial<Conferente>) => {
    try {
      if (selectedConferente) {
        await atualizarConferente(selectedConferente.id, data);
        toast.success('Funcionário atualizado!');
      } else {
        await criarConferente(data);
        toast.success('Funcionário criado!');
      }
    } catch { toast.error('Erro ao salvar'); }
  };

  const handleToggleAtivo = async (c: Conferente) => {
    try {
      await atualizarConferente(c.id, { ativo: !c.ativo });
      toast.success(`Funcionário ${c.ativo ? 'desativado' : 'ativado'}!`);
    } catch { toast.error('Erro ao atualizar'); }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Funcionários</h1>
              <p className="text-muted-foreground">Conferentes e Separadores</p>
            </div>
          </div>
          <Button onClick={handleNovo} className="gap-2">
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conferentes.map((conferente) => (
                <TableRow key={conferente.id}>
                  <TableCell className="font-medium">{conferente.nome}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={conferente.ativo} onCheckedChange={() => handleToggleAtivo(conferente)} />
                      <Badge variant={conferente.ativo ? 'default' : 'secondary'}>
                        {conferente.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(conferente)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <ConferenteModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          conferente={selectedConferente}
          onSave={handleSave}
        />
      </div>
    </Layout>
  );
}
