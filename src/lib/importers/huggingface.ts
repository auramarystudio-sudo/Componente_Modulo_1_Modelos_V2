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
  galeria_urls: string;
  notas: string;
  pipeline_tag: string;
  downloads: number;
  likes: number;
  library: string;
}

/**
 * Extrae URLs de imágenes del contenido del README.md
 * Soporta múltiples formatos: markdown, HTML, rutas relativas y absolutas
 */
function extraerImagenesDeReadme(readmeText: string, repoId: string): string[] {
  const urls: string[] = [];
  const baseUrl = `https://huggingface.co/${repoId}/resolve/main`;

  // 1. Imágenes en formato Markdown: ![alt](url)
  // Captura tanto URLs absolutas como relativas
  const mdRegex = /!\[[^\]]*\]\(([^)]+)\)/gi;
  let match;
  while ((match = mdRegex.exec(readmeText)) !== null) {
    let imgUrl = match[1].trim();
    // Eliminar posibles títulos "imagen.jpg "title""
    imgUrl = imgUrl.split(/\s+["']/)[0];
    urls.push(normalizarUrl(imgUrl, baseUrl, repoId));
  }

  // 2. Imágenes en formato HTML: <img src="url"> o <img ... src="url" ...>
  const htmlRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  while ((match = htmlRegex.exec(readmeText)) !== null) {
    let imgUrl = match[1].trim();
    urls.push(normalizarUrl(imgUrl, baseUrl, repoId));
  }

  // 3. Imágenes en formato HTML con srcset
  const srcsetRegex = /srcset=["']([^"']+)["']/gi;
  while ((match = srcsetRegex.exec(readmeText)) !== null) {
    const srcset = match[1];
    // srcset puede tener múltiples URLs separadas por coma
    const parts = srcset.split(',').map(s => s.trim().split(/\s+/)[0]);
    parts.forEach(part => {
      if (part) urls.push(normalizarUrl(part, baseUrl, repoId));
    });
  }

  // 4. Referencias a imágenes en el formato de HuggingFace: 
  // ![alt](https://huggingface.co/datasets/... o referencias a assets)
  const hfAssetRegex = /(https:\/\/huggingface\.co\/[^\/\s)]+\/[^\/\s)]+\/resolve\/[^\/\s)]+\/[^\s)]+\.(png|jpg|jpeg|webp|gif)(\?[^\s)]*)?)/gi;
  while ((match = hfAssetRegex.exec(readmeText)) !== null) {
    urls.push(match[1]);
  }

  // 5. Imágenes con formato de HuggingFace CDN
  const hfCdnRegex = /(https:\/\/cdn\.huggingface\.co\/[^\s)]+\.(png|jpg|jpeg|webp|gif)(\?[^\s)]*)?)/gi;
  while ((match = hfCdnRegex.exec(readmeText)) !== null) {
    urls.push(match[1]);
  }

  // Limpiar y deduplicar
  return [...new Set(
    urls
      .filter(url => url && url.length > 0)
      .filter(url => !url.includes('badge') && !url.includes('shield.io') && !url.includes('img.shields'))
      .filter(url => !url.endsWith('.svg'))
      .filter(url => !url.includes('colab'))
      .filter(url => !url.includes('github.com'))
      .filter(url => !url.includes('twitter.com') && !url.includes('x.com'))
      .filter(url => !url.includes('youtube.com') && !url.includes('youtu.be'))
  )].slice(0, 30);
}

/**
 * Normaliza una URL de imagen a formato absoluto
 */
function normalizarUrl(url: string, baseUrl: string, repoId: string): string {
  if (!url) return '';
  
  // Si ya es una URL absoluta
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Si es una ruta relativa con ./
  if (url.startsWith('./')) {
    return `${baseUrl}/${url.substring(2)}`;
  }

  // Si es una ruta relativa sin ./
  if (!url.startsWith('/') && !url.startsWith('http')) {
    return `${baseUrl}/${url}`;
  }

  // Si empieza con /, es relativa al repo
  if (url.startsWith('/')) {
    return `https://huggingface.co/${repoId}/resolve/main${url}`;
  }

  return url;
}

/**
 * Obtiene archivos de imagen directamente del repositorio usando la API tree
 */
async function obtenerImagenesDelRepositorio(repoId: string): Promise<string[]> {
  try {
    const response = await fetch(`https://huggingface.co/api/models/${repoId}/tree/main`);
    if (!response.ok) return [];

    const files = await response.json();
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
    const baseUrl = `https://huggingface.co/${repoId}/resolve/main`;

    return files
      .filter((file: { type: string; path: string }) => file.type === 'file')
      .map((file: { path: string }) => file.path)
      .filter((path: string) => {
        const lower = path.toLowerCase();
        return imageExtensions.some(ext => lower.endsWith(ext));
      })
      .filter((path: string) => {
        // Excluir archivos de carpetas de datasets o modelos pesados
        const lower = path.toLowerCase();
        return !lower.includes('dataset') && 
               !lower.includes('__pycache__') &&
               !lower.includes('.git/');
      })
      .map((path: string) => `${baseUrl}/${path}`)
      .slice(0, 30);
  } catch (err) {
    console.warn('No se pudo obtener el árbol de archivos:', err);
    return [];
  }
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
    // Ejecutar en paralelo: API del modelo, README y árbol de archivos
    const [modelResponse, readmeResponse, treeImages] = await Promise.all([
      fetch(`https://huggingface.co/api/models/${repoId}`, {
        headers: { 'Accept': 'application/json' },
      }),
      fetch(`https://huggingface.co/${repoId}/raw/main/README.md`).catch(() => null),
      obtenerImagenesDelRepositorio(repoId),
    ]);

    if (!modelResponse.ok) {
      if (modelResponse.status === 404) {
        throw new Error('Modelo no encontrado en HuggingFace');
      }
      if (modelResponse.status === 429) {
        throw new Error('Demasiadas solicitudes a HuggingFace. Espera un momento.');
      }
      throw new Error(`Error de HuggingFace API: ${modelResponse.status}`);
    }

    const data = await modelResponse.json();

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

    // Extraer galería de múltiples fuentes
    let galeriaUrls: string[] = [];

    // Fuente 1: Imágenes del README.md
    if (readmeResponse && readmeResponse.ok) {
      const readmeText = await readmeResponse.text();
      const readmeImages = extraerImagenesDeReadme(readmeText, repoId);
      galeriaUrls = [...galeriaUrls, ...readmeImages];
    }

    // Fuente 2: Imágenes del árbol de archivos (solo si no hay suficientes del README)
    if (galeriaUrls.length < 3 && treeImages.length > 0) {
      galeriaUrls = [...galeriaUrls, ...treeImages];
    }

    // Deduplicar y limitar
    const galeriaFinal = [...new Set(galeriaUrls)]
      .filter(url => url !== imagenUrl) // No duplicar la imagen principal
      .slice(0, 20);

    return {
      nombre: data.modelId || repoId,
      tipo,
      creador: data.author || '',
      tags: (data.tags || []).join(', '),
      url_huggingface: url,
      imagen_principal: imagenUrl,
      galeria_urls: galeriaFinal.join('\n'),
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
