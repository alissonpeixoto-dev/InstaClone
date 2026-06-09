import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export function useLikes() {
  const { user } = useAuth();

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

        return { error: null };
      } catch (err) {
        console.error("Toggle like error:", err);
        return { error: "Não foi possível atualizar a curtida." };
      }
    },
    [user]
  );

  return { toggleLike };
}
