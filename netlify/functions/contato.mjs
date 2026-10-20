/**
 * POST /api/contato
 *
 * Recebe os três formulários públicos (contato, denúncia e novidades) e
 * grava na tabela `contatos` com a service_role. O visitante não tem
 * permissão de escrita nessa tabela: esta função é o único caminho.
 *
 * Camadas de defesa, na ordem em que agem:
 *   1. honeypot      -> o campo "empresa" é invisível; robô preenche, pessoa não
 *   2. limite por IP -> 5 envios por minuto por instância
 *   3. validação     -> tamanhos, e-mail, telefone, tipo conhecido
 *   4. Cloudflare    -> regra de rate limit na zona protege contra rajada distribuída
 *
 * Sem SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY, responde como simulado:
 * o protótipo funciona inteiro sem banco.
 */

const LIMITE_JANELA_MS = 60_000;
const LIMITE_ENVIOS = 5;
const contador = new Map();
const TIPOS = new Set(['contato', 'denuncia', 'novidades']);

function resposta(status, corpo) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function excedeu(ip) {
  const agora = Date.now();
  const atual = contador.get(ip);
  if (!atual || atual.expira < agora) {
    contador.set(ip, { total: 1, expira: agora + LIMITE_JANELA_MS });
    return false;
  }
  atual.total += 1;
  return atual.total > LIMITE_ENVIOS;
}

const texto = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : null) || null;

export default async (req, context) => {
  if (req.method !== 'POST') return resposta(405, { erro: 'Método não permitido.' });

  let d;
  try {
    d = await req.json();
  } catch {
    return resposta(400, { erro: 'Envio inválido.' });
  }

  // Robô preencheu o campo invisível: finge sucesso e descarta.
  if (d.empresa) return resposta(200, { ok: true });

  const ip = context?.ip ?? req.headers.get('x-nf-client-connection-ip') ?? 'desconhecido';
  if (excedeu(ip)) return resposta(429, { erro: 'Muitos envios seguidos. Aguarde um minuto.' });

  if (!TIPOS.has(d.tipo)) return resposta(400, { erro: 'Tipo de formulário desconhecido.' });
  if (d.consentimento !== true) return resposta(400, { erro: 'Falta a autorização para usar os dados.' });

  const email = texto(d.email, 160);
  const whatsapp = texto(d.whatsapp, 20)?.replace(/\D/g, '') || null;
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return resposta(400, { erro: 'Confira o e-mail.' });
  if (d.tipo === 'novidades' && !email) return resposta(400, { erro: 'Informe o e-mail.' });
  if (d.tipo === 'contato' && !email && !whatsapp) return resposta(400, { erro: 'Deixe um e-mail ou WhatsApp para a resposta.' });
  if (d.tipo === 'denuncia' && !d.publicacaoId) return resposta(400, { erro: 'Publicação não informada.' });

  const linha = {
    tipo: d.tipo,
    nome: texto(d.nome, 120),
    email,
    whatsapp,
    assunto: texto(d.assunto, 120),
    mensagem: texto(d.mensagem, 4000),
    publicacao_id: /^[0-9a-f-]{36}$/i.test(d.publicacaoId ?? '') ? d.publicacaoId : null,
    pagina_origem: texto(d.pagina, 300),
    consentimento: true,
  };

  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) return resposta(200, { ok: true, simulado: true });

  const r = await fetch(`${url}/rest/v1/contatos`, {
    method: 'POST',
    headers: {
      apikey: chave,
      authorization: `Bearer ${chave}`,
      'content-type': 'application/json',
      prefer: 'return=minimal',
    },
    body: JSON.stringify(linha),
  });

  if (!r.ok) {
    console.error('contato: falha ao gravar', r.status, await r.text());
    return resposta(502, { erro: 'Não foi possível enviar agora. Tente pelo WhatsApp.' });
  }
  return resposta(200, { ok: true });
};
