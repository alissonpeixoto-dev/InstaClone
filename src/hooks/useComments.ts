import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { attachProfilesToComments } from "@/utils/dataHelpers";
import type { CommentWithProfile } from "@/types/database";

export function useComments(postId: string | undefined) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!postId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const commentsWithProfiles = await attachProfilesToComments(
        (data || [])
      );

      setComments(
        commentsWithProfiles.map((comment) => ({
          ...comment,
          is_owner: comment.user_id === user?.id,
        }))
      );
    } catch (err) {
      console.error("Comments fetch error:", err);
      setError("Não foi possível carregar os comentários.");
    } finally {
      setLoading(false);
    }
  }, [postId, user?.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (content: string) => {
    if (!user || !postId) return { error: "Usuário não autenticado." };
    const trimmed = content.trim();
    if (!trimmed) return { error: "Comentário não pode ficar vazio." };
    if (trimmed.length > 300)
      return { error: "Comentário deve ter no máximo 300 caracteres." };

    try {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: user.id,
        content: trimmed,
      });

      if (error) throw error;
      await fetchComments();
      return { error: null };
    } catch (err) {
      console.error("Add comment error:", err);
      return { error: "Não foi possível publicar seu comentário." };
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return { error: "Usuário não autenticado." };

    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) throw error;
      await fetchComments();
      return { error: null };
    } catch (err) {
      console.error("Delete comment error:", err);
      return { error: "Não foi possível remover o comentário." };
    }
  };

  return {
    comments,
    loading,
    error,
    refetch: fetchComments,
    addComment,
    deleteComment,
  };
}
