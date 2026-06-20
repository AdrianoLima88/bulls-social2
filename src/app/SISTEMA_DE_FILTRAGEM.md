# 📊 Sistema de Categorização e Filtragem - Bulls

## 🎯 Visão Geral

O Bulls utiliza um sistema inteligente de categorização que identifica e filtra automaticamente posts de diferentes tipos de usuários e conteúdos. O algoritmo categoriza posts em 5 tipos principais:

1. **Todos** - Exibe todos os posts
2. **Análises** - Posts de análise técnica/fundamentalista
3. **Empresas** - Posts oficiais de empresas
4. **Notícias** - Posts de veículos de mídia/jornalismo
5. **Educação** - Conteúdo educacional sobre investimentos

---

## 🔍 Como Funciona o Algoritmo

### 1️⃣ **Tipos de Usuário**

Cada usuário no sistema possui um tipo (`userType`) que define sua categoria:

```typescript
interface User {
  userType: 'normal' | 'company' | 'media' | 'educator' | 'government';
}
```

**Tipos disponíveis:**
- `normal` - Usuário comum/investidor individual
- `company` - Empresa (Petrobras, Magazine Luiza, Itaú, etc.)
- `media` - Veículo de comunicação (InfoMoney, Valor Econômico, etc.)
- `educator` - Educador financeiro/analista
- `government` - Órgão governamental

### 2️⃣ **Tipos de Post**

Cada post possui um tipo (`type`) que categoriza o conteúdo:

```typescript
interface Post {
  type: 'analysis' | 'opinion' | 'education' | 'media' | 'company' | 'news';
}
```

**Tipos disponíveis:**
- `analysis` - Análise técnica ou fundamentalista
- `company` - Comunicado oficial de empresa
- `news` - Notícia jornalística
- `education` - Conteúdo educacional
- `opinion` - Opinião pessoal
- `media` - Post com foco em mídia (foto/vídeo)

### 3️⃣ **Lógica de Filtragem**

O sistema filtra posts de forma inteligente:

```javascript
// Filtrar posts baseado no filtro selecionado
const filteredPosts = feedFilter === 'all' 
  ? posts 
  : posts.filter(post => post.type === feedFilter);
```

**Mapeamento de filtros:**
- Filtro "Todos" → Exibe todos os posts
- Filtro "Análises" → Exibe apenas `type: 'analysis'`
- Filtro "Empresas" → Exibe apenas `type: 'company'`
- Filtro "Notícias" → Exibe apenas `type: 'news'`
- Filtro "Educação" → Exibe apenas `type: 'education'`

---

## 🎨 Identificação Visual

### **Badges de Tipo de Post**

Cada post exibe um badge colorido indicando sua categoria:

| Tipo | Badge | Cor | Exemplo |
|------|-------|-----|---------|
| Análise | `Análise` | Verde | Posts de análise técnica |
| Empresa | `Empresa` | Azul | Comunicados oficiais |
| Notícia | `Notícia` | Roxo | Notícias do mercado |
| Educação | `Educação` | Laranja | Conteúdo educativo |
| Opinião | `Opinião` | Cinza | Opiniões pessoais |

```tsx
<PostTypeBadge postType={post.type} size="sm" />
```

### **Badges de Tipo de Usuário**

Ícones indicam o tipo de conta:

| Tipo | Ícone | Cor |
|------|-------|-----|
| Empresa | 🏢 Building2 | Azul |
| Mídia | 📰 Newspaper | Roxo |
| Educador | 🎓 GraduationCap | Laranja |
| Governo | 🏛️ Landmark | Vermelho |
| Verificado | ✓ CheckCircle | Azul |

```tsx
<UserTypeBadge userType={user.userType} verified={user.verified} />
```

---

## 📝 Exemplos Práticos

### **Exemplo 1: Post de Empresa**

```javascript
{
  id: 'post-14',
  authorId: 'user-14',
  authorName: 'Petrobras',
  authorUsername: 'petrobras',
  authorRole: 'Empresa de Energia',
  type: 'company', // ← Tipo do post
  content: '⛽ Petrobras anuncia novo recorde de produção...',
  // ...
}
```

**Como o algoritmo identifica:**
1. Verifica o campo `type: 'company'`
2. Exibe badge azul "Empresa"
3. Aparece no filtro "Empresas"
4. Ícone 🏢 ao lado do nome (se userType for 'company')

### **Exemplo 2: Post de Notícia**

```javascript
{
  id: 'post-10',
  authorId: 'user-10',
  authorName: 'InfoMoney',
  authorUsername: 'infomoney',
  authorRole: 'Veículo de Mídia',
  type: 'news', // ← Tipo do post
  content: '🔴 URGENTE: Banco Central mantém taxa Selic...',
  // ...
}
```

