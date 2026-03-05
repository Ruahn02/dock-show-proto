

# Plano Final Revisado — Ajustes de Robustez no Backend

## Analise do Cross Docking (Ponto 3)

Confirmei a estrutura: o sistema cria **1 unico registro** de cross_docking por carga. Em `Docas.tsx` (linha 295), `adicionarCross` e chamado uma vez quando `isUltimaSenha = true`. A tabela `cross_docking` nao tem separacao por NF ou tipo de operacao — as NFs sao armazenadas como array dentro do registro unico.

**Conclusao: manter `UNIQUE INDEX ON cross_docking(carga_id)` sem alteracao.** E a opcao correta para o schema atual.

---

## Migration SQL Final Completa

```sql
-- 1. Indice para queries por carga_id
CREATE INDEX IF NOT EXISTS idx_senhas_carga_id ON senhas(carga_id);

-- 2. Indice composto para queries com filtro de status
CREATE INDEX IF NOT EXISTS idx_senhas_carga_status ON senhas(carga_id, status);

-- 3. Indice para otimizar calculo de volume recebido
CREATE INDEX IF NOT EXISTS idx_senhas_carga_volume ON senhas(carga_id, volume_conferido);

-- 4. Unique index para prevenir duplicacao de cross docking por carga
CREATE UNIQUE INDEX IF NOT EXISTS idx_cross_docking_carga_unique ON cross_docking(carga_id);

-- 5. Funcao trigger: bloquear senha em carga finalizada (versao com EXISTS)
CREATE OR REPLACE FUNCTION bloquear_senha_em_carga_finalizada()
RETURNS trigger AS $$
BEGIN
  IF NEW.carga_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM cargas
    WHERE id = NEW.carga_id
    AND status IN ('conferido','recusado','no_show')
  ) THEN
    RAISE EXCEPTION 'Entrega já finalizada, não é possível gerar nova senha';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger na tabela senhas
CREATE TRIGGER trg_bloquear_senha_finalizada
BEFORE INSERT ON senhas
FOR EACH ROW
EXECUTE FUNCTION bloquear_senha_em_carga_finalizada();
```

## Ajuste no Frontend (pos-migration)

Em `src/pages/Docas.tsx` (linhas 295-302): envolver `adicionarCross` em `try/catch` para tratar graciosamente o erro de unique constraint caso dois operadores finalizem conferencias simultaneamente.

```typescript
try {
  adicionarCross({ ... });
} catch (err) {
  console.warn('Cross Docking já registrado para esta carga');
}
```

## Checklist

| Item | Status |
|---|---|
| `idx_senhas_carga_id` | Incluido |
| `idx_senhas_carga_status` | Incluido |
| `idx_senhas_carga_volume` | Incluido (novo) |
| `idx_cross_docking_carga_unique` | Incluido (1 cross por carga confirmado) |
| Funcao trigger com EXISTS | Incluida (atualizada conforme solicitado) |
| Trigger `trg_bloquear_senha_finalizada` | Incluido |
| try/catch no `adicionarCross` | Pos-migration |

Aguardando sua confirmacao para aplicar a migration.

