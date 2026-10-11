// Utilidades para abrir enlaces externos con fallback

/**
 * Abre una URL en una nueva pestaña. Si el navegador lo bloquea (por ejemplo, en un iframe),
 * copia la URL al portapapeles y muestra una notificación.
 */
export function openExternalUrl(url: string, nombre: string = 'enlace'): void {
  if (!url) return;

  // Intentar abrir la URL
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');

  // Si window.open devuelve null o undefined, el navegador lo bloqueó
  if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
    // Fallback: copiar al portapapeles
    navigator.clipboard.writeText(url).then(() => {
      // Mostrar notificación temporal
      mostrarNotificacion(`URL de ${nombre} copiada al portapapeles`, 'info');
    }).catch(() => {
      // Si tampoco se puede copiar, mostrar error
      mostrarNotificacion(`No se pudo abrir el enlace. URL: ${url}`, 'error');
    });
  }
}

/**
 * Muestra una notificación temporal en la esquina inferior derecha
 */
function mostrarNotificacion(mensaje: string, tipo: 'info' | 'error' | 'success' = 'info'): void {
  // Crear elemento de notificación
  const notif = document.createElement('div');
  
  // Estilos según el tipo
  const colores = {
    info: 'bg-blue-600 border-blue-500',
    error: 'bg-red-600 border-red-500',
    success: 'bg-green-600 border-green-500'
  };
  
  notif.className = `fixed bottom-4 right-4 z-[9999] px-4 py-3 rounded-lg border ${colores[tipo]} text-white shadow-lg max-w-md animate-slide-in`;
  notif.textContent = mensaje;
  
  // Agregar animación CSS si no existe
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slide-out {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
      .animate-slide-in {
        animation: slide-in 0.3s ease-out;
      }
      .animate-slide-out {
        animation: slide-out 0.3s ease-in;
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notif);
  
  // Remover después de 3 segundos con animación de salida
  setTimeout(() => {
    notif.classList.remove('animate-slide-in');
    notif.classList.add('animate-slide-out');
    setTimeout(() => {
      if (document.body.contains(notif)) {
        document.body.removeChild(notif);
      }
    }, 300);
  }, 3000);
}
