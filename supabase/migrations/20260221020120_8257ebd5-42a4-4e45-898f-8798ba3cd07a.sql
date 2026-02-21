UPDATE cargas c
SET nfs = ARRAY[s.nota_fiscal]
FROM solicitacoes s
WHERE c.solicitacao_id = s.id
  AND s.nota_fiscal IS NOT NULL
  AND s.nota_fiscal <> ''
  AND c.nfs = '{}'::text[];