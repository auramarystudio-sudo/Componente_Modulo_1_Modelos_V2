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
  posicion_imagen: string;
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

// Datos demo
export const demoModelos: Modelo[] = [
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
    created: '2024-02-20 12:00:00',
    updated: '2024-02-20 12:00:00',
  },
];
