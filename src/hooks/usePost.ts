import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { attachProfilesToPosts } from "@/utils/dataHelpers";
import type { PostWithProfile, Post } from "@/types/database";

export function usePost(postId: string | undefined) {
  const { user } = useAuth();
  const [post, setPost] = useState<PostWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    if (!postId) {
      setPost(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: postData, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single();

      if (error || !postData) {
        throw error || new Error("Post não encontrado.");
      }

      const postsWithProfiles = await attachProfilesToPosts([postData as Post]);
      const [item] = postsWithProfiles;

      const [{ count: commentsCount }, { count: favoritesCount }] = await Promise.all([
        supabase
          .from("comments")
          .select("id", { count: "exact", head: true })
          .eq("post_id", postId),
        supabase
          .from("favorites")
          .select("id", { count: "exact", head: true })
          .eq("post_id", postId),
      ]);

      let likedByUser = false;
      let savedByUser = false;

      if (user) {
        const [{ data: likedRows }, { data: savedRows }] = await Promise.all([
          supabase
            .from("likes")
            .select("id")
            .eq("post_id", postId)
            .eq("user_id", user.id),
          supabase
            .from("favorites")
            .select("id")
            .eq("post_id", postId)
            .eq("user_id", user.id),
        ]);

        likedByUser = (likedRows || []).length > 0;
        savedByUser = (savedRows || []).length > 0;
      }

      setPost({
        ...item,
        liked_by_user: likedByUser,
        saved_by_user: savedByUser,
        comments_count: commentsCount ?? 0,
        favorites_count: favoritesCount ?? 0,
      });
    } catch (err) {
      console.error("Post fetch error:", err);
      setError("Não foi possível carregar a postagem.");
    } finally {
      setLoading(false);
    }
  }, [postId, user]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const toggleLike = useCallback(
    async (postId: string, currentlyLiked: boolean) => {
      if (!user) return { error: "Usuário não autenticado." };

      try {
        if (currentlyLiked) {
          const { error } = await supabase
            .from("likes")
            .delete()
            .eq("user_id", user.id)
            .eq("post_id", postId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("likes")
            .insert({ user_id: user.id, post_id: postId });
          if (error) throw error;
        }
        await fetchPost();
        return { error: null };
      } catch (err) {
        console.error("Toggle like error:", err);
        return { error: "Não foi possível atualizar a curtida." };
      }
    },
    [user, fetchPost]
  );

  const toggleSave = useCallback(
    async (postId: string, currentlySaved: boolean) => {
      if (!user) {
        console.log("[Save] Usuário não autenticado");
        return { error: "Usuário não autenticado." };
      }

      try {
        console.log(
          `[Save] ${currentlySaved ? "Removendo" : "Adicionando"} favorito post ${postId}`
        );

        if (currentlySaved) {
          const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("post_id", postId);
          if (error) {
            console.error("[Save] Delete error:", error);
            throw error;
          }
          console.log("[Save] Deletado com sucesso");
        } else {
          const { error } = await supabase
            .from("favorites")
            .insert({ user_id: user.id, post_id: postId });
          if (error) {
            console.error("[Save] Insert error:", error);
            if (error.status === 404) {
              throw new Error(
                "Tabela 'favorites' não encontrada. Execute SETUP_FAVORITES.sql no Supabase."
              );
            }
            if (error.status === 403) {
              throw new Error(
                "Sem permissão para salvar. Execute SETUP_FAVORITES.sql no Supabase."
              );
            }
            throw error;
          }
          console.log("[Save] Inserido com sucesso");
        }

        console.log("[Save] Atualizando post...");
        await fetchPost();
        console.log("[Save] Post atualizado");
        return { error: null };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
        console.error("[Save] Erro geral:", errorMsg);
        return { error: errorMsg };
      }
    },
    [user, fetchPost]
  );

  return { post, loading, error, refetch: fetchPost, toggleLike, toggleSave };
}
