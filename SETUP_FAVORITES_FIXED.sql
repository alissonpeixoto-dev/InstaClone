-- ⚡ CONFIGURAÇÃO DE SALVOS (FAVORITES)
-- Execute tudo isso de uma vez no Supabase SQL Editor

-- 1. Criar tabela favorites se não existir
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, post_id)
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_post_id_idx ON public.favorites(post_id);

-- 3. Disable RLS temporariamente
ALTER TABLE public.favorites DISABLE ROW LEVEL SECURITY;

-- 4. Delete old policies (se existirem)
DROP POLICY IF EXISTS "read_favorites" ON public.favorites;
DROP POLICY IF EXISTS "create_favorite" ON public.favorites;
DROP POLICY IF EXISTS "delete_favorite" ON public.favorites;

-- 5. Re-enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 6. Create new policies

-- SELECT: Usuários só veem seus próprios salvos
CREATE POLICY "read_favorites" ON public.favorites 
FOR SELECT USING (auth.uid() = user_id);

-- INSERT: Usuários só podem salvar seus próprios posts
CREATE POLICY "create_favorite" ON public.favorites 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DELETE: Usuários só podem deletar seus próprios salvos
CREATE POLICY "delete_favorite" ON public.favorites 
FOR DELETE USING (auth.uid() = user_id);

-- ✅ PRONTO! Sistema de Salvos ativado!
