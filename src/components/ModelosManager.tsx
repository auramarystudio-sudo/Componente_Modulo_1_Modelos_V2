// Componente ModelosManager - Manager principal unificado
// Maneja las 3 colecciones: SD, LLM, Video con tabs, búsqueda y filtros

import React, { useState, useEffect, useCallback } from 'react';
import pbClient, { checkConnection, isDemoMode, collections } from '../lib/pocketbase';
import { demoModelos } from '../lib/demoData';
import type { Modelo, CategoriaModelo } from '../lib/demoData';
import ModelCard from './ModelCard';
import ModelDetail from './ModelDetail';
import ModelForm from './ModelForm';

// Tabs de categoría
const tabs: { key: CategoriaModelo | 'todos'; label: string; icon: string }[] = [
  { key: 'todos', label: 'Todos', icon: '📋' },
  { key: 'sd', label: 'SD', icon: '🧠' },
  { key: 'llm', label: 'LLM', icon: '💬' },
  { key: 'video', label: 'Video', icon: '🎬' },
];

// Subtipos por categoría para filtros avanzados
const subtiposPorCategoria: Record<string, { value: string; label: string }[]> = {
  sd: [
    { value: '', label: 'Todos los subtipos' },
    { value: 'checkpoint', label: 'Checkpoint' },
    { value: 'lora', label: 'LoRA' },
    { value: 'vae', label: 'VAE' },
    { value: 'upscaler', label: 'Upscaler' },
    { value: 'controlnet', label: 'ControlNet' },
    { value: 'embedding', label: 'Embedding' },
  ],
  llm: [
    { value: '', label: 'Todos los subtipos' },
    { value: 'chat', label: 'Chat' },
    { value: 'completion', label: 'Completion' },
    { value: 'embedding', label: 'Embedding' },
    { value: 'vision', label: 'Vision' },
    { value: 'code', label: 'Code' },
  ],
  video: [
    { value: '', label: 'Todos los subtipos' },
    { value: 'text_to_video', label: 'Text to Video' },
    { value: 'image_to_video', label: 'Image to Video' },
    { value: 'video_to_video', label: 'Video to Video' },
    { value: 'animation', label: 'Animation' },
  ],
};

