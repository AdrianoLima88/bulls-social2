# ✅ Implementações de Backend Concluídas

## 📊 **O que foi implementado:**

### 1. ✅ **Sistema de Compartilhamentos**
- Tabela `shares` criada para rastrear compartilhamentos
- Contador `shares_count` incrementa automaticamente via trigger
- Registra plataforma (WhatsApp, Telegram, Twitter, etc.)
- Notificação automática para o autor do post

### 2. ✅ **Sistema de Visualizações**
- Tabela `post_views` criada para rastrear visualizações
- Contador `views_count` incrementa automaticamente via trigger
- Suporta usuários autenticados e visitantes (via IP)
- Visualização registrada ao abrir o post completo

### 3. ✅ **Sistema de Seguir/Deixar de Seguir**
- Utiliza tabela `follows` existente
- Contadores `followers_count` e `following_count` atualizam automaticamente
- Hook `useFollows()` para gerenciar seguir/deixar de seguir
- Notificação automática quando alguém te segue

### 4. ✅ **Sistema de Notificações**
- Tabela `notifications` já existente no schema
- Notificações automáticas para:
  - ❤️ Curtidas em posts
  - 💬 Comentários em posts
  - 👥 Novos seguidores
  - 🔄 Compartilhamentos de posts
- Hook `useNotifications()` para gerenciar notificações
- Contador em tempo real de notificações não lidas
- Marcar como lida / Marcar todas como lidas
- ✅ Navegação ao tocar na notificação (vai para o post ou perfil)

### 5. ✅ **Push Notifications nativas (OneSignal)** — 2026-06-28
- Trigger `on_notification_created_push` em `public.notifications` (AFTER INSERT)
- A cada notificação criada, o Postgres chama (via `pg_net`) a Edge Function `send-notification`
- A Edge Function envia o push real pelo OneSignal para o celular/PWA do usuário
- Título "Bulls" + mensagem com o nome de quem curtiu/comentou/seguiu/compartilhou
- Testado de ponta a ponta (trigger → pg_net → Edge Function → OneSignal): **funcionando**
- ⚠️ **Importante para iOS:** push web (OneSignal) só funciona no iPhone se o usuário **adicionar o site à Tela de Início** (Compartilhar → Adicionar à Tela de Início). Direto no Safari normal, o iOS não entrega push de site nenhum — isso é uma limitação do próprio iOS, não do código.
- ⚠️ O usuário também precisa aceitar a permissão de notificações quando o app perguntar (acontece automaticamente ~3s após o login)

### 6. ✅ Feed personalizado ("Seguindo") — 2026-06-28
- Nova aba "Seguindo" nos chips de categoria do feed (ao lado de "Todos")
- Hook `src/hooks/useFollowingFeed.ts`: busca a lista de quem o usuário segue (tabela `follows`) e carrega só os posts desses autores, com realtime para novos posts/curtidas/comentários
- Estado vazio próprio: se o usuário não segue ninguém (ou quem segue não postou nada), mostra mensagem incentivando a seguir outros investidores
- Filtros, "Pessoas sugeridas" e "Seguindo" revisados/implementados juntos nesta mesma sessão

---

## 🚀 **Como Ativar no Supabase:**

### **PASSO 1: Executar o SQL**

1. Acesse seu **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Abra o arquivo: `supabase/adicionar_shares_views_notifications.sql`
4. **Copie TODO o conteúdo** do arquivo
5. **Cole no SQL Editor**
6. Clique em **RUN** ▶️

### **PASSO 2: Verificar se funcionou**

Após executar, você verá no final:

```
✅ Tabelas criadas: 2
✅ Triggers criados: 7
```

---

## 📱 **Funcionalidades Ativadas no Frontend:**

### **1. Compartilhamentos**
- ✅ Modal de compartilhamento registra compartilhamentos
- ✅ Contador `shares_count` incrementa automaticamente
- ✅ Autor recebe notificação quando compartilham seu post

### **2. Visualizações**
- ✅ Ao abrir um post, visualização é registrada
- ✅ Contador `views_count` incrementa automaticamente

### **3. Seguir/Deixar de Seguir**
- ✅ Botão "Seguir" nos perfis funcional
- ✅ Contadores de seguidores/seguindo atualizam em tempo real
- ✅ Notificação para quem foi seguido

### **4. Notificações**
- ✅ Tela de notificações mostra todas as interações
- ✅ Contador de não lidas no sino (badge vermelho)
- ✅ Notificações em tempo real via Supabase Realtime
- ✅ Tipos de notificações:
  - Curtiu seu post
  - Comentou no seu post
  - Começou a seguir você
  - Compartilhou seu post

---

## 🎯 **Como Testar:**

### **Teste de Compartilhamento:**
1. Abra um post
2. Clique em compartilhar
3. Escolha uma plataforma (WhatsApp, Twitter, etc.)
4. Veja o contador `shares` aumentar

### **Teste de Visualizações:**
1. Clique em um post para ver comentários
2. O contador `views` aumenta automaticamente

