import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { attachProfilesToPosts } from "@/utils/dataHelpers";
import type { PostWithProfile, Post } from "@/types/database";

export function useFavorites() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: favoriteRows, error } = await supabase
        .from("favorites")
        .select("post_id")
        .eq("user_id", user.id);

      if (error) {
        if (error.status === 404 || /not found/i.test(error.message || "")) {
          throw new Error(
            "A tabela 'favorites' não foi encontrada. Execute o script de configuração do Supabase ou crie a tabela no painel do Supabase."
          );
        }
        throw error;
      }

      const postIds = (favoriteRows || []).map((item) => item.post_id);
      if (postIds.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const { data: postRows, error: postsError } = await supabase
        .from("posts")
        .select("*")
        .in("id", postIds)
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

      const postsData = (postRows || []) as Post[];
      const postsWithProfiles = await attachProfilesToPosts(postsData);
      setPosts(
        postsWithProfiles.map((post) => ({
          ...post,
          saved_by_user: true,
        }))
      );
    } catch (err) {
      console.error("Favorites fetch error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os favoritos."
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (postId: string, currentlySaved: boolean) => {
    if (!user) return { error: "Usuário não autenticado." };

    try {
      console.log(
        `[Favorites] ${currentlySaved ? "Removendo" : "Adicionando"} post ${postId}`
      );

      if (currentlySaved) {
        // DELETE
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", postId);

        if (error) {
          console.error("[Favorites] Delete error:", error);
          throw error;
        }
        console.log("[Favorites] Deletado com sucesso");
      } else {
        // INSERT
        const { error } = await supabase
          .from("favorites")
          .insert([
            {
              user_id: user.id,
              post_id: postId,
            },
          ]);

        if (error) {
          console.error("[Favorites] Insert error:", error);
          if (error.status === 404) {
            throw new Error(
              "Tabela 'favorites' não encontrada. Execute SALVAR_POSTS_FINAL.sql no Supabase."
            );
          }
          if (error.status === 403) {
            throw new Error(
              "Sem permissão para salvar. Execute SALVAR_POSTS_FINAL.sql no Supabase."
            );
          }
          throw error;
        }
        console.log("[Favorites] Inserido com sucesso");
      }

      await fetchFavorites();
      return { error: null };
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar seus favoritos.";
      console.error("[Favorites] Erro geral:", errorMsg);
      return { error: errorMsg };
    }
  };

  return {
    posts,
    loading,
    error,
    refetch: fetchFavorites,
    toggleFavorite,
  };
}
