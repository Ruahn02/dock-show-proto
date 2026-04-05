import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TipoVeiculo } from '@/hooks/useTiposVeiculoDB';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipo?: TipoVeiculo | null;
  onSave: (data: { nome: string; ordem: number; quantidade_docas: number }) => Promise<void>;
}

export function TipoVeiculoModal({ open, onOpenChange, tipo, onSave }: Props) {
  const [nome, setNome] = useState('');
  const [ordem, setOrdem] = useState(0);
  const [quantidadeDocas, setQuantidadeDocas] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tipo) {
      setNome(tipo.nome);
      setOrdem(tipo.ordem);
      setQuantidadeDocas(tipo.quantidade_docas);
    } else {
      setNome('');
      setOrdem(0);
      setQuantidadeDocas(1);
    }
  }, [tipo, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    setSaving(true);
    try {
      await onSave({ nome: nome.trim(), ordem, quantidade_docas: quantidadeDocas });
      onOpenChange(false);
    } catch (err) {
      console.error('Erro ao salvar tipo de veículo:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tipo ? 'Editar Tipo de Veículo' : 'Novo Tipo de Veículo'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Carreta, Bi-trem..." required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qtd-docas">Quantidade de Docas</Label>
            <Input id="qtd-docas" type="number" min={1} value={quantidadeDocas} onChange={e => setQuantidadeDocas(Number(e.target.value))} />
            <p className="text-xs text-muted-foreground">Quantas docas este tipo de veículo ocupa ao ser vinculado.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ordem">Ordem de Exibição</Label>
            <Input id="ordem" type="number" min={0} value={ordem} onChange={e => setOrdem(Number(e.target.value))} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving || !nome.trim()}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
