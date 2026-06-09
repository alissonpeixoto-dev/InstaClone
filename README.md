# InstaClone 📸

Um clone do Instagram moderno e funcional, construído com React, TypeScript, Tailwind CSS e Supabase.

## ✨ Funcionalidades

- 🔐 **Autenticação completa** — Login, cadastro, logout, recuperação de senha
- 🖼️ **Feed de postagens** — Visualize e curta posts em ordem cronológica
- 📤 **Upload de imagens** — Compartilhe fotos com compressão automática
- 👤 **Perfil editável** — Avatar, nome, username e bio personalizáveis
- 🔍 **Explorar** — Descubra postagens e pesquise usuários
- ❤️ **Curtidas** — Curta e descurta postagens com contagem em tempo real
- 🗑️ **Excluir posts** — Remova suas próprias postagens
- 📱 **Responsivo** — Sidebar no desktop, bottom nav no mobile
- 🔔 **Toasts** — Notificações amigáveis para todas as ações

## 🚀 Como rodar

### 1. Clone e instale

```bash
git clone <seu-repo>
cd instaclone
npm install
```

### 2. Configure o Supabase

Copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

> 📍 Encontre suas credenciais em: **Supabase Dashboard → Settings → API**

### 3. Configure o banco de dados

Execute o arquivo `supabase_setup.sql` no **SQL Editor** do Supabase.

> 📍 Acesse: **Supabase Dashboard → SQL Editor → New Query**

Cole todo o conteúdo do arquivo e execute.

### 4. Configure o Storage

Os buckets são criados automaticamente pelo SQL. Verifique em:
**Supabase Dashboard → Storage**

Você deve ver:
- `avatars` (público)
- `posts` (público)

### 5. Configure a URL de redirecionamento

Para o reset de senha funcionar corretamente:

**Supabase Dashboard → Authentication → URL Configuration**

Adicione em **Redirect URLs**:
```
http://localhost:5173/reset-password
https://seu-dominio.vercel.app/reset-password
```

### 6. Rode o projeto

```bash
npm run dev
```

Acesse: [http://localhost:5173](http://localhost:5173)

## 🛠️ Stack

| Tecnologia | Versão |
|---|---|
| React | 19 |
| TypeScript | 5 |
| Tailwind CSS | 4 |
| Vite | 7 |
| Supabase | Latest |
| React Router | 6 |
| Lucide React | Latest |
| date-fns | Latest |

## 📁 Estrutura

```
src/
├── components/
│   ├── layout/        # Sidebar, BottomNav, AppLayout
│   ├── post/          # PostCard, NewPostModal
│   ├── profile/       # EditProfileModal
│   └── ui/            # Button, Input, Avatar, Modal, Toast, Skeleton
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── usePosts.ts
│   └── useUpload.ts
├── pages/
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── ResetPasswordPage.tsx
│   ├── FeedPage.tsx
│   ├── ProfilePage.tsx
│   ├── ExplorePage.tsx
│   ├── ActivityPage.tsx
│   └── SettingsPage.tsx
├── types/
│   └── database.ts
└── utils/
    ├── cn.ts
    └── imageUtils.ts
```

## 🌐 Deploy na Vercel

1. Faça push para o GitHub
2. Importe o repositório na Vercel
3. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

## ⚠️ Erros comuns

### "Supabase não configurado"
→ Crie o arquivo `.env.local` com as credenciais corretas.

### "Bucket not found"
→ Execute o SQL de setup ou crie os buckets manualmente no Supabase Storage.

### "Email já cadastrado"
→ Tente fazer login ou use a recuperação de senha.

### Link de reset não funciona
→ Adicione a URL de redirecionamento nas configurações do Supabase Authentication.
