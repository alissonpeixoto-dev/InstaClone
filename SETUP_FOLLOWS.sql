-- ⚡ CONFIGURAÇÃO DE SEGUIR/UNFOLLOW
-- Execute tudo isso de uma vez no Supabase SQL Editor

-- 1. Criar tabela follows
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- 2. Criar índices para performance
CREATE INDEX follows_follower_id_idx ON public.follows(follower_id);
CREATE INDEX follows_following_id_idx ON public.follows(following_id);

-- 3. Disable RLS temporariamente
ALTER TABLE public.follows DISABLE ROW LEVEL SECURITY;

-- 4. Delete old policies (se existirem)
DROP POLICY IF EXISTS "read_follows" ON public.follows;
DROP POLICY IF EXISTS "create_follow" ON public.follows;
DROP POLICY IF EXISTS "delete_follow" ON public.follows;

-- 5. Re-enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- 6. Create new policies

-- SELECT: Qualquer um pode ver quem segue quem
CREATE POLICY "read_follows" ON public.follows 
FOR SELECT USING (true);

-- INSERT: Usuários só podem seguir (criar follow próprio)
CREATE POLICY "create_follow" ON public.follows 
FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- DELETE: Usuários só podem deixar de seguir (delete próprio)
CREATE POLICY "delete_follow" ON public.follows 
FOR DELETE USING (auth.uid() = follower_id);

-- ✅ PRONTO! Follow/Unfollow ativado!
