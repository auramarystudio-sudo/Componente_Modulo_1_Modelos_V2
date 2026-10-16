// Importador desde HuggingFace API
export interface HuggingFaceImportResult {
  nombre: string;
  tipo: string;
  creador: string;
  tags: string;
  url_huggingface: string;
  imagen_principal: string;
  galeria_urls: string;
  notas: string;
}

export async function importarDesdeHuggingFace(url: string, maxImages: number = 50): Promise<HuggingFaceImportResult> {
  const match = url.match(/huggingface\.co\/(models\/)?(.+?)\/?$/);
  if (!match) {
    throw new Error('URL de HuggingFace inválida. Formato: https://huggingface.co/{author}/{model}');
  }

  const repoId = match[2];

  try {
    const response = await fetch(`https://huggingface.co/api/models/${repoId}`);
    if (!response.ok) {
      throw new Error(`Error de HuggingFace API: ${response.status}`);
    }

    const data = await response.json();
    const imagenUrl = `https://huggingface.co/${repoId}/resolve/main/thumbnail.png`;

    return {
      nombre: data.modelId || repoId,
      tipo: 'checkpoint',
      creador: data.author || '',
      tags: (data.tags || []).join(', '),
      url_huggingface: url,
      imagen_principal: imagenUrl,
      galeria_urls: '',
      notas: data.cardData?.short_description || '',
    };
  } catch (error) {
    throw new Error('No se pudo conectar con la API de HuggingFace.');
  }
}

export function esUrlHuggingFace(url: string): boolean {
  return /huggingface\.co\/.+\/.+/.test(url);
}
