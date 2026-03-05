CREATE OR REPLACE FUNCTION public.rpc_finalizar_entrega(p_carga_id uuid)
RETURNS void AS $$
BEGIN
  -- Marcar senhas pendentes como recusado (caminhao nao veio)
  UPDATE senhas SET status = 'recusado'
  WHERE carga_id = p_carga_id AND status NOT IN ('conferido', 'recusado');

  -- Liberar docas vinculadas a essas senhas recusadas
  UPDATE docas SET status='livre', carga_id=NULL, senha_id=NULL, conferente_id=NULL, volume_conferido=NULL, rua=NULL
  WHERE carga_id = p_carga_id AND senha_id IN (
    SELECT id FROM senhas WHERE carga_id = p_carga_id AND status = 'recusado'
  );

  -- Finalizar a carga com volume das conferidas
  UPDATE cargas
  SET status = 'conferido',
      volume_conferido = (SELECT COALESCE(SUM(volume_conferido), 0) FROM senhas WHERE carga_id = p_carga_id AND status = 'conferido')
  WHERE id = p_carga_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';