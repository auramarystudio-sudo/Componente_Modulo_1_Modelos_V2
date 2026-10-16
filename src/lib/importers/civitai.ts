// Importador desde Civitai API
export interface CivitaiImportResult {
  nombre: string;
  tipo: string;
  modelo_base: string;
  tags: string;
  url_civitai: string;
  imagen_principal: string;
  galeria_urls: string;
  notas: string;
}

export async function importarDesdeCivitai(url: string, maxImages: number = 50): Promise<CivitaiImportResult> {
  const match = url.match(/models\/(\d+)/);
  if (!match) {
    throw new Error('URL de Civitai inválida. Formato esperado: https://civitai.com/models/{id}');
  }

  const modelId = match[1];

  try {
    const response = await fetch(`https://civitai.com/api/v1/models/${modelId}`);
    if (!response.ok) {
      throw new Error(`Error de Civitai API: ${response.status}`);
    }

    const data = await response.json();
    const primeraVersion = data.modelVersions?.[0];
    const primeraImagen = primeraVersion?.images?.[0]?.url || '';

    const todasLasImagenes: string[] = [];
    (data.modelVersions || []).slice(0, 5).forEach((v: any) => {
      (v.images || []).forEach((img: any) => {
        if (img.url) todasLasImagenes.push(img.url);
      });
    });

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
    };
  } catch (error) {
    throw new Error('No se pudo conectar con la API de Civitai.');
  }
}

export function esUrlCivitai(url: string): boolean {
  return /civitai\.com\/models\/\d+/.test(url);
}
