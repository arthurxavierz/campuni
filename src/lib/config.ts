/**
 * Endereço e chave PÚBLICA (anon) do Supabase do Campuni.
 *
 * A chave anon é feita para ir no navegador: tudo que ela pode fazer é
 * limitado pelas políticas de RLS (supabase/migrations/0003_rls.sql).
 * Ficar no código evita depender de variável no Netlify para o site
 * funcionar. Variáveis VITE_SUPABASE_* continuam tendo prioridade, para
 * apontar outro projeto (outro cliente, ambiente de teste).
 *
 * A service_role NUNCA entra aqui.
 */
export const SUPABASE_URL = 'https://ppbblwxiacuvnfgkumfp.supabase.co';
export const SUPABASE_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwYmJsd3hpYWN1dm5mZ2t1bWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1Mzc1ODksImV4cCI6MjEwODExMzU4OX0._3Td7SYVAMOmQDGLTD8Hrjz4gf04sJep3QAWRQhVj1o';
