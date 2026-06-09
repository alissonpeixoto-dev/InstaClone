import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export function useFollow(userId: string | undefined) {
  const { user } = useAuth();

  const isFollowing = useCallback(async () => {
    if (!user || !userId) return false;

    try {
      const { data, error } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("[Follow] Check error:", error);
        return false;
      }

      return !!data;
    } catch (err) {
      console.error("[Follow] Error checking follow status:", err);
      return false;
    }
  }, [user, userId]);

  const toggleFollow = useCallback(
    async (currentlyFollowing: boolean) => {
      if (!user || !userId) {
        return { error: "Usuário não autenticado." };
      }

      try {
        console.log(
          `[Follow] ${currentlyFollowing ? "Deixando de seguir" : "Seguindo"} ${userId}`
        );

        if (currentlyFollowing) {
          // DELETE follow
          const { error } = await supabase
            .from("follows")
            .delete()
            .eq("follower_id", user.id)
            .eq("following_id", userId);

          if (error) {
            console.error("[Follow] Delete error:", error);
            if (error.status === 404) {
              throw new Error("Tabela 'follows' não encontrada. Execute SETUP_FOLLOWS.sql");
            }
            if (error.status === 403) {
              throw new Error("Sem permissão para deixar de seguir. Execute SETUP_FOLLOWS.sql");
            }
            throw error;
          }
          console.log("[Follow] Deixou de seguir com sucesso");
        } else {
          // INSERT follow
          const { error } = await supabase
            .from("follows")
            .insert({
              follower_id: user.id,
              following_id: userId,
            });

          if (error) {
            console.error("[Follow] Insert error:", error);
            if (error.status === 404) {
              throw new Error("Tabela 'follows' não encontrada. Execute SETUP_FOLLOWS.sql");
            }
            if (error.status === 403) {
              throw new Error("Sem permissão para seguir. Execute SETUP_FOLLOWS.sql");
            }
            throw error;
          }
          console.log("[Follow] Seguindo com sucesso");
        }

        return { error: null };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
        console.error("[Follow] Erro geral:", errorMsg);
        return { error: errorMsg };
      }
    },
    [user, userId]
  );

  const getFollowersCount = useCallback(async () => {
    if (!userId) return 0;

    try {
      const { count, error } = await supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("following_id", userId);

      if (error) {
        if (error.status === 404) {
          console.warn("[Follow] Tabela 'follows' não existe. Execute SETUP_FOLLOWS.sql");
        } else {
          throw error;
        }
      }
      return count ?? 0;
    } catch (err) {
      console.warn("[Follow] Error getting followers count:", err);
      return 0;
    }
  }, [userId]);

  const getFollowingCount = useCallback(async () => {
    if (!user) return 0;

    try {
      const { count, error } = await supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("follower_id", user.id);

      if (error) {
        if (error.status === 404) {
          console.warn("[Follow] Tabela 'follows' não existe. Execute SETUP_FOLLOWS.sql");
        } else {
          throw error;
        }
      }
      return count ?? 0;
    } catch (err) {
      console.warn("[Follow] Error getting following count:", err);
      return 0;
    }
  }, [user]);

  return {
    isFollowing,
    toggleFollow,
    getFollowersCount,
    getFollowingCount,
  };
}