### **Teste de Seguir:**
1. Entre no perfil de outro usuário
2. Clique em "Seguir"
3. O botão muda para "✓ Seguindo"
4. O contador de seguidores aumenta

### **Teste de Notificações:**
1. Faça login com dois usuários diferentes
2. Com usuário A, curta/comente um post do usuário B
3. Usuário B recebe notificação com sino vermelho
4. Abra a tela de notificações para ver

---

## 📝 **Hooks Criados:**

```typescript
// Hook para compartilhamentos e visualizações
const { sharePost, viewPost } = useShares();

// Hook para seguir/deixar de seguir
const { isFollowing, toggleFollow, getFollowers, getFollowing } = useFollows();

// Hook para notificações
const {
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  getNotificationMessage
} = useNotifications();
```

---

## 🔧 **Arquivos Modificados:**

### **Backend (SQL):**
- ✅ `supabase/adicionar_shares_views_notifications.sql` (NOVO)

### **Hooks:**
- ✅ `src/hooks/useShares.ts` (NOVO)
- ✅ `src/hooks/useFollows.ts` (NOVO)
- ✅ `src/hooks/useNotifications.ts` (NOVO)

### **Componentes:**
- ✅ `src/app/components/ShareModal.tsx` - Registra compartilhamentos
- ✅ `src/app/components/CommentsScreen.tsx` - Registra visualizações
- ✅ `src/app/components/ProfileScreenNew.tsx` - Sistema de seguir
- ✅ `src/app/components/NotificationsScreen.tsx` - Lista de notificações
- ✅ `src/app/components/FeedScreen.tsx` - Contador de notificações

---

## ⚡ **Próximos Passos Sugeridos:**

1. ✅ ~~Implementar navegação ao clicar em notificação (ir para o post/perfil)~~ — feito
2. ✅ ~~Push notifications nativas no celular (OneSignal)~~ — feito
3. ✅ ~~Adicionar filtros na tela de notificações (curtidas, comentários, etc.)~~ — revisado; já estava implementado em `NotificationsScreen.tsx` (chips all/like/comment/follow/share)
4. ✅ ~~Implementar "Pessoas sugeridas para seguir"~~ — revisado; já estava implementado (`SuggestedProfiles.tsx` + `useSuggestedProfiles`, exibido no topo do feed)
5. ✅ ~~Feed personalizado (posts de quem você segue)~~ — feito em 2026-06-28: nova aba "Seguindo" no feed, hook `useFollowingFeed` busca posts só de quem o usuário segue
6. ✅ ~~Trending topics baseado em compartilhamentos/visualizações~~ — feito em 2026-06-28: aba "Trending" do Explore já existia, mas rankeava só por contagem de posts e tinha fallback com dados falsos; agora rankeia por engajamento real (shares×5 + views), compara janela atual (7d) vs anterior (7d) pra marcar Rising/Falling/New, e some o fallback fake — lista vazia mostra "No hashtags found"
   - **Correção adicional (mesmo dia):** a tela de busca (`SearchScreen.tsx`, "Assuntos do momento") usava uma fonte de dados totalmente diferente e 100% fake — o `AppContext.tsx` antigo, com posts mock hardcoded (tags como VALE3, PETR4, ITUB4 etc. com contagens inventadas) e um ícone de tendência estático. Criado hook compartilhado `useTrendingTags` (mesma lógica de engajamento real) e usado tanto no Explore quanto na busca; a busca de posts também passou a consultar o Supabase de verdade em vez do mock. Telas e textos da busca também foram conectados ao sistema de idiomas (`t()`), que estava importado mas nunca usado.

### 7. ✅ Correção: contador de likes/comentários zerado e notificações "vazias" — 2026-06-28
- **Bug 1 (contador):** quando outro usuário (não o autor do post) curtia ou comentava, `posts.likes_count`/`comments_count` continuavam em 0. Causa: as funções de trigger `increment_post_likes`, `decrement_post_likes`, `increment_comment_count`, `decrement_comment_count` e `update_follow_counts` não eram `SECURITY DEFINER` — rodavam com o RLS do usuário que curtiu/comentou, e a policy de UPDATE em `posts`/`profiles` só permite o próprio dono atualizar a própria linha. O `UPDATE` do contador era então silenciosamente bloqueado pelo RLS (0 linhas afetadas, sem erro). As funções de notificação já eram `SECURITY DEFINER` — por isso a notificação era criada, mas o contador não.
  - Corrigido via `ALTER FUNCTION ... SECURITY DEFINER` nas 5 funções acima.
  - Contadores existentes recalculados (`UPDATE posts SET likes_count = (SELECT COUNT...)`, idem `comments_count`, `followers_count`, `following_count`) para corrigir o histórico que já tinha ficado errado.