export default function ModelosManager() {
  // Estado principal
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [tabActivo, setTabActivo] = useState<CategoriaModelo | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [filtroSubtipo, setFiltroSubtipo] = useState('');
  const [cargando, setCargando] = useState(true);
  const [conexionOk, setConexionOk] = useState<boolean | null>(null);

  // Estado de modales
  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [modeloEditando, setModeloEditando] = useState<Modelo | null>(null);
  const [modeloDetalle, setModeloDetalle] = useState<Modelo | null>(null);

  // Cargar modelos desde PocketBase o datos demo
  const cargarModelos = useCallback(async () => {
    setCargando(true);
    try {
      const conectado = await checkConnection();
      setConexionOk(conectado);

      if (conectado) {
        // Cargar de las 3 colecciones en paralelo
        const [sdList, llmList, videoList] = await Promise.all([
          collections.sd.getFullList({ sort: '-created' }).catch(() => []),
          collections.llm.getFullList({ sort: '-created' }).catch(() => []),
          collections.video.getFullList({ sort: '-created' }).catch(() => []),
        ]);

        const todos: Modelo[] = [
          ...(sdList as unknown as Modelo[]).map(m => ({ ...m, categoria: 'sd' as const }) as Modelo),
          ...(llmList as unknown as Modelo[]).map(m => ({ ...m, categoria: 'llm' as const }) as Modelo),
          ...(videoList as unknown as Modelo[]).map(m => ({ ...m, categoria: 'video' as const }) as Modelo),
        ];
        setModelos(todos);
      } else {
        setModelos(demoModelos);
      }
    } catch (err) {
      console.error('Error al cargar modelos:', err);
      setModelos(demoModelos);
      setConexionOk(false);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarModelos();
  }, [cargarModelos]);

  // Filtrar modelos
  const modelosFiltrados = modelos.filter((m) => {
    // Filtro por tab/categoría
    if (tabActivo !== 'todos' && m.categoria !== tabActivo) return false;
    // Filtro por subtipo
    if (filtroSubtipo && m.tipo !== filtroSubtipo) return false;
    // Filtro por búsqueda
    if (busqueda) {
      const q = busqueda.toLowerCase();
      const campos = [
        m.nombre,
        m.tags || '',
        m.notas || '',
        m.categoria === 'sd' ? (m as any).modelo_base : '',
        m.categoria === 'llm' ? (m as any).creador : '',
        m.categoria === 'video' ? (m as any).framework : '',
      ];
      return campos.some(campo => String(campo).toLowerCase().includes(q));
    }
    return true;
  });

  // Contadores por categoría
  const contadores = {
    todos: modelos.length,
    sd: modelos.filter(m => m.categoria === 'sd').length,
    llm: modelos.filter(m => m.categoria === 'llm').length,
    video: modelos.filter(m => m.categoria === 'video').length,
  };

  // Crear modelo
  const handleCrear = async (data: Record<string, unknown>, file?: File | null) => {
    const categoria = data.categoria as CategoriaModelo;

    if (isDemoMode()) {
      const nuevoModelo: Modelo = {
        ...data,
        id: `${categoria}-${Date.now()}`,
        categoria,
        imagen_principal: file ? URL.createObjectURL(file) : (data.imagen_principal as string) || '',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      } as Modelo;
      setModelos(prev => [nuevoModelo, ...prev]);
    } else {
      const collectionName = categoria === 'sd' ? 'modelos_sd' : categoria === 'llm' ? 'modelos_llm' : 'modelos_video';
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && key !== 'categoria') {
          formData.append(key, String(value));
        }
      });
      if (file) formData.append('imagen_principal', file);
      const nuevo = await pbClient.collection(collectionName).create(formData);
      setModelos(prev => [{ ...nuevo as object, categoria } as unknown as Modelo, ...prev]);
    }
    setModalFormAbierto(false);
    setModeloEditando(null);
  };

  // Actualizar modelo
  const handleEditar = async (data: Record<string, unknown>, file?: File | null) => {
    if (!modeloEditando) return;
    const categoria = modeloEditando.categoria;

    if (isDemoMode()) {
      setModelos(prev => prev.map(m => {
        if (m.id === modeloEditando.id) {
          return {
            ...m,
            ...data,
            imagen_principal: file ? URL.createObjectURL(file) : m.imagen_principal,
            updated: new Date().toISOString(),
          } as Modelo;
        }
        return m;
      }));
    } else {
      const collectionName = categoria === 'sd' ? 'modelos_sd' : categoria === 'llm' ? 'modelos_llm' : 'modelos_video';
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && key !== 'categoria') {
          formData.append(key, String(value));
        }
      });
      if (file) formData.append('imagen_principal', file);
      const actualizado = await pbClient.collection(collectionName).update(modeloEditando.id, formData);
      setModelos(prev => prev.map(m => m.id === modeloEditando.id ? { ...actualizado as object, categoria } as unknown as Modelo : m));
    }
    setModalFormAbierto(false);
    setModeloEditando(null);
  };

  // Eliminar modelo
  const handleEliminar = async (id: string, categoria: string) => {
    try {
      if (!isDemoMode()) {
        const collectionName = categoria === 'sd' ? 'modelos_sd' : categoria === 'llm' ? 'modelos_llm' : 'modelos_video';
        await pbClient.collection(collectionName).delete(id);
      }
      setModelos(prev => prev.filter(m => m.id !== id));
      setModeloDetalle(null);
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert('Error al eliminar el modelo.');
    }
  };

  // Resetear subtipo al cambiar tab
  useEffect(() => {
    setFiltroSubtipo('');
  }, [tabActivo]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                🤖 Modelos
              </h1>
              <p className="mt-1 text-slate-400 text-sm sm:text-base">
                Galería unificada de modelos SD, LLM y Video
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setModeloEditando(null); setModalFormAbierto(true); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
              >
                <span>+</span> Nuevo
              </button>
            </div>
          </div>

          {/* Estado de conexión */}
          {conexionOk !== null && (
            <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
              conexionOk
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${conexionOk ? 'bg-green-400' : 'bg-amber-400'} animate-pulse`} />
              {conexionOk ? 'Conectado a PocketBase' : 'Modo Demo (PocketBase no disponible)'}
            </div>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs de categoría */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTabActivo(t.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  tabActivo === t.key
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span>{t.icon}</span>
                <span className="hidden sm:inline">{t.label}</span>
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                  tabActivo === t.key ? 'bg-cyan-500/30' : 'bg-slate-700'
                }`}>
                  {contadores[t.key]}
                </span>
              </button>
            ))}
          </div>

          {/* Filtro de subtipo */}
          {tabActivo !== 'todos' && subtiposPorCategoria[tabActivo] && (
            <select
              value={filtroSubtipo}
              onChange={(e) => setFiltroSubtipo(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              {subtiposPorCategoria[tabActivo].map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          )}

          {/* Búsqueda */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, tags, base..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Grid de modelos o estado vacío */}
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <p className="mt-4 text-slate-400">Cargando modelos...</p>
          </div>
        ) : modelosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 border border-slate-700">
              <span className="text-4xl">📦</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-300 mb-2">
              {busqueda || filtroSubtipo
                ? 'No se encontraron modelos'
                : 'No hay modelos registrados'}
            </h3>
            <p className="text-slate-500 max-w-md">
              {busqueda || filtroSubtipo
                ? 'Prueba ajustando los filtros o el término de búsqueda.'
                : 'Añade tu primer modelo usando el botón "Nuevo".'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {modelosFiltrados.map((modelo) => (
              <ModelCard
                key={modelo.id}
                modelo={modelo}
                onViewDetail={setModeloDetalle}
                onEdit={(m) => { setModeloEditando(m); setModalFormAbierto(true); }}
                onDelete={handleEliminar}
              />
            ))}
          </div>
        )}

        {/* Resumen */}
        {modelosFiltrados.length > 0 && (
          <div className="mt-8 pt-4 border-t border-slate-800 text-center text-sm text-slate-500">
            Mostrando {modelosFiltrados.length} de {modelos.length} modelos
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {modeloDetalle && (
        <ModelDetail
          modelo={modeloDetalle}
          onClose={() => setModeloDetalle(null)}
          onEdit={(m) => { setModeloEditando(m); setModeloDetalle(null); setModalFormAbierto(true); }}
          onDelete={handleEliminar}
        />
      )}

      {/* Modal de formulario */}
      {modalFormAbierto && (
        <ModelForm
          onClose={() => { setModalFormAbierto(false); setModeloEditando(null); }}
          onSave={modeloEditando ? handleEditar : handleCrear}
          modeloInicial={modeloEditando}
        />
      )}
    </div>
  );
}
