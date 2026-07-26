# BullsGo — Checklist de Lançamento na App Store e Google Play

---

## ⚠️ ATENÇÃO CRÍTICA ANTES DE TUDO

### O App precisa ser empacotado como app nativo
O BullsGo é atualmente um PWA (site React). Para publicar nas lojas, você precisa
empacotá-lo. A opção mais rápida para o stack atual é **Capacitor (Ionic)**:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init
npx cap add ios
npx cap add android
npx cap sync
```

Isso transforma o PWA em um app iOS (.ipa) e Android (.apk/.aab) sem reescrever o código.

### Pagamentos: Stripe NÃO é permitido na App Store
Apple e Google exigem que assinaturas vendidas dentro do app usem o sistema deles:
- **iOS → Apple In-App Purchases (IAP)** — Apple leva 15-30%
- **Android → Google Play Billing** — Google leva 15-30%
Você não pode usar Stripe direto para cobrar assinatura em apps das lojas.
Solução: detectar a plataforma e usar IAP quando for app nativo, Stripe quando for web.

---

## 1. JURÍDICO E COMPLIANCE

### Registro de Marca
- [ ] **INPI (Brasil)** — Registrar "BullsGo" nas classes 35 (serviços financeiros) e 42 (software)
      Site: inpi.gov.br | Custo: ~R$ 430 por classe | Prazo: 18-24 meses
- [ ] **USPTO (EUA)** — Registro federal americano
      Site: tess2.uspto.gov | Custo: ~$350 por classe | Prazo: 12-18 meses
- [ ] **EUIPO (Europa)** — Marca comunitária europeia (cobre 27 países)
      Site: euipo.europa.eu | Custo: ~€850 | Prazo: 4-6 meses

### Documentos Legais (obrigatórios para as lojas)
- [ ] **Política de Privacidade** (URL pública obrigatória)
      Deve cobrir: LGPD (Brasil), GDPR (Europa), CCPA (Califórnia)
      Incluir: dados coletados, uso, retenção, direitos do usuário
- [ ] **Termos de Uso** (URL pública obrigatória)
      Incluir: limitação de responsabilidade sobre conteúdo financeiro
- [ ] **Isenção de responsabilidade financeira** (CRÍTICO)
      O app exibe análises e sinais de investimento — você precisa deixar claro
      que NÃO é uma corretora nem assessor financeiro regulado
- [ ] **Política de Cookies** (exigida na Europa)

### Compliance Financeiro (Brasil)
- [ ] Verificar se o conteúdo do app se enquadra como "análise de valores mobiliários"
      (pode exigir registro na CVM como Analista de Valores Mobiliários)
- [ ] Se tiver usuários investindo dinheiro real no app → consultar advogado especializado

### Empresarial
- [ ] Abrir CNPJ (MEI ou Ltda) para receber pagamentos das lojas
- [ ] Conta bancária PJ para receber repasses da Apple/Google
- [ ] Contrato com contador para NF e impostos sobre assinaturas

---

## 2. CONTAS NAS LOJAS

### Apple App Store
- [ ] **Apple Developer Program** — $99/ano (developer.apple.com)
- [ ] Mac com Xcode instalado (obrigatório para build iOS)
- [ ] Certificado de distribuição iOS (gerado no Xcode)
- [ ] App ID registrado no Apple Developer Portal
- [ ] Provisioning Profile para produção
- [ ] Configurar Apple In-App Purchases no App Store Connect
      (recriar os planos Premium/Pro/Business como produtos IAP)

### Google Play Store
- [ ] **Google Play Console** — $25 taxa única (play.google.com/console)
- [ ] Keystore Android (chave de assinatura — guarde em lugar seguro, não perde nunca)
- [ ] Conta Google associada ao app
- [ ] Configurar Google Play Billing (produtos de assinatura)

---

## 3. APP PRONTO PARA AS LOJAS

### Assets Obrigatórios
- [ ] **Ícone do app**
      iOS: 1024x1024px PNG sem transparência
      Android: 512x512px PNG
- [ ] **Screenshots** (para cada tamanho de tela exigido)
      iOS: iPhone 6.7", 6.5", 5.5" + iPad Pro 12.9" (se suportar iPad)
      Android: Celular + tablet (opcional)
      Mínimo 3, máximo 10 por idioma
- [ ] **Feature Graphic** (Android) — 1024x500px banner da Play Store
- [ ] **Vídeo preview** (opcional mas aumenta conversão) — máx 30 segundos

### Metadados das Lojas (ASO — App Store Optimization)
- [ ] Nome do app (30 chars na Apple, 50 no Google)
- [ ] Subtítulo / Tagline (30 chars Apple)
- [ ] Descrição curta (80 chars Google)
- [ ] Descrição longa (4.000 chars) — incluir palavras-chave relevantes
- [ ] Palavras-chave (100 chars Apple — separadas por vírgula)
- [ ] Categoria principal: Finance ou Social Networking
- [ ] Classificação etária: provavelmente 17+ / Mature (conteúdo financeiro)
- [ ] URL de suporte (página de contato ou FAQ)
- [ ] URL da Política de Privacidade (obrigatório)
- [ ] E-mail de suporte visível na loja

---

## 4. TÉCNICO — APP EM SI

### Código e Build
- [ ] Empacotar com Capacitor (iOS + Android)
- [ ] Remover todos os `console.log` de produção
- [ ] Configurar variáveis de ambiente para produção (sem chaves de teste)
- [ ] Minificação e otimização do bundle (já feito pelo Vite)
- [ ] Testar deep links (ex: bullsgo://profile/username)
- [ ] Splash screen nativa (Capacitor tem plugin)
- [ ] Configurar push notifications nativas (Capacitor Push Notifications plugin)
- [ ] Status bar customizada para iOS (cor verde do app)
- [ ] Safe area handling no iOS (notch, Dynamic Island)

### Pagamentos — Implementar IAP
- [ ] Instalar `@capacitor-community/in-app-purchases` ou `cordova-plugin-purchase`
- [ ] Detectar plataforma: iOS/Android → IAP | Web → Stripe
- [ ] Criar produtos de assinatura no App Store Connect e Play Console
- [ ] Implementar restore purchases (exigido pela Apple)
- [ ] Testar compra em sandbox (TestFlight + Google Internal Testing)

### Segurança
- [ ] Trocar chaves do Stripe para produção (sk_live_...)
- [ ] Remover qualquer chave de API hardcoded no código
- [ ] HTTPS em todas as chamadas (já garantido pelo Supabase/Vercel) ✓
- [ ] Rate limiting nas Edge Functions críticas
- [ ] Revisão de Row Level Security no Supabase ✓
- [ ] Penetration test básico (OWASP Top 10)

### Performance
- [ ] Lighthouse score mínimo 80 em Performance, Acessibilidade e SEO
- [ ] Testar em dispositivos lentos (Android entry-level)
- [ ] Lazy loading de imagens ✓
- [ ] Paginação nos feeds (não carregar tudo de uma vez) ✓

---

## 5. TESTES

### Funcionais
- [ ] Criar cenários de teste para cada funcionalidade principal:
      - Cadastro → escolha de plano → pagamento → acesso
      - Criar post (texto, análise, com mídia)
      - Like, comentário, compartilhamento
      - Follow/unfollow
      - BullsAI chat
      - BullsSignal vote
      - BullsBrief geração
      - Live stream (iniciar, assistir, encerrar)
      - Notificações
      - Perfil (editar, ver de outros)
- [ ] **E2E automatizado** — Playwright (mais moderno que Selenium, suporta mobile)
      ```bash
      npm install @playwright/test
      ```
- [ ] Testar em iOS Safari e Chrome Android (os dois principais browsers)

### Dispositivos Físicos
- [ ] iPhone (pelo menos iOS 15+)
- [ ] Android (pelo menos API 30, Android 11+)
- [ ] Tablet (opcional)

### Beta Testing
- [ ] **TestFlight (iOS)** — convidar 10-20 usuários reais antes do lançamento
- [ ] **Google Play Internal Testing / Beta** — mesmo processo no Android
- [ ] Coletar feedback e corrigir bugs antes do lançamento público

### Acessibilidade
- [ ] Textos com contraste mínimo 4.5:1
- [ ] VoiceOver (iOS) e TalkBack (Android) funcionando nos fluxos principais
- [ ] Tamanhos de fonte respeitando configuração do sistema

---

## 6. BACKEND E INFRAESTRUTURA

- [ ] Plano pago do Supabase (Free tem limites de conexões e storage)
      Recomendado: Pro ($25/mês) antes de lançar
- [ ] Backup automático do banco de dados ativado
- [ ] Monitoramento de uptime (UptimeRobot, Betterstack — planos gratuitos disponíveis)
- [ ] Logs de erro centralizados (Sentry — tem plano grátis)
      ```bash
      npm install @sentry/react
      ```
- [ ] Política de retenção de dados definida
- [ ] CDN para imagens de usuário (Supabase Storage já tem CDN) ✓

---

## 7. SUPORTE AO USUÁRIO

- [ ] E-mail de suporte ativo (ex: suporte@bullsgo.com)
- [ ] Central de Ajuda / FAQ (pode ser simples, uma página estática)
- [ ] Processo para deletar conta e dados (exigido por Apple + LGPD)
      O app já deve ter botão "Excluir conta" acessível nas configurações
- [ ] Processo para reportar conteúdo impróprio (o botão existe ✓, mas precisa ir a algum lugar)
- [ ] Tempo de resposta máximo: 48h (Apple verifica isso em reclamações)

---

## 8. ANÁLISE E CRESCIMENTO

- [ ] Firebase Analytics ou PostHog (analytics de comportamento)
- [ ] Firebase Crashlytics (crashes em tempo real)
- [ ] Definir KPIs de lançamento: DAU, retenção D1/D7/D30, conversão free→pago
- [ ] Estratégia de avaliações: pedir avaliação in-app após primeira semana de uso
      (usar `@capacitor-community/app-rate`)
- [ ] Responder TODAS as avaliações nas lojas (Apple e Google veem isso)

---

## 9. SUBMISSÃO NAS LOJAS

### Apple App Store — Processo
1. Build no Xcode → Archive → Upload para App Store Connect
2. Preencher todos os metadados no App Store Connect
3. Configurar "App Privacy" (nutrition labels — o que o app coleta)
4. Submeter para revisão (tempo médio: 1-3 dias úteis)
5. Apple pode rejeitar — principais motivos: IAP faltando, privacidade, bugs

### Google Play Store — Processo
1. Build .aab assinado no Android Studio
2. Upload no Play Console → aba "Production" (ou começar em "Internal testing")
3. Preencher formulário de "Data safety"
4. Preencher declaração de conteúdo financeiro
5. Revisão (tempo médio: 1-7 dias, às vezes horas)

---

## 10. PÓS-LANÇAMENTO

- [ ] Monitorar reviews diariamente na primeira semana
- [ ] Corrigir bugs críticos em menos de 48h (publicar update)
- [ ] Plano de comunicação: redes sociais, Product Hunt, comunidades de investidores
- [ ] Configurar ASA (Apple Search Ads) e Google UAC para aquisição paga
- [ ] Definir cadência de updates (sugestão: a cada 2-4 semanas)

---

## ORDEM SUGERIDA DE EXECUÇÃO

```
1. Abrir CNPJ + conta PJ
2. Registrar marca no INPI (demora mais, pode fazer em paralelo)
3. Contratar advogado → Política de Privacidade + Termos de Uso
4. Finalizar funcionalidades do app (bugs, Stripe live)
5. Empacotar com Capacitor
6. Implementar IAP (Apple + Google)
7. Criar contas Apple Developer + Google Play
8. Testes internos + beta (TestFlight)
9. Preparar assets da loja (screenshots, ícone, textos)
10. Submeter nas lojas
11. Lançar + monitorar
```

---

*Tempo estimado total: 3-6 meses (dependendo da velocidade em jurídico e IAP)*
*Custo mínimo estimado: R$ 3.000-8.000 (contas de dev + INPI + advogado + Supabase Pro)*