- **Bug 2 (notificações "vazias" na tela, mas com badge "1 unread"):** o hook `useNotifications.ts` só buscava a contagem de não lidas no mount (`fetchUnreadCount`, rápido — usado no sino do feed) e nunca disparava a busca da lista completa (`fetchNotifications`, exposta como `refreshNotifications`). A lista só era preenchida se uma notificação nova chegasse via Realtime enquanto a tela estava aberta. `NotificationsScreen.tsx` nunca chamava `refreshNotifications()` ao abrir.
  - Corrigido adicionando um `useEffect` em `NotificationsScreen.tsx` que chama `refreshNotifications()` ao montar a tela.

### 8. ✅ Redesign da tela "Assistir Live" (estilo Instagram Live) — 2026-06-28
- `src/app/components/WatchLiveScreen.tsx` reescrito: vídeo agora ocupa a tela toda (full-bleed, sem caixa/letterbox), e o chat/comentários ficam sobrepostos de forma translúcida sobre o vídeo (sem painel branco sólido), igual ao Instagram Live.
- Removido um mecanismo de tema local (`liveTheme`, lido de uma chave de `localStorage` diferente da do app) que não fazia nada — ficava morto no código e não era usado em nenhum estilo. Modais (Tip/Share) e menus já seguem o tema claro/escuro real do app automaticamente, pois usam as mesmas classes (`bg-white`, etc.) convertidas pelo `dark-mode.css` global quando o usuário escolhe "escuro" em Aparência. A camada do vídeo e o chat sobreposto permanecem sempre escuros/translúcidos (como em qualquer app de live — Instagram, TikTok, YouTube — para manter o texto legível sobre o vídeo, independente do tema do celular).
- Adicionado suporte a modo retrato e paisagem: o app detecta a orientação da tela (`window.innerWidth > window.innerHeight`) e reposiciona o chat — embaixo, ocupando a largura toda, em retrato; numa coluna à direita, em paisagem.

### 9. ✅ Lives reais (backend completo) + idioma em inglês — 2026-06-28
- **Schema novo no Supabase:** tabelas `lives`, `live_messages`, `live_viewers`, `live_subscribers` (RLS habilitado em todas, policies testadas via `pg_policies`).
  - `lives`: host_id, title, description, category, privacy (`public`/`followers`/`premium`), status (`scheduled`/`live`/`ended`), scheduled_at, started_at, ended_at, viewer_count, peak_viewer_count, likes_count.
  - `live_messages`: chat real por live (autor + texto), com realtime.
  - `live_viewers`: presença real (join/leave) — usada para calcular `viewer_count` ao vivo.
  - `live_subscribers`: quem apertou "Notify me" numa live agendada.
  - Sem colunas de pagamento (`is_paid`/`price`) — removidas do desenho do schema; o nível "pago" é representado só pela privacidade `premium` (gated por `subscriptions.status = 'active'`).
- **Funções `SECURITY DEFINER`:** `update_live_viewer_count` (mantém `lives.viewer_count`/`peak_viewer_count` sincronizados com `live_viewers`), `increment_live_likes` (RPC chamado ao curtir), `notify_live_subscribers` (dispara ao mudar status de `scheduled` → `live`, insere em `notifications` para todos os inscritos — encadeia automaticamente no pipeline de push já existente do OneSignal).
- **Realtime:** `lives`, `live_messages` e `live_viewers` adicionadas à publicação `supabase_realtime`.
- **Hooks novos:** `useLives()` (lista de lives ativas/agendadas, criar/iniciar/encerrar live, inscrever-se), `useLiveSession(liveId)` (chat, contagem de espectadores e curtidas em tempo real para uma live específica).
- **Telas reescritas com dados 100% reais (sem mock) e texto padronizado em inglês:**
  - `LiveScreen.tsx`: lista de lives ativas/agendadas vem do Supabase; botão "Notify me" grava de verdade em `live_subscribers`.
  - `StartLiveScreen.tsx`: criar uma live agora grava na tabela `lives` (imediata ou agendada); removida a seção "Paid Live" (sem suporte no schema); textos de erro de câmera, modal de permissão e dicas traduzidos para inglês.
  - `WatchLiveScreen.tsx`: chat, contagem de espectadores e curtidas conectados ao Supabase Realtime; botão "Follow" usa o sistema de follows real; host vê um botão "End Live" que encerra a live para todo mundo; compartilhar no Facebook/Twitter abre o link de compartilhamento real (Instagram copia o link, já que não tem URL de share direta); removido o "Super Chat"/tip (sem gateway de pagamento real).
  - `NotificationsScreen.tsx` / `useNotifications.ts`: novo tipo `live_started` — ao tocar, navega direto para a live (`onNavigateToLive`).
- **Limitação aceita:** o player de vídeo continua simulado (sem WebRTC/RTMP real) — chat, espectadores, curtidas, inscrições e notificações são 100% reais.

---

## 🎉 **Status:**

**TODAS AS 4 FUNCIONALIDADES DE BACKEND FORAM IMPLEMENTADAS COM SUCESSO!**

✅ Sistema de compartilhamentos  
✅ Sistema de visualizações  
✅ Sistema de seguir/deixar de seguir  
✅ Sistema de notificações  

---

**Faça um hard refresh no navegador** (`Ctrl + Shift + R`) e teste! 🚀
