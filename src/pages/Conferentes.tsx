import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ConferenteModal } from '@/components/conferentes/ConferenteModal';
import { useProfile } from '@/contexts/ProfileContext';
import { conferentes as conferentesIniciais } from '@/data/mockData';
import { Conferente } from '@/types';
import { toast } from 'sonner';
import { Plus, Edit, Users } from 'lucide-react';

export default function Conferentes() {
  const { isAdmin } = useProfile();
  const navigate = useNavigate();
  const [conferentes, setConferentes] = useState<Conferente[]>(conferentesIniciais);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConferente, setSelectedConferente] = useState<Conferente | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  const handleNovo = () => {
    setSelectedConferente(null);
    setModalOpen(true);
  };

  const handleEdit = (conferente: Conferente) => {
    setSelectedConferente(conferente);
    setModalOpen(true);
  };

  const handleSave = (data: Partial<Conferente>) => {
    if (selectedConferente) {
      setConferentes(conferentes.map(c => 
        c.id === selectedConferente.id ? { ...c, ...data } : c
      ));
      toast.success('Conferente atualizado!');
    } else {
      const novoConferente: Conferente = {
        id: `c${Date.now()}`,
        nome: data.nome || '',
        matricula: data.matricula || '',
        ativo: data.ativo ?? true,
      };
      setConferentes([...conferentes, novoConferente]);
      toast.success('Conferente criado!');
    }
  };

  const handleToggleAtivo = (conferente: Conferente) => {
    setConferentes(conferentes.map(c => 
      c.id === conferente.id ? { ...c, ativo: !c.ativo } : c
    ));
    toast.success(`Conferente ${conferente.ativo ? 'desativado' : 'ativado'}!`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Conferentes</h1>
              <p className="text-muted-foreground">Gerenciamento de conferentes cadastrados</p>
            </div>
          </div>
          <Button onClick={handleNovo} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Conferente
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conferentes.map((conferente) => (
                <TableRow key={conferente.id}>
                  <TableCell className="font-medium">{conferente.nome}</TableCell>
                  <TableCell>{conferente.matricula}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={conferente.ativo}
                        onCheckedChange={() => handleToggleAtivo(conferente)}
                      />
                      <Badge 
                        variant={conferente.ativo ? 'default' : 'secondary'}
                      >
                        {conferente.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(conferente)}
                    >
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
