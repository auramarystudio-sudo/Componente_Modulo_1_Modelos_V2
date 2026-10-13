import React, { useState, useEffect, useCallback } from 'react';
import pbClient, { checkConnection, isDemoMode, collections } from '../lib/pocketbase';
import { demoModelos } from '../lib/demoData';
import type { Modelo, CategoriaModelo } from '../lib/demoData';
import ModelCard from './ModelCard';
import ModelDetail from './ModelDetail';
import ModelForm from './ModelForm';
import StatsPanel from './StatsPanel';

const tabs: { key: CategoriaModelo | 'todos' | 'favoritos'; label: string; icon: string }[] = [
  { key: 'todos', label: 'Todos', icon: '📋' },
  { key: 'favoritos', label: 'Favoritos', icon: '⭐' },
  { key: 'sd', label: 'SD', icon: '🧠' },
  { key: 'llm', label: 'LLM', icon: '💬' },
  { key: 'video', label: 'Video', icon: '🎬' },
];

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

type VistaMode = 'grid' | 'list';

export default function ModelosManager() {
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [tabActivo, setTabActivo] = useState<CategoriaModelo | 'todos' | 'favoritos'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [filtroSubtipo, setFiltroSubtipo] = useState('');
  const [filtroTags, setFiltroTags] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [conexionOk, setConexionOk] = useState<boolean | null>(null);
  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [modeloEditando, setModeloEditando] = useState<Modelo | null>(null);
  const [modeloDetalle, setModeloDetalle] = useState<Modelo | null>(null);
  const [statsAbierto, setStatsAbierto] = useState(false);
  const [vistaMode, setVistaMode] = useState<VistaMode>('grid');

  const cargarModelos = useCallback(async () => {
    setCargando(true);
    try {
      const conectado = await checkConnection();
      setConexionOk(conectado);
      if (conectado) {
        const [sdList, llmList, videoList] = await Promise.all([
          collections.sd.getFullList({ sort: '-created' }).catch(() => []),
          collections.llm.getFullList({ sort: '-created' }).catch(() => []),
          collections.video.getFullList({ sort: '-created' }).catch(() => []),
        ]);
        const todos: Modelo[] = [
          ...(sdList as unknown as Modelo[]).map(m => ({ ...m, categoria: 'sd' as const, favorito: false }) as Modelo),
          ...(llmList as unknown as Modelo[]).map(m => ({ ...m, categoria: 'llm' as const, favorito: false }) as Modelo),
          ...(videoList as unknown as Modelo[]).map(m => ({ ...m, categoria: 'video' as const, favorito: false }) as Modelo),
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
    if (tabActivo === 'favoritos' && !m.favorito) return false;
    if (tabActivo !== 'todos' && tabActivo !== 'favoritos' && m.categoria !== tabActivo) return false;
    // Filtro por subtipo
    if (filtroSubtipo && m.tipo !== filtroSubtipo) return false;
    // Filtro por tags
    if (filtroTags.length > 0) {
      const modelTags = m.tags ? m.tags.split(',').map(t => t.trim().toLowerCase()) : [];
      if (!filtroTags.every(tag => modelTags.includes(tag.toLowerCase()))) return false;
    }
    // Búsqueda avanzada
    if (busqueda) {
      const q = busqueda.toLowerCase();
      const campos = [m.nombre, m.tags || '', m.notas || '', m.categoria === 'sd' ? (m as any).modelo_base : '', m.categoria === 'llm' ? (m as any).creador : '', m.categoria === 'video' ? (m as any).framework : ''];
      return campos.some(campo => String(campo).toLowerCase().includes(q));
    }
    return true;
  });

  const contadores = {
    todos: modelos.length,
    favoritos: modelos.filter(m => m.favorito).length,
    sd: modelos.filter(m => m.categoria === 'sd').length,
    llm: modelos.filter(m => m.categoria === 'llm').length,
    video: modelos.filter(m => m.categoria === 'video').length,
  };

  // Crear modelo
  const handleCrear = async (data: Record<string, unknown>, file?: File | null) => {
    const categoria = data.categoria as CategoriaModelo;
    if (isDemoMode()) {
      const nuevoModelo: Modelo = { ...data, id: `${categoria}-${Date.now()}`, categoria, favorito: false, imagen_principal: file ? URL.createObjectURL(file) : (data.imagen_principal as string) || '', created: new Date().toISOString(), updated: new Date().toISOString() } as Modelo;
      setModelos(prev => [nuevoModelo, ...prev]);
    } else {
      const collectionName = categoria === 'sd' ? 'modelos_sd' : categoria === 'llm' ? 'modelos_llm' : 'modelos_video';
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && key !== 'categoria') formData.append(key, String(value));
      });
      if (file) formData.append('imagen_principal', file);
      const nuevo = await pbClient.collection(collectionName).create(formData);
      setModelos(prev => [{ ...nuevo as object, categoria, favorito: false } as unknown as Modelo, ...prev]);
    }
    setModalFormAbierto(false);
    setModeloEditando(null);
  };

  // Actualizar modelo
  const handleEditar = async (data: Record<string, unknown>, file?: File | null) => {
    if (!modeloEditando) return;
    const categoria = modeloEditando.categoria;
    if (isDemoMode()) {
      setModelos(prev => prev.map((m: Modelo) => m.id === modeloEditando.id ? { ...m, ...data, imagen_principal: file ? URL.createObjectURL(file) : m.imagen_principal, updated: new Date().toISOString() } as Modelo : m));
    } else {
      const collectionName = categoria === 'sd' ? 'modelos_sd' : categoria === 'llm' ? 'modelos_llm' : 'modelos_video';
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && key !== 'categoria') formData.append(key, String(value));
      });
      if (file) formData.append('imagen_principal', file);
      const actualizado = await pbClient.collection(collectionName).update(modeloEditando.id, formData);
      setModelos(prev => prev.map((m: Modelo) => m.id === modeloEditando.id ? { ...actualizado as object, categoria } as unknown as Modelo : m));
    }
    setModalFormAbierto(false);
    setModeloEditando(null);
  };

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

  const handleSetImagePosition = async (id: string, categoria: string, position: string) => {
    try {
      if (isDemoMode()) {
        setModelos(prev => prev.map(m => m.id === id ? { ...m, posicion_imagen: position } as Modelo : m));
      } else {
        const collectionName = categoria === 'sd' ? 'modelos_sd' : categoria === 'llm' ? 'modelos_llm' : 'modelos_video';
        await pbClient.collection(collectionName).update(id, { posicion_imagen: position });
        setModelos(prev => prev.map(m => m.id === id ? { ...m, posicion_imagen: position } as Modelo : m));
      }
      if (modeloDetalle && modeloDetalle.id === id) setModeloDetalle({ ...modeloDetalle, posicion_imagen: position } as Modelo);
    } catch (err) {
      console.error('Error al establecer posición de imagen:', err);
    }
  };

  // Toggle favorito
  const handleToggleFavorite = async (id: string, categoria: string) => {
    const modelo = modelos.find(m => m.id === id);
    if (!modelo) return;
    const nuevoFavorito = !modelo.favorito;
    
    if (isDemoMode()) {
      setModelos(prev => prev.map(m => m.id === id ? { ...m, favorito: nuevoFavorito } as Modelo : m));
    } else {
      try {
        const collectionName = categoria === 'sd' ? 'modelos_sd' : categoria === 'llm' ? 'modelos_llm' : 'modelos_video';
        await pbClient.collection(collectionName).update(id, { favorito: nuevoFavorito });
        setModelos(prev => prev.map(m => m.id === id ? { ...m, favorito: nuevoFavorito } as Modelo : m));
      } catch (err) {
        console.error('Error al actualizar favorito:', err);
      }
    }
  };

  // Duplicar modelo
  const handleDuplicate = (modelo: Modelo) => {
    const nuevoModelo: Modelo = {
      ...modelo,
      id: `${modelo.categoria}-${Date.now()}`,
      nombre: `${modelo.nombre} (Copia)`,
      favorito: false,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    } as Modelo;
    setModelos(prev => [nuevoModelo, ...prev]);
  };

  // Tag click
  const handleTagClick = (tag: string) => {
    setFiltroTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  // Exportar modelos
  const handleExport = () => {
    const data = JSON.stringify(modelos, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modelos-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Importar modelos
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text) as Modelo[];
        if (!Array.isArray(data)) throw new Error('Formato inválido');
        setModelos(prev => [...data, ...prev]);
        alert(`✅ ${data.length} modelos importados correctamente`);
      } catch (err) {
        alert('❌ Error al importar: archivo JSON inválido');
      }
    };
    input.click();
  };

  // Atajos de teclado globales
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si está escribiendo en un input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        setModeloEditando(null);
        setModalFormAbierto(true);
      } else if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      } else if (e.key === 'Escape') {
        setModalFormAbierto(false);
        setModeloDetalle(null);
        setStatsAbierto(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setFiltroSubtipo('');
  }, [tabActivo]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">🤖 Modelos</h1>
              <p className="mt-1 text-slate-400 text-sm sm:text-base">Galería unificada de modelos SD, LLM y Video</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setStatsAbierto(true)} className="inline-flex items-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-lg" title="Ver estadísticas">📊</button>
              <button onClick={handleExport} className="inline-flex items-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-lg" title="Exportar modelos">📤</button>
              <button onClick={handleImport} className="inline-flex items-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-lg" title="Importar modelos">📥</button>
              <button onClick={() => { setModeloEditando(null); setModalFormAbierto(true); }} className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/20 transition-all active:scale-95"><span>+</span> Nuevo</button>
            </div>
          </div>
          {conexionOk !== null && (
            <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${conexionOk ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'}`}>
              <span className={`w-2 h-2 rounded-full ${conexionOk ? 'bg-green-400' : 'bg-amber-400'} animate-pulse`} />
              {conexionOk ? 'Conectado a PocketBase' : 'Modo Demo (PocketBase no disponible)'}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs y controles */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1 overflow-x-auto">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTabActivo(t.key)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tabActivo === t.key ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
                <span>{t.icon}</span>
                <span className="hidden sm:inline">{t.label}</span>
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${tabActivo === t.key ? 'bg-cyan-500/30' : 'bg-slate-700'}`}>{contadores[t.key]}</span>
              </button>
            ))}
          </div>

          {/* Toggle vista */}
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
            <button onClick={() => setVistaMode('grid')} className={`px-2 py-1 rounded text-sm ${vistaMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`} title="Vista grid">⊞</button>
            <button onClick={() => setVistaMode('list')} className={`px-2 py-1 rounded text-sm ${vistaMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`} title="Vista lista">☰</button>
          </div>

          {tabActivo !== 'todos' && tabActivo !== 'favoritos' && subtiposPorCategoria[tabActivo] && (
            <select value={filtroSubtipo} onChange={(e) => setFiltroSubtipo(e.target.value)} className="px-3 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none">
              {subtiposPorCategoria[tabActivo].map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          )}

          <div className="flex-1 max-w-md">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
              <input id="search-input" type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar... (Ctrl+F)" className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none placeholder:text-slate-500" />
            </div>
          </div>
        </div>

        {/* Filtros de tags activos */}
        {filtroTags.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs text-slate-400">Filtros:</span>
            {filtroTags.map(tag => (
              <button key={tag} onClick={() => setFiltroTags(prev => prev.filter(t => t !== tag))} className="px-2 py-1 bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 text-xs rounded-full hover:bg-cyan-600/40 transition-colors">
                #{tag} ✕
              </button>
            ))}
            <button onClick={() => setFiltroTags([])} className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full hover:bg-slate-600">Limpiar</button>
          </div>
        )}

        {/* Contenido */}
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <p className="mt-4 text-slate-400">Cargando modelos...</p>
          </div>
        ) : modelosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 border border-slate-700"><span className="text-4xl">📦</span></div>
            <h3 className="text-lg font-semibold text-slate-300 mb-2">{busqueda || filtroSubtipo || filtroTags.length > 0 ? 'No se encontraron modelos' : 'No hay modelos registrados'}</h3>
            <p className="text-slate-500 max-w-md">{busqueda || filtroSubtipo || filtroTags.length > 0 ? 'Prueba ajustando los filtros o el término de búsqueda.' : 'Añade tu primer modelo usando el botón "Nuevo" (Ctrl+N).'}</p>
          </div>
        ) : vistaMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {modelosFiltrados.map((modelo) => (
              <ModelCard key={modelo.id} modelo={modelo} onViewDetail={setModeloDetalle} onEdit={(m) => { setModeloEditando(m); setModalFormAbierto(true); }} onDelete={handleEliminar} onToggleFavorite={handleToggleFavorite} onDuplicate={handleDuplicate} onTagClick={handleTagClick} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {modelosFiltrados.map((modelo) => (
              <div key={modelo.id} className="flex items-center gap-4 p-3 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-500 transition-colors cursor-pointer" onClick={() => setModeloDetalle(modelo)}>
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
                  {modelo.imagen_principal ? (
                    <img src={modelo.imagen_principal} alt={modelo.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">{modelo.categoria === 'sd' ? '🧠' : modelo.categoria === 'llm' ? '💬' : '🎬'}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white truncate">{modelo.nombre}</h3>
                    {modelo.favorito && <span className="text-amber-400">★</span>}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{modelo.notas || 'Sin descripción'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${modelo.categoria === 'sd' ? 'bg-blue-600/20 text-blue-300' : modelo.categoria === 'llm' ? 'bg-green-600/20 text-green-300' : 'bg-purple-600/20 text-purple-300'}`}>{modelo.categoria.toUpperCase()}</span>
                    <span className="text-xs text-slate-500">{modelo.tipo}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); handleToggleFavorite(modelo.id, modelo.categoria); }} className={`p-2 rounded-lg transition-colors ${modelo.favorito ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400 hover:text-amber-400'}`} title="Favorito">{modelo.favorito ? '★' : '☆'}</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDuplicate(modelo); }} className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg" title="Duplicar">📋</button>
                  <button onClick={(e) => { e.stopPropagation(); setModeloEditando(modelo); setModalFormAbierto(true); }} className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg" title="Editar">✏️</button>
                  <button onClick={(e) => { e.stopPropagation(); handleEliminar(modelo.id, modelo.categoria); }} className="p-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-lg" title="Eliminar">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {modelosFiltrados.length > 0 && <div className="mt-8 pt-4 border-t border-slate-800 text-center text-sm text-slate-500">Mostrando {modelosFiltrados.length} de {modelos.length} modelos</div>}
      </div>

      {modeloDetalle && <ModelDetail modelo={modeloDetalle} onClose={() => setModeloDetalle(null)} onEdit={(m) => { setModeloEditando(m); setModeloDetalle(null); setModalFormAbierto(true); }} onDelete={handleEliminar} onSetImagePosition={handleSetImagePosition} onToggleFavorite={handleToggleFavorite} onTagClick={handleTagClick} />}
      {modalFormAbierto && <ModelForm onClose={() => { setModalFormAbierto(false); setModeloEditando(null); }} onSave={modeloEditando ? handleEditar : handleCrear} modeloInicial={modeloEditando} />}
      <StatsPanel modelos={modelos} isOpen={statsAbierto} onClose={() => setStatsAbierto(false)} />
    </div>
  );
}
