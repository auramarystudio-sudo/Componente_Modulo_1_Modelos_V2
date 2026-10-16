import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Plus, Download, Upload, BarChart3, Grid3X3, List, Search, Star, Copy, Trash2, Edit, ExternalLink, X, GitCompare, Image as ImageIcon, Zap } from 'lucide-react';
import pbClient, { checkConnection, isDemoMode, collections } from '../lib/pocketbase';
import { demoModelos } from '../lib/demoData';
import type { Modelo, CategoriaModelo } from '../lib/demoData';
import ModelCard from './ModelCard';
import ModelDetail from './ModelDetail';
import ModelForm from './ModelForm';
import StatsPanel from './StatsPanel';
import ModelComparator from './ModelComparator';
import ImageSimilaritySearch from './ImageSimilaritySearch';
import GenerationAPI from './GenerationAPI';

const tabs: { key: CategoriaModelo | 'todos' | 'favoritos'; label: string; icon: React.ReactNode }[] = [
  { key: 'todos', label: 'Todos', icon: <Grid3X3 className="w-4 h-4" /> },
  { key: 'favoritos', label: 'Favoritos', icon: <Star className="w-4 h-4" /> },
  { key: 'sd', label: 'SD', icon: <span>🧠</span> },
  { key: 'llm', label: 'LLM', icon: <span>💬</span> },
  { key: 'video', label: 'Video', icon: <span>🎬</span> },
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
  const [comparadorAbierto, setComparadorAbierto] = useState(false);
  const [busquedaImagenAbierta, setBusquedaImagenAbierta] = useState(false);
  const [modeloParaGenerar, setModeloParaGenerar] = useState<Modelo | null>(null);

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
    if (tabActivo === 'favoritos' && !m.favorito) return false;
    if (tabActivo !== 'todos' && tabActivo !== 'favoritos' && m.categoria !== tabActivo) return false;
    if (filtroSubtipo && m.tipo !== filtroSubtipo) return false;
    if (filtroTags.length > 0) {
      const modelTags = m.tags ? m.tags.split(',').map(t => t.trim().toLowerCase()) : [];
      if (!filtroTags.every(tag => modelTags.includes(tag.toLowerCase()))) return false;
    }
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

  const handleTagClick = (tag: string) => {
    setFiltroTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

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

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header Glassmorphism */}
      <header className="border-b border-slate-800/50 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-40 shadow-lg">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Modelos IA
                </h1>
                <p className="text-xs text-slate-500">Galería unificada SD, LLM y Video</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setComparadorAbierto(true)} className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition" title="Comparar modelos">
                <GitCompare className="w-4 h-4" />
              </button>
              <button onClick={() => setBusquedaImagenAbierta(true)} className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition" title="Buscar por imagen">
                <ImageIcon className="w-4 h-4" />
              </button>
              <button onClick={() => setStatsAbierto(true)} className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition" title="Estadísticas">
                <BarChart3 className="w-4 h-4" />
              </button>
              <button onClick={handleExport} className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition" title="Exportar">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={handleImport} className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition" title="Importar">
                <Upload className="w-4 h-4" />
              </button>
              <button onClick={() => { setModeloEditando(null); setModalFormAbierto(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-medium transition shadow-lg">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nuevo</span>
              </button>
            </div>
          </div>
          {conexionOk !== null && (
            <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium ${conexionOk ? 'bg-green-950/50 border border-green-800/30 text-green-300' : 'bg-amber-950/50 border border-amber-800/30 text-amber-300'}`}>
              <span className={`w-2 h-2 rounded-full ${conexionOk ? 'bg-green-400' : 'bg-amber-400'} animate-pulse`} />
              {conexionOk ? 'Conectado a PocketBase' : 'Modo Demo'}
            </div>
          )}
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        {/* Tabs y Controles */}
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 backdrop-blur-sm shadow-xl mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-800/50 border border-slate-700/50 rounded-lg p-1 overflow-x-auto">
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setTabActivo(t.key)} className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition whitespace-nowrap ${tabActivo === t.key ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
                  {t.icon}
                  <span className="hidden sm:inline">{t.label}</span>
                  <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${tabActivo === t.key ? 'bg-white/20' : 'bg-slate-700/50'}`}>{contadores[t.key]}</span>
                </button>
              ))}
            </div>

            {/* Toggle vista */}
            <div className="flex items-center gap-1 bg-slate-800/50 border border-slate-700/50 rounded-lg p-1">
              <button onClick={() => setVistaMode('grid')} className={`p-2 rounded-md transition ${vistaMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`} title="Vista grid">
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button onClick={() => setVistaMode('list')} className={`p-2 rounded-md transition ${vistaMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`} title="Vista lista">
                <List className="w-4 h-4" />
              </button>
            </div>

            {tabActivo !== 'todos' && tabActivo !== 'favoritos' && subtiposPorCategoria[tabActivo] && (
              <select value={filtroSubtipo} onChange={(e) => setFiltroSubtipo(e.target.value)} className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition">
                {subtiposPorCategoria[tabActivo].map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            )}

            {/* Búsqueda */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input id="search-input" type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar... (Ctrl+F)" className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition" />
              </div>
            </div>
          </div>

          {/* Filtros de tags */}
          {filtroTags.length > 0 && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-xs font-medium text-slate-400">Filtros:</span>
              {filtroTags.map(tag => (
                <button key={tag} onClick={() => setFiltroTags(prev => prev.filter(t => t !== tag))} className="flex items-center gap-1 px-2 py-1 bg-cyan-950/50 border border-cyan-800/30 text-cyan-300 text-xs rounded-md hover:bg-cyan-900/50 transition">
                  #{tag}
                  <X className="w-3 h-3" />
                </button>
              ))}
              <button onClick={() => setFiltroTags([])} className="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded-md hover:bg-slate-700/50 transition">Limpiar</button>
            </div>
          )}
        </div>

        {/* Contenido */}
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <p className="mt-4 text-slate-400">Cargando modelos...</p>
          </div>
        ) : modelosFiltrados.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-12 backdrop-blur-sm shadow-xl text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-2xl flex items-center justify-center border border-slate-700/50">
              <span className="text-4xl">📦</span>
            </div>
            <h3 className="text-lg font-bold text-slate-300 mb-2">{busqueda || filtroSubtipo || filtroTags.length > 0 ? 'No se encontraron modelos' : 'No hay modelos registrados'}</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">{busqueda || filtroSubtipo || filtroTags.length > 0 ? 'Prueba ajustando los filtros o el término de búsqueda.' : 'Añade tu primer modelo usando el botón "Nuevo" (Ctrl+N).'}</p>
          </div>
        ) : vistaMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {modelosFiltrados.map((modelo) => (
              <ModelCard key={modelo.id} modelo={modelo} onViewDetail={setModeloDetalle} onEdit={(m) => { setModeloEditando(m); setModalFormAbierto(true); }} onDelete={handleEliminar} onToggleFavorite={handleToggleFavorite} onDuplicate={handleDuplicate} onTagClick={handleTagClick} onTest={setModeloParaGenerar} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {modelosFiltrados.map((modelo) => (
              <div key={modelo.id} className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800/50 rounded-xl backdrop-blur-sm hover:border-slate-700/50 transition cursor-pointer shadow-lg" onClick={() => setModeloDetalle(modelo)}>
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800/50 flex-shrink-0 border border-slate-700/50">
                  {modelo.imagen_principal ? (
                    <img src={modelo.imagen_principal} alt={modelo.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">{modelo.categoria === 'sd' ? '🧠' : modelo.categoria === 'llm' ? '💬' : '🎬'}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-100 truncate">{modelo.nombre}</h3>
                    {modelo.favorito && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{modelo.notas || 'Sin descripción'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-md ${modelo.categoria === 'sd' ? 'bg-blue-950/50 text-blue-300 border border-blue-800/30' : modelo.categoria === 'llm' ? 'bg-green-950/50 text-green-300 border border-green-800/30' : 'bg-purple-950/50 text-purple-300 border border-purple-800/30'}`}>{modelo.categoria.toUpperCase()}</span>
                    <span className="text-xs text-slate-500">{modelo.tipo}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); handleToggleFavorite(modelo.id, modelo.categoria); }} className={`p-2 rounded-lg transition ${modelo.favorito ? 'bg-amber-950/50 text-amber-400' : 'bg-slate-800/50 text-slate-400 hover:text-amber-400'}`} title="Favorito">
                    <Star className={`w-4 h-4 ${modelo.favorito ? 'fill-amber-400' : ''}`} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDuplicate(modelo); }} className="p-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition" title="Duplicar">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setModeloEditando(modelo); setModalFormAbierto(true); }} className="p-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition" title="Editar">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleEliminar(modelo.id, modelo.categoria); }} className="p-2 bg-red-950/50 hover:bg-red-900/50 text-red-400 rounded-lg transition" title="Eliminar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {modelosFiltrados.length > 0 && <div className="mt-8 pt-4 border-t border-slate-800/50 text-center text-sm text-slate-500">Mostrando {modelosFiltrados.length} de {modelos.length} modelos</div>}
      </div>

      {modeloDetalle && <ModelDetail modelo={modeloDetalle} onClose={() => setModeloDetalle(null)} onEdit={(m) => { setModeloEditando(m); setModeloDetalle(null); setModalFormAbierto(true); }} onDelete={handleEliminar} onSetImagePosition={handleSetImagePosition} onToggleFavorite={handleToggleFavorite} onTagClick={handleTagClick} />}
      {modalFormAbierto && <ModelForm onClose={() => { setModalFormAbierto(false); setModeloEditando(null); }} onSave={modeloEditando ? handleEditar : handleCrear} modeloInicial={modeloEditando} />}
      <StatsPanel modelos={modelos} isOpen={statsAbierto} onClose={() => setStatsAbierto(false)} />
      <ModelComparator modelos={modelos} isOpen={comparadorAbierto} onClose={() => setComparadorAbierto(false)} />
      <ImageSimilaritySearch modelos={modelos} isOpen={busquedaImagenAbierta} onClose={() => setBusquedaImagenAbierta(false)} onSelectModel={setModeloDetalle} />
      {modeloParaGenerar && <GenerationAPI modelo={modeloParaGenerar} isOpen={true} onClose={() => setModeloParaGenerar(null)} />}
    </div>
  );
}
