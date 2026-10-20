/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_WHATSAPP?: string;
  readonly VITE_EMAIL?: string;
  readonly VITE_INSTAGRAM?: string;
  readonly VITE_VIDEO_URL?: string;
  readonly VITE_ROTEADOR?: 'memoria';
}
