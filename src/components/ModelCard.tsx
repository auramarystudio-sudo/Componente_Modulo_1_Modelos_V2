// Componente ModelCard - Tarjeta individual de modelo SD
// Muestra información resumida del modelo con badge de tipo y acciones

import React from 'react';
import type { ModeloSD } from '../lib/demoData';

interface ModelCardProps {
  modelo: ModeloSD;
  onEdit: (modelo: ModeloSD) => void;
  onDelete: (id: string) => void;
}

// Colores de badge según tipo de modelo
const tipoConfig: Record<string, { color: string; bg: string; label: string }> = {
  checkpoint: { color: 'text-blue-300', bg: 'bg-blue-500/20 border-blue-500/40', label: 'Checkpoint' },
  lora: { color: 'text-green-300', bg: 'bg-green-500/20 border-green-500/40', label: 'LoRA' },
  vae: { color: 'text-orange-300', bg: 'bg-orange-500/20 border-orange-500/40', label: 'VAE' },
};

// Iconos según tipo
const tipoIcons: Record<string, string> = {
  checkpoint: '🧠',
  lora: '🎨',
  vae: '⚙️',
};

export default function ModelCard({ modelo, onEdit, onDelete }: ModelCardProps) {
  const config = tipoConfig[modelo.tipo] || tipoConfig.checkpoint;
  const icon = tipoIcons[modelo.tipo] || '📦';

  // Manejar eliminación con confirmación
  const handleDelete = () => {
    if (window.confirm(`¿Eliminar el modelo "${modelo.nombre}"? Esta acción no se puede deshacer.`)) {
      onDelete(modelo.id);
    }
  };

  // Formatear tags para mostrar
  const tagsArray: string[] = modelo.tags
    ? modelo.tags.split(',').map((t: string) => t.trim()).filter(Boolean).slice(0, 3)
    : [];

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-500 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/5 group">
      {/* Cabecera con imagen o gradiente */}
      <div className="h-36 bg-gradient-to-br from-slate-700 to-slate-800 relative overflow-hidden flex items-center justify-center">
        {modelo.imagen_principal ? (
          <img
            src={modelo.imagen_principal}
            alt={modelo.nombre}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="text-5xl opacity-40 group-hover:opacity-60 transition-opacity">
            {icon}
          </div>
        )}
        {/* Badge de tipo */}
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.color}`}>
          {config.label}
        </span>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-4 space-y-3">
        {/* Nombre del modelo */}
        <h3 className="text-lg font-bold text-white truncate" title={modelo.nombre}>
          {modelo.nombre}
        </h3>

        {/* Modelo base */}
        <p className="text-sm text-slate-400">
          <span className="text-slate-500">Base:</span> {modelo.modelo_base}
        </p>

        {/* Resumen de parámetros */}
        <div className="flex flex-wrap gap-2">
          {modelo.sampler && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-300">
              <span className="text-cyan-400">◈</span> {modelo.sampler}
            </span>
          )}
          {modelo.steps > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-300">
              <span className="text-purple-400">◈</span> {modelo.steps} steps
            </span>
          )}
          {modelo.cfg_scale > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-300">
              <span className="text-amber-400">◈</span> CFG {modelo.cfg_scale}
            </span>
          )}
        </div>

        {/* Tags */}
        {tagsArray.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tagsArray.map((tag: string, i: number) => (
              <span key={i} className="px-1.5 py-0.5 bg-cyan-900/30 border border-cyan-800/30 rounded text-xs text-cyan-300">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Enlace Civitai */}
        {modelo.url_civitai && (
          <a
            href={modelo.url_civitai}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            🔗 Civitai
          </a>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2 pt-2 border-t border-slate-700/50">
          <button
            onClick={() => onEdit(modelo)}
            className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-colors"
          >
            ✏️ Editar
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 px-3 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-800/30 text-red-300 text-sm font-medium rounded-lg transition-colors"
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
