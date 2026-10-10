// Cliente de PocketBase - Conexión real a la base de datos
// Configura la URL de tu instancia de PocketBase aquí
import PocketBase from 'pocketbase';

// URL del servidor PocketBase (cambiar según tu configuración)
const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';

// Instancia global del cliente PocketBase
const pbClient = new PocketBase(POCKETBASE_URL);

// Flag para modo demo cuando no hay servidor disponible
let demoMode = false;

// Función para verificar conexión con PocketBase
export async function checkConnection(): Promise<boolean> {
  try {
    await pbClient.health.check();
    demoMode = false;
    return true;
  } catch {
    console.warn('⚠️ PocketBase no disponible. Activando modo demo con datos locales.');
    demoMode = true;
    return false;
  }
}

export function isDemoMode(): boolean {
  return demoMode;
}

export default pbClient;
