// Tipos e interfaces para los 3 tipos de modelos
// SD = Stable Diffusion, LLM = Large Language Models, Video = Video Generation

export interface ModeloSD {
  id: string;
  categoria: 'sd';
  nombre: string;
  tipo: 'checkpoint' | 'lora' | 'vae' | 'upscaler' | 'controlnet' | 'embedding';
  ecosistema: 'sd15' | 'sdxl' | 'flux' | 'pony' | 'illustrious' | 'other';
  modelo_base: string;
  modelo_vae: string;
  upscaler: string;
  sampler: string;
  steps: number;
  cfg_scale: number;
  clip_skip: number;
  tags: string;
  galeria_urls: string;
  url_civitai: string;
  url_huggingface: string;
  prompt_referencia: string;
  prompt_negativo_default: string;
  imagen_principal: string;
  posicion_imagen: string;
  vram_min: string;
  vram_rec: string;
  notas: string;
  estado: 'activo' | 'archivado' | 'pendiente';
  favorito: boolean;
  version: string;
  created: string;
  updated: string;
}

export interface ModeloLLM {
  id: string;
  categoria: 'llm';
  nombre: string;
  tipo: 'chat' | 'completion' | 'embedding' | 'vision' | 'code' | 'reasoning' | 'multimodal' | 'lightweight';
  framework: 'ollama' | 'lm_studio' | 'llama_cpp' | 'vllm' | 'text_gen_webui';
  creador: string;
  version: string;
  tamaño_parametros: string;
  cuantizacion: string;
  contexto_maximo: number;
  temperatura_default: number;
  top_p: number;
  top_k: number;
  max_tokens: number;
  system_prompt_default: string;
  tags: string;
  url_descarga: string;
  url_huggingface: string;
  url_ollama: string;
  vram_min: string;
  vram_rec: string;
  imagen_principal: string;
  notas: string;
  estado: 'activo' | 'archivado' | 'pendiente';
  favorito: boolean;
  created: string;
  updated: string;
}

export interface ModeloVideo {
  id: string;
  categoria: 'video';
  nombre: string;
  tipo: 'text_to_video' | 'image_to_video' | 'video_to_video' | 'animation';
  framework: 'stable_video_diffusion' | 'animatediff' | 'deforum' | 'wan' | 'ltx' | 'cogvideox' | 'other';
  modelo_base: string;
  fps_recomendado: number;
  frames_totales: number;
  resolucion: string;
  cfg_scale: number;
  steps: number;
  motion_bucket_id: number;
  tags: string;
  url_descarga: string;
  imagen_principal: string;
  notas: string;
  estado: 'activo' | 'archivado' | 'pendiente';
  favorito: boolean;
  version: string;
  created: string;
  updated: string;
}

export interface ModeloAudio {
  id: string;
  categoria: 'audio';
  nombre: string;
  tipo: 'tts' | 'voice_cloning' | 'asr' | 'music_generation';
  framework: string;
  creador: string;
  tamaño_parametros: string;
  idiomas: string;
  calidad_audio: string;
  latencia: 'ultra-baja' | 'baja' | 'media' | 'alta';
  modo_ejecucion: 'local' | 'api' | 'ambos';
  tiempo_real: boolean;
  formato_entrada: string;
  formato_salida: string;
  caracteristicas: string;
  licencia: string;
  vram_min: string;
  url_descarga: string;
  url_github: string;
  url_demo: string;
  tags: string;
  notas: string;
  imagen_principal: string;
  estado: 'activo' | 'archivado' | 'pendiente';
  favorito: boolean;
  version: string;
  created: string;
  updated: string;
}

