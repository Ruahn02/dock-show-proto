

# Adicionar botão "Abrir" na tela de Controle de Senhas

## Alteração

Em `src/pages/ControleSenhas.tsx`, linha 235, ao lado do botão "Painel de Senhas (TV)", adicionar um novo botão que abre a página `/senha` em nova aba para facilitar o acesso direto à tela de geração de senha do motorista.

```tsx
<Button variant="outline" onClick={() => window.open('/senha', '_blank')}>
  <Ticket className="h-4 w-4 mr-2" />
  Gerar Senha
</Button>
```

Será posicionado antes do botão "Painel de Senhas (TV)" no mesmo `div` de ações do header.

