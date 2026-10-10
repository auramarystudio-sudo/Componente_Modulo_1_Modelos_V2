// Datos de demostración para cuando PocketBase no está disponible
export interface ModeloSD {
  id: string;
  nombre: string;
  tipo: 'checkpoint' | 'lora' | 'vae';
  modelo_base: string;
  modelo_vae: string;
  upscaler: string;
  sampler: string;
  steps: number;
  cfg_scale: number;
  tags: string;
  galeria_urls: string;
  url_civitai: string;
  prompt_referencia: string;
  prompt_negativo_default: string;
  imagen_principal: string;
  created: string;
  updated: string;
}

export const demoModelos: ModeloSD[] = [
  {
    id: 'demo-1',
    nombre: 'Realistic Vision V6.0',
    tipo: 'checkpoint',
    modelo_base: 'SD 1.5',
    modelo_vae: 'vae-ft-mse-840000',
    upscaler: '4x-UltraSharp',
    sampler: 'DPM++ 2M Karras',
    steps: 30,
    cfg_scale: 7,
    tags: 'realista, fotografía, retratos',
    galeria_urls: '',
    url_civitai: 'https://civitai.com/models/4201',
    prompt_referencia: 'masterpiece, best quality, photorealistic, 8k uhd, high resolution',
    prompt_negativo_default: 'bad anatomy, bad hands, blurry, low quality, watermark',
    imagen_principal: '',
    created: '2024-01-15 10:30:00',
    updated: '2024-01-15 10:30:00',
  },
  {
    id: 'demo-2',
    nombre: 'DreamShaper V8',
    tipo: 'checkpoint',
    modelo_base: 'SD 1.5',
    modelo_vae: '',
    upscaler: '',
    sampler: 'Euler a',
    steps: 25,
    cfg_scale: 7.5,
    tags: 'arte digital, fantasía, ilustración',
    galeria_urls: '',
    url_civitai: 'https://civitai.com/models/4384',
    prompt_referencia: 'masterpiece, best quality, digital art, fantasy illustration',
    prompt_negativo_default: 'ugly, blurry, low quality, deformed',
    imagen_principal: '',
    created: '2024-01-20 14:00:00',
    updated: '2024-01-20 14:00:00',
  },
  {
    id: 'demo-3',
    nombre: 'Detail Tweaker LoRA',
    tipo: 'lora',
    modelo_base: 'SD 1.5',
    modelo_vae: '',
    upscaler: '',
    sampler: 'DPM++ 2M Karras',
    steps: 28,
    cfg_scale: 6,
    tags: 'detalle, nitidez, refinamiento',
    galeria_urls: '',
    url_civitai: 'https://civitai.com/models/122359',
    prompt_referencia: '',
    prompt_negativo_default: '',
    imagen_principal: '',
    created: '2024-02-01 09:15:00',
    updated: '2024-02-01 09:15:00',
  },
  {
    id: 'demo-4',
    nombre: 'SDXL VAE FP16 Fix',
    tipo: 'vae',
    modelo_base: 'SDXL 1.0',
    modelo_vae: '',
    upscaler: '',
    sampler: '',
    steps: 0,
    cfg_scale: 0,
    tags: 'vae, corrección, sdxl',
    galeria_urls: '',
    url_civitai: '',
    prompt_referencia: '',
    prompt_negativo_default: '',
    imagen_principal: '',
    created: '2024-02-10 16:45:00',
    updated: '2024-02-10 16:45:00',
  },
  {
    id: 'demo-5',
    nombre: 'Juggernaut XL V9',
    tipo: 'checkpoint',
    modelo_base: 'SDXL 1.0',
    modelo_vae: 'sdxl_vae',
    upscaler: '4x-NMKD-Siax',
    sampler: 'DPM++ 2M SDE Karras',
    steps: 35,
    cfg_scale: 6.5,
    tags: 'cinemático, realista, sdxl, alta calidad',
    galeria_urls: '',
    url_civitai: 'https://civitai.com/models/133005',
    prompt_referencia: 'cinematic lighting, dramatic shadows, 8k, ultra detailed, masterpiece',
    prompt_negativo_default: 'cartoon, anime, painting, blurry, low quality, watermark, text',
    imagen_principal: '',
    created: '2024-03-05 11:20:00',
    updated: '2024-03-05 11:20:00',
  },
  {
    id: 'demo-6',
    nombre: 'Add Detail LoRA',
    tipo: 'lora',
    modelo_base: 'SDXL 1.0',
    modelo_vae: '',
    upscaler: '',
    sampler: 'DPM++ 2M Karras',
    steps: 30,
    cfg_scale: 7,
    tags: 'detalle, textura, sdxl, refinamiento',
    galeria_urls: '',
    url_civitai: 'https://civitai.com/models/122359',
    prompt_referencia: '',
    prompt_negativo_default: '',
    imagen_principal: '',
    created: '2024-03-12 08:30:00',
    updated: '2024-03-12 08:30:00',
  },
];
