import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { FornecedorModal } from '@/components/fornecedores/FornecedorModal';
import { useProfile } from '@/contexts/ProfileContext';
import { useFornecedoresDB } from '@/hooks/useFornecedoresDB';
import { Fornecedor } from '@/types';
import { toast } from 'sonner';
import { Plus, Edit, Building2 } from 'lucide-react';

export default function Fornecedores() {
  const { isAdmin } = useProfile();
  const navigate = useNavigate();
  const { fornecedores, criarFornecedor, atualizarFornecedor } = useFornecedoresDB();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFornecedor, setSelectedFornecedor] = useState<Fornecedor | null>(null);

  useEffect(() => {
    if (!isAdmin) navigate('/');
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  const handleNovo = () => { setSelectedFornecedor(null); setModalOpen(true); };
  const handleEdit = (f: Fornecedor) => { setSelectedFornecedor(f); setModalOpen(true); };

  const handleSave = async (data: Partial<Fornecedor>) => {
    try {
      if (selectedFornecedor) {
        await atualizarFornecedor(selectedFornecedor.id, data);
        toast.success('Fornecedor atualizado!');
      } else {
        await criarFornecedor(data);
        toast.success('Fornecedor criado!');
      }
    } catch { toast.error('Erro ao salvar'); }
  };

  const handleToggleAtivo = async (f: Fornecedor) => {
    try {
      await atualizarFornecedor(f.id, { ativo: !f.ativo });
      toast.success(`Fornecedor ${f.ativo ? 'desativado' : 'ativado'}!`);
    } catch { toast.error('Erro ao atualizar'); }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Fornecedores</h1>
              <p className="text-muted-foreground">Lista de fornecedores</p>
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
              {fornecedores.map((fornecedor) => (
                <TableRow key={fornecedor.id}>
                  <TableCell className="font-medium">{fornecedor.nome}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={fornecedor.ativo} onCheckedChange={() => handleToggleAtivo(fornecedor)} />
                      <Badge variant={fornecedor.ativo ? 'default' : 'secondary'}>
                        {fornecedor.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(fornecedor)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <FornecedorModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          fornecedor={selectedFornecedor}
          onSave={handleSave}
        />
      </div>
    </Layout>
  );
}
