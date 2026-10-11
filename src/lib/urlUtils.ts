// Utilidades para abrir enlaces externos con fallback

/**
 * Abre una URL en una nueva pestaña. Si el navegador lo bloquea (por ejemplo, en un iframe),
 * copia la URL al portapapeles silenciosamente.
 */
export function openExternalUrl(url: string, nombre: string = 'enlace'): void {
  if (!url) return;

  // Intentar abrir la URL
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');

  // Si window.open devuelve null o undefined, el navegador lo bloqueó
  if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
    // Fallback: copiar al portapapeles silenciosamente
    navigator.clipboard.writeText(url).catch(() => {
      // Silenciar errores de copiado
    });
  }
}


