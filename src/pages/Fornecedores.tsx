import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { FornecedorModal } from '@/components/fornecedores/FornecedorModal';
import { useProfile } from '@/contexts/ProfileContext';
import { useFornecedoresDB } from '@/hooks/useFornecedoresDB';
import { Fornecedor } from '@/types';
import { toast } from 'sonner';
import { Plus, Edit, Building2, Search, Loader2 } from 'lucide-react';
import { ConnectionError } from '@/components/ui/ConnectionError';
import { getErrorMessage } from '@/lib/supabaseRetry';

export default function Fornecedores() {
  const { isAdmin } = useProfile();
  const navigate = useNavigate();
  const { fornecedores, loading, error, criarFornecedor, atualizarFornecedor, refetch } = useFornecedoresDB();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFornecedor, setSelectedFornecedor] = useState<Fornecedor | null>(null);
  const [filtroNome, setFiltroNome] = useState('');

  const fornecedoresFiltrados = fornecedores.filter(f =>
    f.nome.toLowerCase().includes(filtroNome.toLowerCase())
  );

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
    } catch (err: any) { toast.error(getErrorMessage(err)); }
  };

  const handleToggleAtivo = async (f: Fornecedor) => {
    try {
      await atualizarFornecedor(f.id, { ativo: !f.ativo });
      toast.success(`Fornecedor ${f.ativo ? 'desativado' : 'ativado'}!`);
    } catch (err: any) { toast.error(getErrorMessage(err)); }
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

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar fornecedor por nome..."
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <ConnectionError message={error} onRetry={refetch} />
        ) : (
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
              {fornecedoresFiltrados.map((fornecedor) => (
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
          fornecedoresExistentes={fornecedores}
        />
      </div>
    </Layout>
  );
}
