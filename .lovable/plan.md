

# Mudar tema do app para tons de amarelo/dourado

## Referencia

A imagem mostra um esquema de cores com:
- Header/barra superior: gradiente amarelo-dourado (aproximadamente `hsl(40, 95%, 55%)` a `hsl(35, 90%, 50%)`)
- Botoes e acentos: amarelo-dourado `hsl(40, 90%, 50%)`
- Fundo: bege claro `hsl(40, 50%, 96%)`
- Textos de destaque: laranja-dourado `hsl(30, 90%, 50%)`

## Alteracao

### `src/index.css`

Atualizar as variaveis CSS do `:root` (tema claro) para tons de amarelo/dourado:

```text
--background: 40 50% 97%        (bege claro)
--foreground: 30 20% 10%        (marrom escuro)
--card: 40 40% 99%              (branco levemente amarelado)
--card-foreground: 30 20% 10%
--primary: 40 90% 50%           (amarelo dourado - cor principal)
--primary-foreground: 0 0% 100% (branco)
--secondary: 40 40% 93%         (bege medio)
--secondary-foreground: 30 30% 15%
--accent: 40 50% 92%            (bege acentuado)
--accent-foreground: 30 30% 15%
--muted: 40 30% 94%
--muted-foreground: 30 10% 45%
--destructive: 0 84% 60%       (vermelho - manter)
--border: 40 30% 88%
--input: 40 30% 88%
--ring: 40 90% 50%
--sidebar-background: 40 40% 96%
--sidebar-primary: 40 90% 45%
--sidebar-primary-foreground: 0 0% 100%
--sidebar-accent: 40 40% 92%
--sidebar-accent-foreground: 30 30% 15%
--sidebar-border: 40 25% 88%
--sidebar-ring: 40 90% 50%
```

O tema dark sera ajustado para versoes escuras dos mesmos tons dourados.

### Arquivo unico modificado

- `src/index.css` (apenas variaveis CSS)

Nenhuma alteracao em componentes ou banco de dados.

