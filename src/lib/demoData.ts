// Tipos e interfaces para los 3 tipos de modelos
// SD = Stable Diffusion, LLM = Large Language Models, Video = Video Generation

export interface ModeloSD {
  id: string;
  categoria: 'sd';
  nombre: string;
  tipo: 'checkpoint' | 'lora' | 'vae' | 'upscaler' | 'controlnet' | 'embedding';
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
  posicion_imagen: string; // 'top', 'center', 'bottom', 'left', 'right', etc.
  vram_min: string;
  vram_rec: string;
  notas: string;
  estado: 'activo' | 'archivado' | 'pendiente';
  created: string;
  updated: string;
}

export interface ModeloLLM {
  id: string;
  categoria: 'llm';
  nombre: string;
  tipo: 'chat' | 'completion' | 'embedding' | 'vision' | 'code';
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
  created: string;
  updated: string;
}

export interface ModeloVideo {
  id: string;
  categoria: 'video';
  nombre: string;
  tipo: 'text_to_video' | 'image_to_video' | 'video_to_video' | 'animation';
  framework: 'stable_video_diffusion' | 'animatediff' | 'deforum' | 'other';
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
  created: string;
  updated: string;
}

export type Modelo = ModeloSD | ModeloLLM | ModeloVideo;
export type CategoriaModelo = 'sd' | 'llm' | 'video';

// Datos demo SD
const demoSD: ModeloSD[] = [
  {
    id: 'sd-1',
    categoria: 'sd',
    nombre: 'Realistic Vision V6.0',
    tipo: 'checkpoint',
    modelo_base: 'SD 1.5',
    modelo_vae: 'vae-ft-mse-840000',
    upscaler: '4x-UltraSharp',
    sampler: 'DPM++ 2M Karras',
    steps: 30,
    cfg_scale: 7,
    clip_skip: 1,
    tags: 'realista, fotografía, retratos, 8k',
    galeria_urls: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=512\nhttps://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=512\nhttps://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=512\nhttps://images.unsplash.com/photo-1517841905240-472988babdf9?w=512\nhttps://images.unsplash.com/photo-1534528741775-53994a69daeb?w=512\nhttps://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=512',
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
    created: '2024-01-15 10:30:00',
    updated: '2024-01-15 10:30:00',
  },
  {
    id: 'sd-2',
    categoria: 'sd',
    nombre: 'Juggernaut XL V9',
    tipo: 'checkpoint',
    modelo_base: 'SDXL 1.0',
    modelo_vae: 'sdxl_vae',
    upscaler: '4x-NMKD-Siax',
    sampler: 'DPM++ 2M SDE Karras',
    steps: 35,
    cfg_scale: 6.5,
    clip_skip: 2,
    tags: 'cinemático, realista, sdxl, alta calidad, dramático',
    galeria_urls: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=512\nhttps://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=512\nhttps://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=512\nhttps://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=512',
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
    created: '2024-03-05 11:20:00',
    updated: '2024-03-05 11:20:00',
  },
  {
    id: 'sd-3',
    categoria: 'sd',
    nombre: 'Detail Tweaker LoRA',
    tipo: 'lora',
    modelo_base: 'SD 1.5',
    modelo_vae: '',
    upscaler: '',
    sampler: 'DPM++ 2M Karras',
    steps: 28,
    cfg_scale: 6,
    clip_skip: 1,
    tags: 'detalle, nitidez, refinamiento, textura',
    galeria_urls: '',
    url_civitai: 'https://civitai.com/models/122359',
    url_huggingface: '',
    prompt_referencia: '',
    prompt_negativo_default: '',
    imagen_principal: '',
    posicion_imagen: 'center',
    vram_min: '4GB',
    vram_rec: '6GB',
    notas: 'LoRA para añadir detalle extra. Peso recomendado: 0.5-0.8',
    estado: 'activo',
    created: '2024-02-01 09:15:00',
    updated: '2024-02-01 09:15:00',
  },
  {
    id: 'sd-4',
    categoria: 'sd',
    nombre: 'SDXL VAE FP16 Fix',
    tipo: 'vae',
    modelo_base: 'SDXL 1.0',
    modelo_vae: '',
    upscaler: '',
    sampler: '',
    steps: 0,
    cfg_scale: 0,
    clip_skip: 0,
    tags: 'vae, corrección, sdxl, fp16',
    galeria_urls: '',
    url_civitai: '',
    url_huggingface: '',
    prompt_referencia: '',
    prompt_negativo_default: '',
    imagen_principal: '',
    posicion_imagen: 'center',
    vram_min: '8GB',
    vram_rec: '12GB',
    notas: 'Corrige el problema de colores apagados en SDXL con FP16.',
    estado: 'activo',
    created: '2024-02-10 16:45:00',
    updated: '2024-02-10 16:45:00',
  },
  {
    id: 'sd-5',
    categoria: 'sd',
    nombre: '4x-UltraSharp',
    tipo: 'upscaler',
    modelo_base: 'Universal',
    modelo_vae: '',
    upscaler: '',
    sampler: '',
    steps: 0,
    cfg_scale: 0,
    clip_skip: 0,
    tags: 'upscaler, 4x, nitidez, universal',
    galeria_urls: '',
    url_civitai: '',
    url_huggingface: '',
    prompt_referencia: '',
    prompt_negativo_default: '',
    imagen_principal: '',
    posicion_imagen: 'center',
    vram_min: '4GB',
    vram_rec: '8GB',
    notas: 'Upscaler universal 4x. Excelente para fotos y arte digital.',
    estado: 'activo',
    created: '2024-01-20 14:00:00',
    updated: '2024-01-20 14:00:00',
  },
];

