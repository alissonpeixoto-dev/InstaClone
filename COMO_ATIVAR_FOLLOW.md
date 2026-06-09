# 🔗 Como Ativar "Seguir/Unfollow"

O sistema de follow está implementado no código, mas precisa de setup no Supabase.

## Passo 1: Abra o Supabase
https://supabase.com/dashboard

## Passo 2: SQL Editor
1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query** (ou o botão **+**)

## Passo 3: Copie o SQL
1. Abra o arquivo `SETUP_FOLLOWS.sql` neste projeto
2. **Copie TODO o conteúdo**
3. Cole no editor do Supabase

## Passo 4: Execute
Clique no botão **▶ RUN** (verde, no canto superior direito)

## Pronto! ✅
- Volte ao app React
- Pressione **F5** para recarregar
- Vá para o perfil de outro usuário
- Clique em **"Seguir"**
- Pronto! O sistema de follow está funcionando 🎯

---

## O que foi implementado:
- ✅ Tabela `follows` no Supabase
- ✅ RLS Policies para segurança
- ✅ Hook `useFollow` para lógica de follow/unfollow
- ✅ Integração em `ProfilePage` com contadores dinâmicos
- ✅ UI responsiva com estados de carregamento

## Se não funcionar:
1. Abra o Console (F12)
2. Vá para perfil de outro usuário
3. Clique em Seguir
4. Procure por `[Follow]` no console para ver mensagens de debug
5. Se tiver erro 404 ou 403, execute o SQL novamente