export interface ModeloComplemento {
  id: string;
  categoria: 'complemento';
  nombre: string;
  tipo: 'control' | 'optimizacion' | 'movimiento' | 'utilidad';
  subcategoria: 'nodos' | 'wrapper' | 'manager' | 'suite';
  autor: string;
  version: string;
  nodos_incluidos: number;
  compatibilidad: string;
  requiere_gpu: 'nvidia' | 'amd' | 'cpu' | 'cualquiera';
  descripcion: string;
  funcionalidades: string;
  vram_requerida: string;
  url_github: string;
  url_documentacion: string;
  tags: string;
  notas: string;
  imagen_principal: string;
  estado: 'activo' | 'archivado' | 'pendiente';
  favorito: boolean;
  created: string;
  updated: string;
}

export type Modelo = ModeloSD | ModeloLLM | ModeloVideo | ModeloAudio | ModeloComplemento;
export type CategoriaModelo = 'sd' | 'llm' | 'video' | 'audio' | 'complemento';

// Datos demo
export const demoModelos: Modelo[] = [
  {
    id: 'sd-1',
    categoria: 'sd',
    nombre: 'Realistic Vision V6.0',
    tipo: 'checkpoint',
    ecosistema: 'sd15',
    modelo_base: 'SD 1.5',
    modelo_vae: 'vae-ft-mse-840000',
    upscaler: '4x-UltraSharp',
    sampler: 'DPM++ 2M Karras',
    steps: 30,
    cfg_scale: 7,
    clip_skip: 1,
    tags: 'realista, fotografía, retratos, 8k',
    galeria_urls: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=512\nhttps://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=512\nhttps://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=512',
    url_civitai: 'https://civitai.com/models/4201',
    url_huggingface: '',
    prompt_referencia: 'masterpiece, best quality, photorealistic, 8k uhd, high resolution, detailed skin',
    prompt_negativo_default: 'bad anatomy, bad hands, blurry, low quality, watermark, text, deformed',
    imagen_principal: '',
    posicion_imagen: 'center',
    vram_min: '4GB',
    vram_rec: '8GB',
    notas: 'Excelente para fotografía realista. Funciona mejor con resolución 512x512 o 512x768.',
    estado: 'activo',
    favorito: true,
    version: '6.0',
    created: '2024-01-15 10:30:00',
    updated: '2024-01-15 10:30:00',
  },
  {
    id: 'sd-2',
    categoria: 'sd',
    nombre: 'Juggernaut XL V9',
    tipo: 'checkpoint',
    ecosistema: 'sdxl',
    modelo_base: 'SDXL 1.0',
    modelo_vae: 'sdxl_vae',
    upscaler: '4x-NMKD-Siax',
    sampler: 'DPM++ 2M SDE Karras',
    steps: 35,
    cfg_scale: 6.5,
    clip_skip: 2,
    tags: 'cinemático, realista, sdxl, alta calidad, dramático',
    galeria_urls: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=512\nhttps://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=512',
    url_civitai: 'https://civitai.com/models/133005',
    url_huggingface: '',
    prompt_referencia: 'cinematic lighting, dramatic shadows, 8k, ultra detailed, masterpiece, professional photography',
    prompt_negativo_default: 'cartoon, anime, painting, blurry, low quality, watermark, text, ugly',
    imagen_principal: '',
    posicion_imagen: 'center',
    vram_min: '8GB',
    vram_rec: '12GB',
    notas: 'Modelo SDXL premium. Requiere más VRAM pero produce resultados cinematográficos excepcionales.',
    estado: 'activo',
    favorito: false,
    version: '9.0',
    created: '2024-03-05 11:20:00',
    updated: '2024-03-05 11:20:00',
  },
  {
    id: 'llm-1',
    categoria: 'llm',
    nombre: 'Llama 3.1 70B Instruct',
    tipo: 'chat',
    framework: 'ollama',
    creador: 'Meta',
    version: '3.1',
    tamaño_parametros: '70B',
    cuantizacion: 'Q4_K_M',
    contexto_maximo: 128000,
    temperatura_default: 0.7,
    top_p: 0.9,
    top_k: 40,
    max_tokens: 4096,
    system_prompt_default: 'Eres un asistente útil, preciso y amigable.',
    tags: 'chat, instruct, meta, general, multilingüe',
    url_descarga: '',
    url_huggingface: 'https://huggingface.co/meta-llama/Meta-Llama-3.1-70B-Instruct',
    url_ollama: 'llama3.1:70b',
    vram_min: '24GB',
    vram_rec: '48GB',
    imagen_principal: '',
    notas: 'Modelo de chat de Meta. Excelente para tareas generales, código y razonamiento.',
    estado: 'activo',
    favorito: true,
    created: '2024-07-23 09:00:00',
    updated: '2024-07-23 09:00:00',
  },
  {
    id: 'vid-1',
    categoria: 'video',
    nombre: 'Stable Video Diffusion XT 1.1',
    tipo: 'image_to_video',
    framework: 'stable_video_diffusion',
    modelo_base: 'SD 1.5',
    fps_recomendado: 7,
    frames_totales: 25,
    resolucion: '1024x576',
    cfg_scale: 2.5,
    steps: 30,
    motion_bucket_id: 127,
    tags: 'svd, image_to_video, animación, stability',
    url_descarga: '',
    imagen_principal: '',
    notas: 'Genera videos cortos a partir de una imagen. Motion bucket 127 para movimiento moderado.',
    estado: 'activo',
    favorito: false,
    version: '1.1',
    created: '2024-02-20 12:00:00',
    updated: '2024-02-20 12:00:00',
  },
  // Nuevos modelos SD con ecosistemas
  {
    id: 'sd-3',
    categoria: 'sd',
    nombre: 'Flux.1 Dev',
    tipo: 'checkpoint',
    ecosistema: 'flux',
    modelo_base: 'Flux',
    modelo_vae: '',
    upscaler: '',
    sampler: 'Euler',
    steps: 20,
    cfg_scale: 3.5,
    clip_skip: 1,
    tags: 'flux, black forest labs, alta calidad',
    galeria_urls: '',
    url_civitai: '',
    url_huggingface: 'https://huggingface.co/black-forest-labs/FLUX.1-dev',
    prompt_referencia: '',
    prompt_negativo_default: '',
    imagen_principal: '',
    posicion_imagen: 'center',
    vram_min: '12GB',
    vram_rec: '24GB',
    notas: 'Modelo de Black Forest Labs. Excelente calidad con menor VRAM que SDXL.',
    estado: 'activo',
    favorito: true,
    version: '1.0',
    created: '2024-08-01 10:00:00',
    updated: '2024-08-01 10:00:00',
  },
  {
    id: 'sd-4',
    categoria: 'sd',
    nombre: 'Pony Diffusion V6 XL',
    tipo: 'checkpoint',
    ecosistema: 'pony',
    modelo_base: 'SDXL',
    modelo_vae: 'sdxl_vae',
    upscaler: '',
    sampler: 'DPM++ 2M Karras',
    steps: 25,
    cfg_scale: 7,
    clip_skip: 2,
    tags: 'pony, anime, ilustración, sdxl',
    galeria_urls: '',
    url_civitai: 'https://civitai.com/models/257749',
    url_huggingface: '',
    prompt_referencia: 'score_9, score_8_up, score_7_up, masterpiece, best quality',
    prompt_negativo_default: 'score_6_down, score_5_down, score_4_down, bad anatomy',
    imagen_principal: '',
    posicion_imagen: 'center',
    vram_min: '8GB',
    vram_rec: '12GB',
    notas: 'Especializado en estilos anime e ilustración. Requiere prompts con score tags.',
    estado: 'activo',
    favorito: false,
    version: '6.0',
    created: '2024-04-15 14:30:00',
    updated: '2024-04-15 14:30:00',
  },
  // Nuevos modelos LLM con especializaciones
  {
    id: 'llm-2',
    categoria: 'llm',
    nombre: 'DeepSeek-R1-Distill',
    tipo: 'reasoning',
    framework: 'ollama',
    creador: 'DeepSeek',
    version: '1.0',
    tamaño_parametros: '32B',
    cuantizacion: 'Q4_K_M',
    contexto_maximo: 65536,
    temperatura_default: 0.6,
    top_p: 0.95,
    top_k: 40,
    max_tokens: 8192,
    system_prompt_default: 'Piensa paso a paso antes de responder.',
    tags: 'razonamiento, matemáticas, lógica, deepseek',
    url_descarga: '',
    url_huggingface: 'https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
    url_ollama: 'deepseek-r1:32b',
    vram_min: '16GB',
    vram_rec: '24GB',
    imagen_principal: '',
    notas: 'Modelo de razonamiento avanzado. Excelente para problemas lógicos y matemáticos.',
    estado: 'activo',
    favorito: true,
    created: '2024-09-10 08:00:00',
    updated: '2024-09-10 08:00:00',
  },
  {
    id: 'llm-3',
    categoria: 'llm',
    nombre: 'Qwen2.5-Coder',
    tipo: 'code',
    framework: 'ollama',
    creador: 'Alibaba Cloud',
    version: '2.5',
    tamaño_parametros: '32B',
    cuantizacion: 'Q5_K_M',
    contexto_maximo: 32768,
    temperatura_default: 0.2,
    top_p: 0.9,
    top_k: 30,
    max_tokens: 4096,
    system_prompt_default: 'Eres un experto programador. Genera código limpio y eficiente.',
    tags: 'código, programación, qwen, desarrollo',
    url_descarga: '',
    url_huggingface: 'https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct',
    url_ollama: 'qwen2.5-coder:32b',
    vram_min: '16GB',
    vram_rec: '24GB',
    imagen_principal: '',
    notas: 'Especializado en código. Supera a GPT-4 en benchmarks de programación.',
    estado: 'activo',
    favorito: false,
    created: '2024-10-05 11:00:00',
    updated: '2024-10-05 11:00:00',
  },
  {
    id: 'llm-4',
    categoria: 'llm',
    nombre: 'Phi-4 Mini',
    tipo: 'lightweight',
    framework: 'ollama',
    creador: 'Microsoft',
    version: '4',
    tamaño_parametros: '3.8B',
    cuantizacion: 'Q6_K',
    contexto_maximo: 16384,
    temperatura_default: 0.7,
    top_p: 0.9,
    top_k: 40,
    max_tokens: 2048,
    system_prompt_default: 'Eres un asistente útil y conciso.',
    tags: 'ligero, eficiente, móvil, phi, microsoft',
    url_descarga: '',
    url_huggingface: 'https://huggingface.co/microsoft/Phi-4-mini-instruct',
    url_ollama: 'phi4-mini',
    vram_min: '2GB',
    vram_rec: '4GB',
    imagen_principal: '',
    notas: 'Modelo ultraligero de Microsoft. Ideal para dispositivos con recursos limitados.',
    estado: 'activo',
    favorito: false,
    created: '2024-11-20 09:00:00',
    updated: '2024-11-20 09:00:00',
  },
  // Nuevos modelos Video con arquitecturas
  {
    id: 'vid-2',
    categoria: 'video',
    nombre: 'Wan 2.1',
    tipo: 'text_to_video',
    framework: 'wan',
    modelo_base: 'Wan',
    fps_recomendado: 16,
    frames_totales: 81,
    resolucion: '832x480',
    cfg_scale: 5,
    steps: 30,
    motion_bucket_id: 0,
    tags: 'wan, text_to_video, alibaba, alta calidad',
    url_descarga: '',
    imagen_principal: '',
    notas: 'Modelo de Alibaba para generación de video de alta calidad desde texto.',
    estado: 'activo',
    favorito: true,
    version: '2.1',
    created: '2024-12-01 10:00:00',
    updated: '2024-12-01 10:00:00',
  },
  // Modelos Audio
  {
    id: 'audio-1',
    categoria: 'audio',
    nombre: 'Kokoro-82M',
    tipo: 'tts',
    framework: 'kokoro',
    creador: 'Hexgrad',
    tamaño_parametros: '82M',
    idiomas: 'en, es, fr, de, ja, zh',
    calidad_audio: '24kHz',
    latencia: 'ultra-baja',
    modo_ejecucion: 'local',
    tiempo_real: true,
    formato_entrada: 'texto',
    formato_salida: 'wav',
    caracteristicas: 'multilingüe, alta calidad, CPU-friendly',
    licencia: 'Apache 2.0',
    vram_min: 'CPU-only',
    url_descarga: '',
    url_github: 'https://github.com/hexgrad/kokoro',
    url_demo: '',
    tags: 'tts, rápido, ligero, multilingüe, cpu',
    notas: 'El rey de la eficiencia. Solo 82M parámetros, corre en CPU con calidad comercial.',
    imagen_principal: '',
    estado: 'activo',
    favorito: true,
    version: '1.0',
    created: '2024-11-15 10:00:00',
    updated: '2024-11-15 10:00:00',
  },
  {
    id: 'audio-2',
    categoria: 'audio',
    nombre: 'OpenAI Whisper',
    tipo: 'asr',
    framework: 'whisper',
    creador: 'OpenAI',
    tamaño_parametros: '1.5B',
    idiomas: '99 idiomas',
    calidad_audio: '16kHz (entrada)',
    latencia: 'media',
    modo_ejecucion: 'local',
    tiempo_real: false,
    formato_entrada: 'audio',
    formato_salida: 'texto',
    caracteristicas: 'transcripción, traducción, timestamps',
    licencia: 'MIT',
    vram_min: '4GB',
    url_descarga: '',
    url_github: 'https://github.com/openai/whisper',
    url_demo: '',
    tags: 'asr, transcripción, traducción, multilingüe, openai',
    notas: 'Estándar de la industria para transcripción local. Precisión milimétrica.',
    imagen_principal: '',
    estado: 'activo',
    favorito: true,
    version: 'large-v3',
    created: '2024-01-10 08:00:00',
    updated: '2024-01-10 08:00:00',
  },
  {
    id: 'audio-3',
    categoria: 'audio',
    nombre: 'AudioCraft MusicGen',
    tipo: 'music_generation',
    framework: 'audiocraft',
    creador: 'Meta',
    tamaño_parametros: '3.3B',
    idiomas: 'N/A',
    calidad_audio: '32kHz',
    latencia: 'media',
    modo_ejecucion: 'local',
    tiempo_real: false,
    formato_entrada: 'texto',
    formato_salida: 'wav',
    caracteristicas: 'composición musical, text-to-music',
    licencia: 'MIT',
    vram_min: '8GB',
    url_descarga: '',
    url_github: 'https://github.com/facebookresearch/audiocraft',
    url_demo: '',
    tags: 'música, generación, meta, audiocraft, musicgen',
    notas: 'Compone música a partir de descripciones de texto. Incluye MusicGen y AudioGen.',
    imagen_principal: '',
    estado: 'activo',
    favorito: false,
    version: '1.0',
    created: '2024-06-20 14:00:00',
    updated: '2024-06-20 14:00:00',
  },
  {
    id: 'audio-4',
    categoria: 'audio',
    nombre: 'Fish Speech',
    tipo: 'voice_cloning',
    framework: 'fish_speech',
    creador: 'Fish Audio',
    tamaño_parametros: '1.5B',
    idiomas: 'en, es, zh, ja, ko',
    calidad_audio: '44kHz',
    latencia: 'baja',
    modo_ejecucion: 'local',
    tiempo_real: true,
    formato_entrada: 'texto + audio_referencia',
    formato_salida: 'wav',
    caracteristicas: 'clonación de voz, multilingüe, prosodia',
    licencia: 'Apache 2.0',
    vram_min: '6GB',
    url_descarga: '',
    url_github: 'https://github.com/fishaudio/fish-speech',
    url_demo: '',
    tags: 'clonación, voz, multilingüe, fish, prosodia',
    notas: 'Suite potente para clonación de voz multilingüe con alta fidelidad.',
    imagen_principal: '',
    estado: 'activo',
    favorito: false,
    version: '1.5',
    created: '2024-10-10 11:00:00',
    updated: '2024-10-10 11:00:00',
  },
  // Complementos ComfyUI
  {
    id: 'comp-1',
    categoria: 'complemento',
    nombre: 'ComfyUI Manager',
    tipo: 'utilidad',
    subcategoria: 'manager',
    autor: 'ltdrdata',
    version: 'latest',
    nodos_incluidos: 0,
    compatibilidad: 'ComfyUI',
    requiere_gpu: 'cualquiera',
    descripcion: 'Gestor de paquetes fundamental para ComfyUI',
    funcionalidades: 'instalación, actualización, búsqueda de nodos',
    vram_requerida: 'N/A',
    url_github: 'https://github.com/ltdrdata/ComfyUI-Manager',
    url_documentacion: 'https://github.com/ltdrdata/ComfyUI-Manager#readme',
    tags: 'manager, paquetes, instalación, comfyui',
    notas: 'Imprescindible. Permite instalar y actualizar miles de nodos personalizados.',
    imagen_principal: '',
    estado: 'activo',
    favorito: true,
    created: '2024-01-05 09:00:00',
    updated: '2024-01-05 09:00:00',
  },
  {
    id: 'comp-2',
    categoria: 'complemento',
    nombre: 'Nvidia VFX Nodes',
    tipo: 'optimizacion',
    subcategoria: 'nodos',
    autor: 'Nvidia',
    version: '1.0',
    nodos_incluidos: 8,
    compatibilidad: 'ComfyUI, RTX GPUs',
    requiere_gpu: 'nvidia',
    descripcion: 'Super Resolution, denoise, deblur, frame interpolation para RTX',
    funcionalidades: 'super_resolution, denoise, deblur, frame_interpolation, sdr_to_hdr',
    vram_requerida: '8GB',
    url_github: 'https://github.com/NVIDIA/ComfyUI-VFX',
    url_documentacion: '',
    tags: 'nvidia, rtx, upscaling, interpolación, vfx',
    notas: 'Requiere GPU RTX. Escalado hasta 8192px con calidad excepcional.',
    imagen_principal: '',
    estado: 'activo',
    favorito: false,
    created: '2024-07-15 10:00:00',
    updated: '2024-07-15 10:00:00',
  },
  {
    id: 'comp-3',
    categoria: 'complemento',
    nombre: 'IPAdapter Plus',
    tipo: 'movimiento',
    subcategoria: 'nodos',
    autor: 'cubiq',
    version: 'latest',
    nodos_incluidos: 15,
    compatibilidad: 'ComfyUI, SD1.5, SDXL',
    requiere_gpu: 'cualquiera',
    descripcion: 'Inyección de imágenes de referencia para consistencia de estilo',
    funcionalidades: 'style_transfer, face_consistency, reference_image',
    vram_requerida: '4GB',
    url_github: 'https://github.com/cubiq/ComfyUI_IPAdapter_plus',
    url_documentacion: '',
    tags: 'ipadapter, referencia, estilo, consistencia, cubiq',
    notas: 'Permite mantener consistencia de personajes y estilos en secuencias de video.',
    imagen_principal: '',
    estado: 'activo',
    favorito: true,
    created: '2024-05-20 14:00:00',
    updated: '2024-05-20 14:00:00',
  },
];