**Como o algoritmo identifica:**
1. Verifica o campo `type: 'news'`
2. Exibe badge roxo "Notícia"
3. Aparece no filtro "Notícias"
4. Ícone 📰 ao lado do nome (se userType for 'media')

### **Exemplo 3: Post de Análise**

```javascript
{
  id: 'post-1',
  authorId: 'user-2',
  authorName: 'Carlos Investidor',
  authorUsername: 'carlosinvestidor',
  authorRole: 'Analista',
  type: 'analysis', // ← Tipo do post
  content: '📈 PETR4 rompeu resistência histórica!...',
  // ...
}
```

**Como o algoritmo identifica:**
1. Verifica o campo `type: 'analysis'`
2. Exibe badge verde "Análise"
3. Aparece no filtro "Análises"

---

## 🚀 Como Criar Posts Categorizados

### **Para Empresas:**
```javascript
addPost({
  authorId: currentUser.id,
  authorName: 'Nome da Empresa',
  authorUsername: 'username',
  authorRole: 'Empresa',
  type: 'company', // ← Tipo correto
  content: 'Divulgação de resultados...',
  // ...
});
```

### **Para Notícias:**
```javascript
addPost({
  authorId: currentUser.id,
  authorName: 'Veículo de Mídia',
  authorUsername: 'username',
  authorRole: 'Jornal/Mídia',
  type: 'news', // ← Tipo correto
  content: 'Notícia sobre o mercado...',
  // ...
});
```

### **Para Análises:**
```javascript
addPost({
  authorId: currentUser.id,
  authorName: 'Analista',
  authorUsername: 'username',
  authorRole: 'Analista de Investimentos',
  type: 'analysis', // ← Tipo correto
  content: 'Análise técnica de PETR4...',
  ticker: 'PETR4',
  // ...
});
```

### **Para Educação:**
```javascript
addPost({
  authorId: currentUser.id,
  authorName: 'Educador',
  authorUsername: 'username',
  authorRole: 'Educador Financeiro',
  type: 'education', // ← Tipo correto
  content: 'Como diversificar sua carteira...',
  // ...
});
```

---

## 🎯 Interface de Filtros

### **Design Estilo Stories (Instagram)**

Os filtros aparecem como círculos coloridos no topo do feed:

```tsx
<div className="flex gap-4">
  {categories.map(category => (
    <button 
      onClick={() => setFeedFilter(category.id)}
      className={`rounded-full p-0.5 ${
        isActive ? `bg-gradient-to-br ${category.gradient}` : ''
      }`}
    >
      <Icon />
      <span>{category.label}</span>
    </button>
  ))}
</div>
```

**Categorias disponíveis:**
- ✨ Todos (Verde)
- 📊 Análises (Azul)
- 🏢 Empresas (Roxo)
- 📰 Notícias (Vermelho)
- 🎓 Educação (Laranja)

---

## 🔧 Configuração Técnica

### **1. Adicionar tipo ao usuário no Context:**
```typescript
const [currentUser, setCurrentUser] = useState<User>({
  // ... outros campos
  userType: 'educator', // Define o tipo
});
```

### **2. Criar posts com tipo correto:**
```typescript
addPost({
  // ... outros campos
  type: 'company', // Define a categoria
});
```

### **3. Filtrar no componente:**
```tsx
const filteredPosts = feedFilter === 'all' 
  ? posts 
  : posts.filter(post => post.type === feedFilter);
```

---

## ✅ Benefícios do Sistema

1. **Organização**: Posts organizados por categoria
2. **Descoberta**: Usuários encontram conteúdo relevante facilmente
3. **Transparência**: Badges mostram claramente a fonte do conteúdo
4. **Credibilidade**: Diferenciação entre conteúdo oficial e opinião
5. **UX Intuitiva**: Interface familiar (estilo Stories)

---

## 🎨 Personalizações Futuras

**Possibilidades:**
- Filtros combinados (Ex: "Notícias + Análises")
- Filtro por ticker específico (Ex: "Apenas PETR4")
- Filtro por setor (Ex: "Apenas Bancos")
- Algoritmo de recomendação baseado em interesse
- Feed personalizado por seguindo
- Notificações por tipo de conteúdo

---

## 📊 Resumo Técnico

| Componente | Arquivo | Função |
|------------|---------|--------|
| Context | `AppContext.tsx` | Armazena posts e tipos de usuário |
| Filtros | `FeedFilters.tsx` | Componente de filtros (opcional) |
| Badges | `UserTypeBadge.tsx` | Componentes visuais de identificação |
| Feed | `FeedScreen.tsx` | Exibe posts filtrados |
| Lógica | `filter(post => post.type === feedFilter)` | Filtragem dos posts |

---

**✅ Sistema implementado e funcionando!**

Agora o Bulls consegue identificar e filtrar automaticamente posts de empresas, notícias, análises e conteúdo educacional! 🎯🚀
