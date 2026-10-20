# Campuni · redesign

Protótipo do novo **Campuni**, o marketplace de ofertas e demandas do agro:
quem oferece e quem procura, por categoria, região e validade, com a
conversa indo direto para o WhatsApp.

Demonstração: **campuni.achillesmedia.com.br**. Construído sobre o mesmo
padrão dos outros sistemas Achilles: Vite + React no Netlify, domínio no
Cloudflare e banco Supabase.

---

## O que muda em relação ao site atual

| No site atual | Neste protótipo |
| --- | --- |
| Foto em pé (flyer 512×640) cortada numa faixa horizontal no card. | Card retrato 4:5. Se a foto não encaixa, ela aparece **inteira** sobre um fundo desfocado dela mesma. Nunca corta, nunca estica. |
| Foto sobe do jeito que saiu do celular. | A foto é corrigida e comprimida **no aparelho** antes de subir: orientação certa, 1080×1350, WebP, tipicamente 90% mais leve. |
| Card sem preço, unidade ou validade. | Preço com a unidade do agro (@, saca 60 kg, hectare, diária), barra de validade que fica dourada perto de vencer, quantidade. |
| Clicar em Publicar cai direto no login. | A pessoa monta o anúncio inteiro, vê a prévia do card, e só **no fim** confirma o e-mail. Rascunho salvo a cada tecla. |
| Filtros numa coluna longa de selects. | Tipo em controle segmentado, categorias em trilho de chips, o resto numa gaveta. Tudo na URL: o link copiado abre a mesma busca. |
| Detalhe com uma foto. | Galeria com arraste, miniaturas, ficha, vendedor, WhatsApp fixo no celular, denúncia e "oportunidades parecidas". |
| Rodapé de uma linha. | Rodapé completo: chamada de novidades (LGPD), categorias e cidades como portas de SEO, colunas de navegação, contato, privacidade, termos e autoria. |
| Sem páginas institucionais. | **Sobre**, **Como funciona** (com abas por jornada, dicas, negociação segura e perguntas), **Contato** (canais + formulário) e **vídeo explicativo**. |

Movimento: abertura com o símbolo sendo "plantado" (uma vez por sessão),
lavoura animada no hero, título entrando palavra por palavra, ondulação
no toque, coração que estoura ao salvar, transições de tela nativas do
navegador e confete de folhas ao publicar. Tudo respeita a preferência
de "reduzir movimento" do sistema.

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173
```

Sem variáveis, abre em **modo demonstração**: as seis publicações que
estavam no ar no Campuni em 20/10/2026 (com ilustrações no lugar das
fotos, que são de quem anunciou) e alguns exemplos marcados como tal. O
que o visitante publica fica só no navegador dele.

## Como está organizado

```
src/
├── paginas/          Explorar (início, em alta, destaque, salvos), Publicação,
│                     Publicar, Como funciona, Sobre, Contato, Privacidade/Termos
├── componentes/      Cabeçalho, Rodapé, Cartão, Mídia, Gaveta, Vídeo, Lavoura…
├── lib/
│   ├── site.ts       Contato, redes, textos institucionais. Fonte única.
│   ├── dados.ts      Demonstração ou Supabase atrás da mesma interface.
│   ├── imagem.ts     Preparo das fotos no aparelho.
│   └── categorias.ts As 16 categorias e as unidades do agro.
├── demo/             Publicações e ilustrações da demonstração.
└── estilos/app.css   Tokens (claro e escuro) e todos os estilos.
netlify/functions/    contato.mjs: contato, denúncia e novidades.
supabase/migrations/  Banco, em ordem.
```

## Decisões técnicas

- **Leve de propósito.** Sem framework de CSS, sem biblioteca de animação.
  O Supabase só é baixado quando há banco configurado (import dinâmico);
  na demonstração ele nem entra no build.
- **Foto tratada antes de subir.** Menos banda para quem publica do
  celular no campo, menos armazenamento, e nenhuma foto quebrada na vitrine.
- **Autoria pelo banco.** `autor_id` vem do `auth.uid()`; contadores,
  destaque e papel são protegidos por gatilho contra alteração pelo navegador.
- **Formulário público sem permissão de escrita.** Contato e denúncia
  passam pela função do Netlify com a service_role, com honeypot e limite por IP.
- **Endereço do anúncio preservado.** `/publicacoes/:id`, igual ao site atual:
  links já compartilhados continuam funcionando.

## Publicar

Passo a passo de Netlify, Cloudflare e Supabase em [`DEPLOY.md`](DEPLOY.md).
O que precisa ser confirmado com o Campuni antes de ir ao ar está em
[`DADOS-CAMPUNI.md`](DADOS-CAMPUNI.md).

## Stack

`React 18` · `TypeScript` · `Vite` · `React Router` · `Supabase` · `Netlify Functions` · `Cloudflare`

---

Achilles · @achilles.mediaz