// Datos demo LLM
const demoLLM: ModeloLLM[] = [
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
    created: '2024-07-23 09:00:00',
    updated: '2024-07-23 09:00:00',
  },
  {
    id: 'llm-2',
    categoria: 'llm',
    nombre: 'Mistral 7B v0.3',
    tipo: 'chat',
    framework: 'ollama',
    creador: 'Mistral AI',
    version: '0.3',
    tamaño_parametros: '7B',
    cuantizacion: 'Q5_K_M',
    contexto_maximo: 32768,
    temperatura_default: 0.7,
    top_p: 0.95,
    top_k: 40,
    max_tokens: 2048,
    system_prompt_default: 'Eres Mistral, un asistente de IA creado por Mistral AI.',
    tags: 'chat, rápido, eficiente, código, europeo',
    url_descarga: '',
    url_huggingface: 'https://huggingface.co/mistralai/Mistral-7B-v0.3',
    url_ollama: 'mistral:7b',
    vram_min: '6GB',
    vram_rec: '8GB',
    imagen_principal: '',
    notas: 'Modelo compacto y eficiente. Ideal para hardware limitado con buen rendimiento.',
    estado: 'activo',
    created: '2024-06-15 14:30:00',
    updated: '2024-06-15 14:30:00',
  },
  {
    id: 'llm-3',
    categoria: 'llm',
    nombre: 'DeepSeek Coder V2',
    tipo: 'code',
    framework: 'ollama',
    creador: 'DeepSeek',
    version: '2',
    tamaño_parametros: '236B (MoE)',
    cuantizacion: 'Q3_K_M',
    contexto_maximo: 65536,
    temperatura_default: 0.2,
    top_p: 0.9,
    top_k: 30,
    max_tokens: 8192,
    system_prompt_default: 'Eres un experto programador. Genera código limpio, eficiente y bien documentado.',
    tags: 'código, programación, moe, deepseek, desarrollo',
    url_descarga: '',
    url_huggingface: 'https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2',
    url_ollama: 'deepseek-coder-v2',
    vram_min: '24GB',
    vram_rec: '48GB',
    imagen_principal: '',
    notas: 'Modelo especializado en código con arquitectura MoE. Supera a GPT-4 en benchmarks de programación.',
    estado: 'activo',
    created: '2024-06-28 10:00:00',
    updated: '2024-06-28 10:00:00',
  },
  {
    id: 'llm-4',
    categoria: 'llm',
    nombre: 'nomic-embed-text',
    tipo: 'embedding',
    framework: 'ollama',
    creador: 'Nomic AI',
    version: '1.5',
    tamaño_parametros: '137M',
    cuantizacion: 'FP16',
    contexto_maximo: 8192,
    temperatura_default: 0,
    top_p: 1,
    top_k: 0,
    max_tokens: 0,
    system_prompt_default: '',
    tags: 'embedding, búsqueda, RAG, vectores, semántico',
    url_descarga: '',
    url_huggingface: 'https://huggingface.co/nomic-ai/nomic-embed-text-v1.5',
    url_ollama: 'nomic-embed-text',
    vram_min: '1GB',
    vram_rec: '2GB',
    imagen_principal: '',
    notas: 'Modelo de embeddings ligero. Ideal para RAG y búsqueda semántica local.',
    estado: 'activo',
    created: '2024-04-10 08:00:00',
    updated: '2024-04-10 08:00:00',
  },
];

// Datos demo Video
const demoVideo: ModeloVideo[] = [
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
    created: '2024-02-20 12:00:00',
    updated: '2024-02-20 12:00:00',
  },
  {
    id: 'vid-2',
    categoria: 'video',
    nombre: 'AnimateDiff v3',
    tipo: 'animation',
    framework: 'animatediff',
    modelo_base: 'SD 1.5',
    fps_recomendado: 8,
    frames_totales: 16,
    resolucion: '512x512',
    cfg_scale: 7.5,
    steps: 25,
    motion_bucket_id: 0,
    tags: 'animatediff, animación, sd1.5, motion',
    url_descarga: '',
    imagen_principal: '',
    notas: 'Módulo de movimiento para SD 1.5. Compatible con cualquier checkpoint.',
    estado: 'activo',
    created: '2024-03-15 09:30:00',
    updated: '2024-03-15 09:30:00',
  },
  {
    id: 'vid-3',
    categoria: 'video',
    nombre: 'Deforum Stable',
    tipo: 'text_to_video',
    framework: 'deforum',
    modelo_base: 'SD 1.5',
    fps_recomendado: 15,
    frames_totales: 120,
    resolucion: '768x512',
    cfg_scale: 7,
    steps: 30,
    motion_bucket_id: 0,
    tags: 'deforum, text_to_video, zoom, morphing',
    url_descarga: '',
    imagen_principal: '',
    notas: 'Genera videos largos con transformaciones. Ideal para zooms infinitos y morphing.',
    estado: 'activo',
    created: '2024-01-10 16:00:00',
    updated: '2024-01-10 16:00:00',
  },
];

export const demoModelos: Modelo[] = [...demoSD, ...demoLLM, ...demoVideo];

// Subtipos por categoría para filtros
export const subtiposSD = ['checkpoint', 'lora', 'vae', 'upscaler', 'controlnet', 'embedding'] as const;
export const subtiposLLM = ['chat', 'completion', 'embedding', 'vision', 'code'] as const;
export const subtiposVideo = ['text_to_video', 'image_to_video', 'video_to_video', 'animation'] as const;
