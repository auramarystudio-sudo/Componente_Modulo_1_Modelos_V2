// Cliente PocketBase - Soporte para 3 colecciones: modelos_sd, modelos_llm, modelos_video
import PocketBase from 'pocketbase';

const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
const pbClient = new PocketBase(POCKETBASE_URL);

let demoMode = false;

export async function checkConnection(): Promise<boolean> {
  try {
    await pbClient.health.check();
    demoMode = false;
    return true;
  } catch {
    console.warn('⚠️ PocketBase no disponible. Activando modo demo.');
    demoMode = true;
    return false;
  }
}

export function isDemoMode(): boolean {
  return demoMode;
}

// Helpers para cada colección
export const collections = {
  sd: pbClient.collection('modelos_sd'),
  llm: pbClient.collection('modelos_llm'),
  video: pbClient.collection('modelos_video'),
};

export default pbClient;
