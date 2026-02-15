-- Fix legacy cargas stuck with wrong status (aguardando_conferencia without being in a doca)
UPDATE cargas 
SET status = 'aguardando_chegada' 
WHERE status = 'aguardando_conferencia' 
  AND chegou = true 
  AND id NOT IN (SELECT carga_id FROM docas WHERE carga_id IS NOT NULL);