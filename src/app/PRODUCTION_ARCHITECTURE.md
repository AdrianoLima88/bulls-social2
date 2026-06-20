# 🚀 Bulls Live - Arquitetura de Produção

## 📋 Índice
1. [Backend Real](#backend-real)
2. [Infraestrutura de Streaming](#infraestrutura-de-streaming)
3. [Sistema de Monetização](#sistema-de-monetização)
4. [Features Avançadas](#features-avançadas)
5. [Analytics & Métricas](#analytics--métricas)
6. [Segurança & Compliance](#segurança--compliance)
7. [Escalabilidade](#escalabilidade)

---

## 🎥 Backend Real

### 1. Streaming Infrastructure

#### **Opção A: AWS IVS (Amazon Interactive Video Service)**
```typescript
// Backend - Criar Canal de Live
import AWS from 'aws-sdk';

const ivs = new AWS.IVS({ region: 'us-east-1' });

async function createLiveChannel(userId: string) {
  const channel = await ivs.createChannel({
    name: `bulls-live-${userId}`,
    latencyMode: 'LOW', // Latência <3 segundos
    type: 'STANDARD',
    authorized: false
  }).promise();

  const streamKey = await ivs.createStreamKey({
    channelArn: channel.channel.arn
  }).promise();

  return {
    channelArn: channel.channel.arn,
    ingestEndpoint: channel.channel.ingestEndpoint,
    playbackUrl: channel.channel.playbackUrl,
    streamKey: streamKey.streamKey.value // NUNCA expor ao cliente
  };
}

// Frontend - Player HLS
import { IVSPlayer } from 'amazon-ivs-player';

function VideoPlayer({ playbackUrl }: { playbackUrl: string }) {
  useEffect(() => {
    const player = IVSPlayer.create();
    player.attachHTMLVideoElement(videoRef.current);
    player.load(playbackUrl);
    player.play();

    return () => player.delete();
  }, [playbackUrl]);

  return <video ref={videoRef} />;
}
```

**Custos AWS IVS:**
- Input: $1.00/hora de transmissão
- Output: $0.015/GB transferido
- Armazenamento (Replay): $0.023/GB/mês
- **Estimativa:** ~$200-500/mês (100 lives/dia de 1h cada)

#### **Opção B: WebRTC com Agora.io**
```typescript
// Backend - Token de autenticação
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

function generateAgoraToken(channelName: string, uid: number) {
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;
  const expirationTime = 3600; // 1 hora

  return RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    RtcRole.PUBLISHER,
    Math.floor(Date.now() / 1000) + expirationTime
  );
}

// Frontend - Cliente Agora
import AgoraRTC from 'agora-rtc-sdk-ng';

const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });

async function startLive(channelName: string, token: string) {
  await client.join(appId, channelName, token, userId);
  
  const localVideoTrack = await AgoraRTC.createCameraVideoTrack();
  const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  
  await client.publish([localVideoTrack, localAudioTrack]);
}
```

**Custos Agora.io:**
- Grátis: 10.000 minutos/mês
- Depois: $0.99/1000 minutos
- **Estimativa:** ~$150-400/mês (100 lives/dia)

---

### 2. Chat em Tempo Real

#### **Socket.io + Redis Pub/Sub**
```typescript
// Backend - Socket.io Server
import { Server } from 'socket.io';
import Redis from 'ioredis';

const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL }
});

const redisPublisher = new Redis();
const redisSubscriber = new Redis();

io.on('connection', (socket) => {
  socket.on('join-live', async (liveId: string) => {
    socket.join(`live:${liveId}`);
    
    // Incrementa contador de viewers
    await redisPublisher.incr(`live:${liveId}:viewers`);
    
    // Pega histórico do chat (últimas 100 mensagens)
    const messages = await redisPublisher.lrange(
      `live:${liveId}:chat`,
      -100,
      -1
    );
    socket.emit('chat-history', messages);
  });

  socket.on('send-message', async (data) => {
    const message = {
      id: Date.now(),
      userId: socket.data.userId,
      username: socket.data.username,
      message: data.message,
      timestamp: new Date().toISOString(),
      isSuperChat: data.isSuperChat,
      amount: data.amount
    };

    // Salva no Redis (TTL 24h)
    await redisPublisher.rpush(
      `live:${data.liveId}:chat`,
      JSON.stringify(message)
    );
    await redisPublisher.expire(`live:${data.liveId}:chat`, 86400);

    // Broadcasting para todos na sala
    io.to(`live:${data.liveId}`).emit('new-message', message);

    // Se for Super Chat, salva no DB para analytics
    if (data.isSuperChat) {
      await db.superChats.create({
        liveId: data.liveId,
        userId: socket.data.userId,
        amount: data.amount,
        message: data.message
      });
    }
  });

  socket.on('send-reaction', async (data) => {
    io.to(`live:${data.liveId}`).emit('new-reaction', {
      emoji: data.emoji,
      x: Math.random() * 100
    });
  });

  socket.on('disconnect', async () => {
    // Decrementa contador de viewers
    await redisPublisher.decr(`live:${socket.data.liveId}:viewers`);
  });
});

// Pub/Sub entre múltiplos servidores (cluster)
redisSubscriber.subscribe('live-events');
redisSubscriber.on('message', (channel, message) => {
  const event = JSON.parse(message);
  io.to(`live:${event.liveId}`).emit(event.type, event.data);
});
```

---

## 💰 Sistema de Monetização

### 1. Super Chat (Stripe + PagSeguro)

#### **Backend - Processamento de Pagamento**
```typescript
import Stripe from 'stripe';
import { PagSeguro } from 'pagseguro-node-sdk';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const pagseguro = new PagSeguro({
  email: process.env.PAGSEGURO_EMAIL,
  token: process.env.PAGSEGURO_TOKEN,
  sandbox: false
});

// Stripe (Internacional)
async function processSuperChatStripe(data: {
  liveId: string;
  userId: string;
  amount: number; // em centavos
  message: string;
}) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: data.amount,
    currency: 'usd',
    metadata: {
      liveId: data.liveId,
      userId: data.userId,
      type: 'super_chat'
    }
  });

  // Revenue Share: 70% creator, 30% plataforma
  const creatorAmount = Math.floor(data.amount * 0.70);
  const platformAmount = data.amount - creatorAmount;

  await db.transactions.create({
    liveId: data.liveId,
    userId: data.userId,
    amount: data.amount,
    creatorAmount,
    platformAmount,
    paymentIntentId: paymentIntent.id,
    status: 'pending'
  });

  return paymentIntent.client_secret;
}

// PagSeguro (Brasil)
async function processSuperChatPagSeguro(data: {
  liveId: string;
  userId: string;
  amount: number;
  message: string;
  cardData: any;
}) {
  const payment = await pagseguro.payment.create({
    mode: 'default',
    method: 'creditCard',
    sender: {
      name: data.senderName,
      email: data.senderEmail,
      phone: data.senderPhone,
      document: { type: 'CPF', value: data.senderCPF }
    },
    creditCard: {
      token: data.cardData.token,
      holder: data.cardData.holder,
      billingAddress: data.cardData.billingAddress
    },
    items: [{
      id: '1',
      description: `Super Chat - Live ${data.liveId}`,
      quantity: 1,
      amount: (data.amount / 100).toFixed(2)
    }],
    extraAmount: '0.00',
    reference: `SUPERCHAT-${data.liveId}-${Date.now()}`
  });

  return payment;
}

// Webhook Stripe
app.post('/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    // Atualiza transação
    await db.transactions.update({
      where: { paymentIntentId: paymentIntent.id },
      data: { status: 'completed' }
    });

    // Notifica via Socket.io
    io.to(`live:${paymentIntent.metadata.liveId}`).emit('super-chat', {
      userId: paymentIntent.metadata.userId,
      amount: paymentIntent.amount,
      message: paymentIntent.metadata.message
    });
  }

  res.json({ received: true });
});
```

### 2. Lives Pagas (Paywall)

```typescript
// Backend - Verificação de Acesso
async function checkLiveAccess(userId: string, liveId: string) {
  const live = await db.lives.findUnique({ where: { id: liveId } });

  if (!live.isPaid) return { hasAccess: true };

  // Verifica se usuário comprou acesso
  const purchase = await db.livePurchases.findFirst({
    where: { userId, liveId, status: 'completed' }
  });

  if (purchase) return { hasAccess: true };

  // Verifica se é assinante do creator
  const subscription = await db.subscriptions.findFirst({
    where: {
      userId,
      creatorId: live.hostId,
      status: 'active',
      expiresAt: { gt: new Date() }
    }
  });

  return { hasAccess: !!subscription };
}

// Frontend - Paywall
function LivePaywall({ live, onPurchase }: LivePaywallProps) {
  const handlePurchase = async () => {
    const response = await fetch('/api/lives/purchase', {
      method: 'POST',
      body: JSON.stringify({
        liveId: live.id,
        paymentMethod: 'card'
      })
    });

    const { clientSecret } = await response.json();

    // Stripe Elements
    const result = await stripe.confirmCardPayment(clientSecret);
    
    if (result.error) {
      alert('Erro no pagamento: ' + result.error.message);
    } else {
      onPurchase();
    }
  };

  return (
    <div className="paywall">
      <h2>{live.title}</h2>
      <p>Esta é uma live exclusiva</p>
      <div className="price">R$ {live.price}</div>
      <button onClick={handlePurchase}>Comprar Acesso</button>
    </div>
  );
}
```

### 3. Sistema de Assinaturas

```typescript
// Backend - Criar Assinatura (Stripe Subscriptions)
async function createSubscription(data: {
  userId: string;
  creatorId: string;
  planId: string;
}) {
  const user = await db.users.findUnique({ where: { id: data.userId } });
  
  // Cria ou recupera Stripe Customer
  let stripeCustomer;
  if (user.stripeCustomerId) {
    stripeCustomer = await stripe.customers.retrieve(user.stripeCustomerId);
  } else {
    stripeCustomer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id }
    });
    await db.users.update({
      where: { id: user.id },
      data: { stripeCustomerId: stripeCustomer.id }
    });
  }

  // Cria Subscription
  const subscription = await stripe.subscriptions.create({
    customer: stripeCustomer.id,
    items: [{ price: data.planId }],
    metadata: {
      userId: data.userId,
      creatorId: data.creatorId
    }
  });

  // Salva no DB
  await db.subscriptions.create({
    data: {
      userId: data.userId,
      creatorId: data.creatorId,
      stripeSubscriptionId: subscription.id,
      status: 'active',
      expiresAt: new Date(subscription.current_period_end * 1000)
    }
  });

  return subscription;
}

// Webhook para renovações/cancelamentos
app.post('/webhooks/stripe-subscriptions', async (req, res) => {
  const event = req.body;

  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      await db.subscriptions.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: subscription.status,
          expiresAt: new Date(subscription.current_period_end * 1000)
        }
      });
      break;
  }

  res.json({ received: true });
});
```

---

## ⚡ Features Avançadas

### 1. Co-hosts (Multi-streaming)

```typescript
// Backend - Gerenciamento de Co-hosts
async function inviteCoHost(data: {
  liveId: string;
  hostId: string;
  invitedUserId: string;
}) {
  const invitation = await db.coHostInvitations.create({
    data: {
      liveId: data.liveId,
      hostId: data.hostId,
      invitedUserId: data.invitedUserId,
      status: 'pending',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutos
    }
  });

  // Notifica via WebSocket
  io.to(`user:${data.invitedUserId}`).emit('cohost-invitation', {
    id: invitation.id,
    liveId: data.liveId,
    hostName: (await db.users.findUnique({ where: { id: data.hostId } })).name
  });

  return invitation;
}

async function acceptCoHostInvitation(invitationId: string) {
  const invitation = await db.coHostInvitations.findUnique({
    where: { id: invitationId }
  });

  if (invitation.expiresAt < new Date()) {
    throw new Error('Convite expirado');
  }

  await db.coHostInvitations.update({
    where: { id: invitationId },
    data: { status: 'accepted' }
  });

  await db.liveCoHosts.create({
    data: {
      liveId: invitation.liveId,
      userId: invitation.invitedUserId,
      joinedAt: new Date()
    }
  });

  // Notifica todos na live
  io.to(`live:${invitation.liveId}`).emit('cohost-joined', {
    userId: invitation.invitedUserId
  });
}

// Frontend - Agora Multi-user
async function addCoHostToStream(coHostUserId: number, channelName: string) {
  const remoteUsers = client.remoteUsers;
  
  client.on('user-published', async (user, mediaType) => {
    await client.subscribe(user, mediaType);
    
    if (mediaType === 'video') {
      const remoteVideoTrack = user.videoTrack;
      remoteVideoTrack.play(`player-${user.uid}`);
    }
    
    if (mediaType === 'audio') {
      const remoteAudioTrack = user.audioTrack;
      remoteAudioTrack.play();
    }
  });
}
```

### 2. Moderação de Chat

```typescript
// Backend - Sistema de Moderação
async function moderateMessage(data: {
  liveId: string;
  messageId: string;
  action: 'delete' | 'ban' | 'timeout';
  moderatorId: string;
}) {
  // Verifica se moderador tem permissão
  const live = await db.lives.findUnique({ where: { id: data.liveId } });
  const isModerator = live.hostId === data.moderatorId || 
    await db.moderators.findFirst({
      where: { liveId: data.liveId, userId: data.moderatorId }
    });

  if (!isModerator) {
    throw new Error('Sem permissão para moderar');
  }

  const message = await db.chatMessages.findUnique({
    where: { id: data.messageId }
  });

  switch (data.action) {
    case 'delete':
      await db.chatMessages.delete({ where: { id: data.messageId } });
      io.to(`live:${data.liveId}`).emit('message-deleted', { 
        messageId: data.messageId 
      });
      break;

    case 'ban':
      await db.bannedUsers.create({
        data: {
          liveId: data.liveId,
          userId: message.userId,
          reason: 'Violação das regras',
          bannedBy: data.moderatorId
        }
      });
      // Expulsa usuário da live
      io.to(`user:${message.userId}`).emit('banned-from-live');
      break;

    case 'timeout':
      await redisPublisher.setex(
        `timeout:${data.liveId}:${message.userId}`,
        300, // 5 minutos
        '1'
      );
      io.to(`user:${message.userId}`).emit('timeout', { duration: 300 });
      break;
  }
}

// Auto-moderação com IA
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function autoModerate(message: string) {
  const response = await openai.moderations.create({
    input: message
  });

  const result = response.results[0];

  if (result.flagged) {
    return {
      shouldBlock: true,
      categories: result.categories
    };
  }

  return { shouldBlock: false };
}
```

### 3. Sistema de Clips

```typescript
// Backend - Criar Clip
import ffmpeg from 'fluent-ffmpeg';
import AWS from 'aws-sdk';

const s3 = new AWS.S3();

async function createClip(data: {
  liveId: string;
  userId: string;
  startTime: number;
  endTime: number;
  title?: string;
}) {
  const live = await db.lives.findUnique({ where: { id: data.liveId } });
  
  if (!live.recordingUrl) {
    throw new Error('Live não tem gravação disponível');
  }

  const duration = data.endTime - data.startTime;
  if (duration > 60) {
    throw new Error('Clip não pode ter mais de 60 segundos');
  }

  const clipId = `clip-${Date.now()}`;
  const outputPath = `/tmp/${clipId}.mp4`;

  // Processa vídeo com FFmpeg
  await new Promise((resolve, reject) => {
    ffmpeg(live.recordingUrl)
      .setStartTime(data.startTime)
      .setDuration(duration)
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });

  // Upload para S3
  const fileContent = fs.readFileSync(outputPath);
  const uploadResult = await s3.upload({
    Bucket: process.env.S3_CLIPS_BUCKET,
    Key: `clips/${clipId}.mp4`,
    Body: fileContent,
    ContentType: 'video/mp4'
  }).promise();

  // Salva no DB
  const clip = await db.clips.create({
    data: {
      id: clipId,
      liveId: data.liveId,
      userId: data.userId,
      title: data.title || `Clip da live ${live.title}`,
      url: uploadResult.Location,
      startTime: data.startTime,
      endTime: data.endTime,
      duration
    }
  });

  // Limpa arquivo temporário
  fs.unlinkSync(outputPath);

  return clip;
}
```

### 4. Replay Automático

```typescript
// Backend - Salvar Recording
async function saveLiveRecording(liveId: string) {
  const live = await db.lives.findUnique({ where: { id: liveId } });

  // AWS IVS automaticamente salva recordings no S3 se configurado
  // Precisamos apenas atualizar o DB com a URL

  const recording = await ivs.getRecording({
    arn: live.recordingConfigArn
  }).promise();

  await db.lives.update({
    where: { id: liveId },
    data: {
      recordingUrl: recording.url,
      isReplayAvailable: true,
      duration: recording.durationMinutes * 60
    }
  });

  // Notifica seguidores que replay está disponível
  const followers = await db.follows.findMany({
    where: { followingId: live.hostId }
  });

  for (const follower of followers) {
    await db.notifications.create({
      data: {
        userId: follower.followerId,
        type: 'replay_available',
        title: 'Replay disponível',
        message: `${live.host.name} postou um replay: ${live.title}`,
        liveId
      }
    });
  }
}
```

---

## 📊 Analytics & Métricas

### 1. Real-time Analytics

```typescript
// Backend - Processamento de Métricas
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'bulls-analytics',
  brokers: [process.env.KAFKA_BROKER]
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'analytics-group' });

// Enviar eventos
async function trackEvent(event: {
  type: string;
  liveId: string;
  userId?: string;
  data: any;
}) {
  await producer.send({
    topic: 'live-events',
    messages: [{
      value: JSON.stringify({
        ...event,
        timestamp: Date.now()
      })
    }]
  });
}

// Processar eventos
async function processAnalytics() {
  await consumer.subscribe({ topic: 'live-events' });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());

      switch (event.type) {
        case 'viewer_joined':
          await redisPublisher.incr(`analytics:${event.liveId}:totalViewers`);
          await redisPublisher.pfadd(`analytics:${event.liveId}:uniqueViewers`, event.userId);
          break;

        case 'like':
          await redisPublisher.incr(`analytics:${event.liveId}:likes`);
          break;

        case 'super_chat':
          await redisPublisher.incrbyfloat(
            `analytics:${event.liveId}:revenue`,
            event.data.amount
          );
          break;

        case 'message_sent':
          await redisPublisher.incr(`analytics:${event.liveId}:messages`);
          break;
      }
    }
  });
}

// Agregar métricas (roda a cada minuto)
setInterval(async () => {
  const activeLives = await db.lives.findMany({
    where: { status: 'live' }
  });

  for (const live of activeLives) {
    const metrics = {
      currentViewers: await redisPublisher.get(`live:${live.id}:viewers`) || 0,
      totalViewers: await redisPublisher.get(`analytics:${live.id}:totalViewers`) || 0,
      uniqueViewers: await redisPublisher.pfcount(`analytics:${live.id}:uniqueViewers`) || 0,
      likes: await redisPublisher.get(`analytics:${live.id}:likes`) || 0,
      revenue: await redisPublisher.get(`analytics:${live.id}:revenue`) || 0,
      messages: await redisPublisher.get(`analytics:${live.id}:messages`) || 0
    };

    await db.liveAnalytics.create({
      data: {
        liveId: live.id,
        timestamp: new Date(),
        ...metrics
      }
    });
  }
}, 60000);
```

### 2. Dashboard de Creator

```typescript
// Backend - Endpoint de Analytics
app.get('/api/creator/analytics', authenticate, async (req, res) => {
  const { period } = req.query; // '7d', '30d', '90d', 'all'
  const userId = req.user.id;

  const startDate = calculateStartDate(period);

  const analytics = await db.lives.aggregate({
    where: {
      hostId: userId,
      createdAt: { gte: startDate }
    },
    _sum: {
      viewers: true,
      likes: true,
      revenue: true,
      duration: true
    },
    _avg: {
      viewers: true
    },
    _max: {
      viewers: true
    }
  });

  const topLives = await db.lives.findMany({
    where: {
      hostId: userId,
      createdAt: { gte: startDate }
    },
    orderBy: { viewers: 'desc' },
    take: 5
  });

  const revenueBreakdown = await db.transactions.groupBy({
    by: ['type'],
    where: {
      creatorId: userId,
      createdAt: { gte: startDate },
      status: 'completed'
    },
    _sum: { creatorAmount: true }
  });

  const audienceDemographics = await db.liveViewers.groupBy({
    by: ['country', 'ageGroup', 'gender'],
    where: {
      live: {
        hostId: userId,
        createdAt: { gte: startDate }
      }
    },
    _count: true
  });

  res.json({
    totalViews: analytics._sum.viewers,
    totalRevenue: analytics._sum.revenue,
    totalLikes: analytics._sum.likes,
    avgViewers: analytics._avg.viewers,
    peakViewers: analytics._max.viewers,
    watchTime: analytics._sum.duration,
    engagement: calculateEngagement(analytics),
    topLives,
    revenueBreakdown,
    audienceDemographics
  });
});
```

---

## 🔒 Segurança & Compliance

### 1. Autenticação & Autorização

```typescript
// JWT Tokens
import jwt from 'jsonwebtoken';

function generateTokens(user: User) {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

// Middleware de autenticação
function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}
```

### 2. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const createLiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // Máximo 5 lives por hora
  message: 'Você atingiu o limite de lives por hora'
});

app.post('/api/lives', authenticate, createLiveLimiter, async (req, res) => {
  // ...
});

const superChatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // Máximo 10 Super Chats por minuto
  message: 'Você está enviando Super Chats muito rápido'
});
```

### 3. Content Moderation

```typescript
// Detector de conteúdo impróprio
import AWS from 'aws-sdk';

const rekognition = new AWS.Rekognition();

async function moderateVideoFrame(imageBytes: Buffer) {
  const result = await rekognition.detectModerationLabels({
    Image: { Bytes: imageBytes }
  }).promise();

  const inappropriateContent = result.ModerationLabels.filter(
    label => label.Confidence > 80
  );

  if (inappropriateContent.length > 0) {
    // Suspende live automaticamente
    return {
      isInappropriate: true,
      labels: inappropriateContent
    };
  }

  return { isInappropriate: false };
}
```

---

## 📈 Escalabilidade

### 1. Load Balancing

```yaml
# docker-compose.yml
version: '3.8'

services:
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf

  api-1:
    build: ./backend
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://postgres:password@db:5432/bulls

  api-2:
    build: ./backend
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://postgres:password@db:5432/bulls

  redis:
    image: redis:alpine
    
  db:
    image: postgres:14
```

### 2. Database Optimization

```sql
-- Índices para performance
CREATE INDEX idx_lives_status ON lives(status);
CREATE INDEX idx_lives_host_id ON lives(host_id);
CREATE INDEX idx_live_viewers_live_id ON live_viewers(live_id);
CREATE INDEX idx_transactions_creator_id_date ON transactions(creator_id, created_at);

-- Particionamento por data (analytics)
CREATE TABLE live_analytics_2026_04 PARTITION OF live_analytics
FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
```

### 3. CDN & Caching

```typescript
// CloudFlare CDN para assets
const CDN_URL = 'https://cdn.bulls.com';

// Cache de thumbnails
app.get('/api/lives/:id/thumbnail', async (req, res) => {
  const cacheKey = `thumbnail:${req.params.id}`;
  const cached = await redisPublisher.get(cacheKey);

  if (cached) {
    return res.redirect(cached);
  }

  const live = await db.lives.findUnique({ where: { id: req.params.id } });
  await redisPublisher.setex(cacheKey, 3600, live.thumbnail); // Cache 1h

  res.redirect(live.thumbnail);
});
```

---

## 💵 Revenue Share

```typescript
// 70% Creator / 30% Plataforma
const PLATFORM_FEE = 0.30;
const CREATOR_SHARE = 0.70;

async function processPayoutToCreator(creatorId: string, period: 'weekly' | 'monthly') {
  const startDate = period === 'weekly' 
    ? subDays(new Date(), 7) 
    : subMonths(new Date(), 1);

  const earnings = await db.transactions.aggregate({
    where: {
      creatorId,
      createdAt: { gte: startDate },
      status: 'completed',
      payoutStatus: 'pending'
    },
    _sum: { creatorAmount: true }
  });

  if (!earnings._sum.creatorAmount || earnings._sum.creatorAmount < 5000) {
    // Mínimo R$ 50 para saque
    throw new Error('Saldo insuficiente para saque');
  }

  // Transfere via Stripe Connect
  const creator = await db.users.findUnique({ where: { id: creatorId } });

  const transfer = await stripe.transfers.create({
    amount: earnings._sum.creatorAmount,
    currency: 'brl',
    destination: creator.stripeAccountId,
    description: `Pagamento de ${period === 'weekly' ? 'semanal' : 'mensal'}`
  });

  await db.transactions.updateMany({
    where: {
      creatorId,
      createdAt: { gte: startDate },
      payoutStatus: 'pending'
    },
    data: {
      payoutStatus: 'completed',
      payoutDate: new Date(),
      stripeTransferId: transfer.id
    }
  });

  return transfer;
}
```

---

## 🚀 Deploy

### Production Stack
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (RDS) + Redis (ElastiCache)
- **Streaming:** AWS IVS ou Agora.io
- **Storage:** AWS S3 para recordings e clips
- **CDN:** CloudFlare
- **Payments:** Stripe + PagSeguro
- **Analytics:** Kafka + ClickHouse
- **Monitoring:** DataDog + Sentry

### Custos Estimados (100 lives/dia)
- AWS IVS: ~$300/mês
- RDS PostgreSQL: ~$150/mês
- ElastiCache Redis: ~$100/mês
- S3 Storage: ~$50/mês
- CloudFlare: ~$20/mês
- Stripe/PagSeguro: 2.9% + R$0.39 por transação
- **Total:** ~$620/mês + taxas de transação

---

## 📝 Próximos Passos

1. ✅ Implementar backend completo com Node.js + TypeScript
2. ✅ Integrar AWS IVS para streaming real
3. ✅ Implementar Socket.io para chat em tempo real
4. ✅ Integrar Stripe e PagSeguro
5. ✅ Criar sistema de analytics com Kafka
6. ✅ Deploy em produção com Docker + Kubernetes
7. ✅ Configurar CI/CD com GitHub Actions
8. ✅ Testes automatizados (Jest + Cypress)

---

**🎉 Documentação criada! Esta é a arquitetura completa de produção do Bulls Live.**
