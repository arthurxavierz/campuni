# O que confirmar com o Campuni

O protótipo usa dados provisórios onde a informação real não estava
publicada. Antes de ir ao ar, conferir:

## Contato (`src/lib/site.ts` ou variáveis no Netlify)

- [ ] **WhatsApp oficial.** Hoje: `(34) 90000-0000`, número fictício.
- [ ] **E-mail oficial.** Hoje: `contato@campuni.com.br`, presumido pelo domínio.
- [ ] **Instagram.** Vazio: o ícone e o canal só aparecem quando preenchido.
- [ ] **Horário de atendimento.** Hoje: segunda a sábado, 7h às 19h.

## Conteúdo

- [ ] **História do Sobre.** O texto diz que o Campuni nasceu no interior de
      Minas. Falta quem criou, quando e a motivação real.
- [ ] **Vídeo explicativo.** Gravar (até 1 minuto) e colocar o link em
      `VITE_VIDEO_URL`. Até lá, a seção mostra o roteiro animado.
- [ ] **Política de privacidade e termos.** Redação-base escrita a partir do
      que o sistema faz. Precisa de revisão jurídica.
- [ ] **Prazos de retenção** citados na privacidade (anúncio expirado apagado
      em 90 dias, contatos em 12 meses): confirmar se é a regra desejada.

## Publicações da demonstração

- As seis publicações reais (Agro Vision e José Neto) estão com título,
  categoria, cidade e curtidas do site em 20/10/2026, textos resumidos e
  **ilustrações no lugar das fotos**. Se o protótipo for mostrado
  publicamente, vale avisar os anunciantes ou trocar por exemplos.
- Os demais anúncios são fictícios e aparecem marcados como "exemplo".

## Migração dos dados atuais

O endereço da página do anúncio foi mantido (`/publicacoes/:id`). Para
migrar o que está no ar hoje, falta acesso à base atual do Campuni para
mapear os campos para as tabelas `perfis`, `publicacoes` e `fotos`.
