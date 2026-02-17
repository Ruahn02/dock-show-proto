
# Adicionar botao de Modo Claro / Escuro no Header

O projeto ja tem `next-themes` instalado e as variaveis CSS do modo escuro (`.dark`) definidas no `index.css`. So falta ativar o provider e adicionar o botao de toggle.

## Alteracoes

### 1. `src/App.tsx`
- Importar `ThemeProvider` de `next-themes`
- Envolver toda a aplicacao com `<ThemeProvider attribute="class" defaultTheme="light" storageKey="doca-theme">`
- Isso ativa o suporte a dark mode usando a classe CSS `.dark` no `<html>`

### 2. `src/components/layout/Header.tsx`
- Importar `useTheme` de `next-themes` e os icones `Sun` e `Moon` do lucide
- Adicionar um botao toggle ao lado do botao "Sair"
- Ao clicar, alterna entre `light` e `dark`
- Mostra icone de Sol (modo claro ativo) ou Lua (modo escuro ativo)

### 3. `tailwind.config.ts`
- Ja possui `darkMode: ["class"]` configurado - nenhuma alteracao necessaria

---

## Detalhes tecnicos

**Header.tsx - Botao toggle:**
```text
const { theme, setTheme } = useTheme();

<Button variant="outline" size="icon"
  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
  {theme === 'dark' ? <Sun /> : <Moon />}
</Button>
```

**App.tsx - Provider:**
```text
import { ThemeProvider } from 'next-themes';

<ThemeProvider attribute="class" defaultTheme="light" storageKey="doca-theme">
  ... resto da app ...
</ThemeProvider>
```

## Arquivos modificados

| Arquivo | Alteracao |
|---|---|
| `src/App.tsx` | Adiciona ThemeProvider envolvendo a app |
| `src/components/layout/Header.tsx` | Adiciona botao Sol/Lua para alternar tema |

Nenhuma alteracao no banco de dados. A preferencia do usuario fica salva no localStorage automaticamente pelo next-themes.
