

# Adicionar botão "Finalizar Separação" para o Admin no Cross Docking

## Problema

Na tela de Cross Docking, quando uma carga está com status `em_separacao`, o admin vê apenas o texto "Separando: [nome]" sem nenhum botão de ação. O botão "Finalizar Separação" só aparece para o perfil operacional. O admin também precisa poder finalizar a separação.

## Alteração

### `src/pages/CrossDocking.tsx`

Linha 215-217: Substituir o texto estático por texto informativo + botão de finalizar.

```text
Antes:
  {isAdmin && cross.status === 'em_separacao' && (
    <span className="text-sm text-muted-foreground italic">
      Separando: {separador?.nome || '...'}
    </span>
  )}

Depois:
  {isAdmin && cross.status === 'em_separacao' && (
    <>
      <span className="text-sm text-muted-foreground italic">
        {separador?.nome || '...'}
      </span>
      <Button size="sm" className="bg-green-600 hover:bg-green-700"
        onClick={() => handleFinalizarSeparacao(cross)}>
        Finalizar Separação
      </Button>
    </>
  )}
```

Apenas 1 arquivo modificado, nenhuma alteração no banco de dados.
