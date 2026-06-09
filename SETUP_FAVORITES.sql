-- ⚡ SOLUÇÃO FINAL PARA SALVAR POSTS
-- Execute tudo isso de uma vez no Supabase SQL Editor

-- 1. Disable RLS temporariamente
ALTER TABLE public.favorites DISABLE ROW LEVEL SECURITY;

-- 2. Delete all old policies
DROP POLICY IF EXISTS "fav_select" ON public.favorites;
DROP POLICY IF EXISTS "fav_insert" ON public.favorites;
DROP POLICY IF EXISTS "fav_delete" ON public.favorites;
DROP POLICY IF EXISTS "select_favorites" ON public.favorites;
DROP POLICY IF EXISTS "insert_favorites" ON public.favorites;
DROP POLICY IF EXISTS "delete_favorites" ON public.favorites;

-- 3. Re-enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- 4. Create new simple policies

-- SELECT: Anyone can read any favorite
CREATE POLICY "read_favorites" ON public.favorites 
FOR SELECT USING (true);

-- INSERT: Users can only insert their own favorites
CREATE POLICY "create_favorite" ON public.favorites 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own favorites
CREATE POLICY "remove_favorite" ON public.favorites 
FOR DELETE USING (auth.uid() = user_id);

-- ✅ PRONTO! Agora salvar funciona!
