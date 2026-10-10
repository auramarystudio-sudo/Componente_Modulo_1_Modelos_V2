// Importador desde HuggingFace API
// Extrae datos de modelos desde URLs de HuggingFace
// API Docs: https://huggingface.co/docs/hub/api

export interface HuggingFaceImportResult {
  nombre: string;
  tipo: string;
  creador: string;
  tags: string;
  url_huggingface: string;
  imagen_principal: string;
  notas: string;
  pipeline_tag: string;
  downloads: number;
  likes: number;
  library: string;
}

/**
 * Importa datos desde HuggingFace API
 * @param url - URL de HuggingFace (ej: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0)
 * @returns Datos del modelo extraídos
 */
export async function importarDesdeHuggingFace(url: string): Promise<HuggingFaceImportResult> {
  // Extraer repo_id de la URL
  const match = url.match(/huggingface\.co\/(models\/)?(.+?)\/?$/);
  if (!match) {
    throw new Error('URL de HuggingFace inválida. Formato: https://huggingface.co/{author}/{model}');
  }

  const repoId = match[2];

  try {
    const response = await fetch(`https://huggingface.co/api/models/${repoId}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Modelo no encontrado en HuggingFace');
      }
      if (response.status === 429) {
        throw new Error('Demasiadas solicitudes a HuggingFace. Espera un momento.');
      }
      throw new Error(`Error de HuggingFace API: ${response.status}`);
    }

    const data = await response.json();

    // Determinar tipo basado en pipeline_tag
    let tipo = 'checkpoint';
    const pipelineTag = data.pipeline_tag || '';
    if (pipelineTag.includes('text-generation') || pipelineTag.includes('text2text')) {
      tipo = 'chat';
    } else if (pipelineTag.includes('fill-mask') || pipelineTag.includes('token-classification')) {
      tipo = 'completion';
    } else if (pipelineTag.includes('feature-extraction') || pipelineTag.includes('sentence-similarity')) {
      tipo = 'embedding';
    } else if (pipelineTag.includes('image-to-text') || pipelineTag.includes('visual-question')) {
      tipo = 'vision';
    } else if (pipelineTag.includes('text-to-image')) {
      tipo = 'checkpoint';
    } else if (pipelineTag.includes('text-to-video')) {
      tipo = 'text_to_video';
    }

    // Construir URL de la imagen del card
    const imagenUrl = `https://huggingface.co/${repoId}/resolve/main/thumbnail.png`;

    return {
      nombre: data.modelId || repoId,
      tipo,
      creador: data.author || '',
      tags: (data.tags || []).join(', '),
      url_huggingface: url,
      imagen_principal: imagenUrl,
      notas: data.cardData?.short_description || data.description || '',
      pipeline_tag: pipelineTag,
      downloads: data.downloads || 0,
      likes: data.likes || 0,
      library: data.library_name || '',
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con la API de HuggingFace. Verifica tu conexión.');
    }
    throw error;
  }
}

/**
 * Detecta si una URL es de HuggingFace
 */
export function esUrlHuggingFace(url: string): boolean {
  return /huggingface\.co\/.+\/.+/.test(url);
}
