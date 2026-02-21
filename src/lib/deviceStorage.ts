const DEVICE_ID_KEY = 'dock_device_id';
const DEVICE_SENHAS_KEY = 'dock_device_senhas';

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function saveDeviceSenha(senhaId: string): void {
  const senhas = getDeviceSenhas();
  if (!senhas.includes(senhaId)) {
    senhas.push(senhaId);
    localStorage.setItem(DEVICE_SENHAS_KEY, JSON.stringify(senhas));
  }
}

export function getDeviceSenhas(): string[] {
  try {
    const raw = localStorage.getItem(DEVICE_SENHAS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
