// Importador desde Civitai API
// Extrae datos de modelos desde URLs de Civitai
// API Docs: https://developer.civitai.com/docs/api/public-rest

export interface CivitaiImportResult {
  nombre: string;
  tipo: string;
  modelo_base: string;
  tags: string;
  url_civitai: string;
  imagen_principal: string;
  galeria_urls: string;
  notas: string;
  creador: string;
  nsfw: boolean;
  versiones: Array<{
    name: string;
    baseModel: string;
    trainedWords: string[];
    images: Array<{
      url: string;
      nsfw: string;
      width: number;
      height: number;
    }>;
  }>;
}

/**
 * Importa datos desde Civitai API
 * @param url - URL de Civitai (ej: https://civitai.com/models/4201)
 * @param maxImages - Número máximo de imágenes a importar (default: 50, usa -1 para sin límite)
 * @returns Datos del modelo extraídos
 */
export async function importarDesdeCivitai(url: string, maxImages: number = 50): Promise<CivitaiImportResult> {
  // Extraer ID del modelo de la URL
  const match = url.match(/models\/(\d+)/);
  if (!match) {
    throw new Error('URL de Civitai inválida. Formato esperado: https://civitai.com/models/{id}');
  }

  const modelId = match[1];

  try {
    const response = await fetch(`https://civitai.com/api/v1/models/${modelId}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Modelo no encontrado en Civitai');
      }
      if (response.status === 429) {
        throw new Error('Demasiadas solicitudes. Espera un momento e intenta de nuevo.');
      }
      throw new Error(`Error de Civitai API: ${response.status}`);
    }

    const data = await response.json();

    // Mapear datos de Civitai a nuestro formato
    const primeraVersion = data.modelVersions?.[0];
    const primeraImagen = primeraVersion?.images?.[0]?.url || '';

    // Extraer galería completa de todas las versiones
    const todasLasImagenes: string[] = [];
    const versionesMapeadas = (data.modelVersions || []).slice(0, 5).map((v: any) => {
      const imagenesVersion = (v.images || [])
        .filter((img: any) => img.url && !img.nsfw || img.nsfw === 'None')
        .map((img: any) => {
          todasLasImagenes.push(img.url);
          return {
            url: img.url,
            nsfw: img.nsfw || 'None',
            width: img.width || 0,
            height: img.height || 0,
          };
        });
      
      return {
        name: v.name,
        baseModel: v.baseModel,
        trainedWords: v.trainedWords || [],
        images: imagenesVersion,
      };
    });

    // Unir todas las URLs de la galería
    const galeriaUnica = maxImages === -1 
      ? [...new Set(todasLasImagenes)] 
      : [...new Set(todasLasImagenes)].slice(0, maxImages);

    return {
      nombre: data.name || 'Sin nombre',
      tipo: (data.type || 'checkpoint').toLowerCase(),
      modelo_base: primeraVersion?.baseModel || 'SD 1.5',
      tags: (data.tags || []).join(', '),
      url_civitai: url,
      imagen_principal: primeraImagen,
      galeria_urls: galeriaUnica.join('\n'),
      notas: (data.description || '').replace(/<[^>]*>/g, '').substring(0, 500),
      creador: data.creator?.username || '',
      nsfw: data.nsfw || false,
      versiones: versionesMapeadas,
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con la API de Civitai. Verifica tu conexión a internet.');
    }
    throw error;
  }
}

/**
 * Detecta si una URL es de Civitai
 */
export function esUrlCivitai(url: string): boolean {
  return /civitai\.com\/models\/\d+/.test(url);
}
