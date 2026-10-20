# Publicar o Campuni

Três peças, cada uma com um papel:

| Peça | Papel |
| --- | --- |
| **Netlify** | Faz o build a cada push e serve o site e a função `/api/contato`. |
| **Cloudflare** | Zona DNS de `achillesmedia.com.br`: aponta `campuni` para o Netlify. |
| **Supabase** | Banco, login (Google e código por e-mail) e fotos. Opcional no protótipo. |

Sem Supabase o site sobe em modo demonstração, que é o suficiente para
apresentar.

---

## 1. Netlify

1. **Add new site → Import an existing project → GitHub** e escolha
   `arthurxavierz/campuni`.
2. Os campos vêm do `netlify.toml`. Deixe **Base directory** e
   **Publish directory** vazios na interface: o arquivo já declara
   `npm run build` e `dist`.
3. **Deploy.** O primeiro build leva cerca de um minuto.
4. Em **Site configuration → General → Site name**, troque o nome para
   `campuni-achilles` (vira `campuni-achilles.netlify.app`).

A cada `git push` na `main`, o Netlify publica sozinho.

## 2. Cloudflare (domínio)

O domínio `achillesmedia.com.br` já é uma zona ativa no Cloudflare.

1. No Netlify: **Domain management → Add a domain** →
   `campuni.achillesmedia.com.br`. Ele vai pedir para verificar o DNS.
2. No Cloudflare: **achillesmedia.com.br → DNS → Records → Add record**:

   | Tipo | Nome | Destino | Proxy |
   | --- | --- | --- | --- |
   | `CNAME` | `campuni` | `campuni-achilles.netlify.app` | **Somente DNS** (nuvem cinza) |

3. Volte ao Netlify e clique em **Verify DNS**. O certificado HTTPS sai em
   alguns minutos (Let's Encrypt, emitido pelo Netlify).

> **Por que nuvem cinza:** com o proxy laranja ligado, o Netlify não
> consegue emitir o certificado e o CDN dele fica atrás de outro CDN.
> Se quiser o proxy do Cloudflare depois (regras de firewall, rate limit
> na `/api/contato`), ligue **só depois** do certificado emitido e ponha
> **SSL/TLS → Full (strict)** na zona.

> No pedido veio escrito `aquilesmid.com.br`. Assumi `achillesmedia.com.br`,
> o domínio dos outros sistemas (`imoveis.`, `agropecuaria.`). Se for
> outra zona, só troque o nome no registro acima e no `VITE_SITE_URL`.

## 3. Supabase (quando sair da demonstração)

1. Crie o projeto em **supabase.com** (região São Paulo).
2. No **SQL Editor**, rode **um arquivo por vez, na ordem**:

   ```
   supabase/migrations/0001_estrutura.sql   tabelas e as 16 categorias
   supabase/migrations/0002_funcoes.sql     gatilhos, renovação e a view "vitrine"
   supabase/migrations/0003_rls.sql         permissões (o mais importante)
   supabase/migrations/0004_storage.sql     bucket público de fotos
   ```

   Um por vez: o SQL Editor roda tudo numa transação, e se o terceiro de
   quatro colados juntos falhar, fica difícil saber onde o banco parou.
   **Não pule o 0003.**

3. **Authentication → Providers**:
   - **Email**: ligado, com *Email OTP* (código de 6 dígitos). Em
     **Email Templates → Magic Link**, troque o corpo para mostrar
     `{{ .Token }}` em vez do link.
   - **Google**: ligue e cole o Client ID e o Secret do Google Cloud.
4. **Authentication → URL Configuration**: *Site URL* =
   `https://campuni.achillesmedia.com.br` e, em *Redirect URLs*, a mesma
   URL com `/**`.
5. Promova o primeiro administrador com o comando no fim do `0004`.

## 4. Variáveis no Netlify

**Site configuration → Environment variables**. As `VITE_*` entram no
build: cadastre e depois **refaça o deploy**.

| Variável | Valor | Obrigatória |
| --- | --- | --- |
| `VITE_SITE_URL` | `https://campuni.achillesmedia.com.br` | sim |
| `VITE_WHATSAPP` | WhatsApp oficial, só números com 55 | sim |
| `VITE_EMAIL` | e-mail oficial | sim |
| `VITE_INSTAGRAM` | URL do Instagram | não |
| `VITE_VIDEO_URL` | link do YouTube ou .mp4 do vídeo explicativo | não |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | do projeto | para sair da demo |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | do projeto | para gravar contatos |

A `SUPABASE_SERVICE_ROLE_KEY` **nunca** pode ter o prefixo `VITE_`: ela
ignora todas as permissões do banco e iria para o navegador de quem abre o site.

## Conferir depois de publicar

- [ ] `https://campuni.achillesmedia.com.br` abre com cadeado.
- [ ] `/publicacoes/qualquer-coisa` mostra "não está mais no ar" (as rotas do app funcionam).
- [ ] Formulário de contato responde "Mensagem enviada".
- [ ] No celular, a barra inferior aparece e o botão Publicar abre o fluxo.
