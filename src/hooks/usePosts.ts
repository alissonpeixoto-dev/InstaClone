import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { PostWithProfile, Post, Profile } from "@/types/database";
import { useAuth } from "@/contexts/AuthContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;
const db = supabase as AnySupabase;

async function attachProfilesToPosts(posts: Post[]) {
  if (posts.length === 0) return [] as PostWithProfile[];

  const userIds = Array.from(new Set(posts.map((post) => post.user_id)));
  const { data: profiles } = await db
    .from("profiles")
    .select("*")
    .in("id", userIds);

  const profileMap = new Map<string, Profile>(
    (profiles || []).map((profile: Profile) => [profile.id, profile])
  );

  return posts.map((post) => ({
    ...post,
    profiles: profileMap.get(post.user_id) ?? null,
  }));
}

export function useFeedPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await db
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (err) throw err;

      const postsData = (data || []) as Post[];
      const postIds = postsData.map((p) => p.id);
      let likedPostIds = new Set<string>();
      let savedPostIds = new Set<string>();

      if (postIds.length > 0) {
        const { data: likes } = await db
          .from("likes")
          .select("post_id")
          .eq("user_id", user.id)
          .in("post_id", postIds);

        likedPostIds = new Set(
          (likes || []).map((l: { post_id: string }) => l.post_id)
        );

        const { data: favorites } = await db
          .from("favorites")
          .select("post_id")
          .eq("user_id", user.id)
          .in("post_id", postIds);

        savedPostIds = new Set(
          (favorites || []).map((f: { post_id: string }) => f.post_id)
        );
      }

      const postsWithProfiles = await attachProfilesToPosts(postsData);
      const enriched: PostWithProfile[] = postsWithProfiles.map((post) => ({
        ...post,
        liked_by_user: likedPostIds.has(post.id),
        saved_by_user: savedPostIds.has(post.id),
      }));

      setPosts(enriched);
    } catch (err) {
      console.error("Feed error:", err);
      setError("Erro ao carregar o feed. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const toggleLike = async (postId: string, currentlyLiked: boolean) => {
    if (!user) return;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              liked_by_user: !currentlyLiked,
              likes_count: currentlyLiked
                ? Math.max(0, p.likes_count - 1)
                : p.likes_count + 1,
            }
          : p
      )
    );

    try {
      if (currentlyLiked) {
        await db.from("likes").delete().eq("user_id", user.id).eq("post_id", postId);
        // Update likes_count directly
        const post = posts.find((p) => p.id === postId);
        if (post) {
          await db
            .from("posts")
            .update({ likes_count: Math.max(0, post.likes_count - 1) })
            .eq("id", postId);
        }
      } else {
        await db.from("likes").insert({ user_id: user.id, post_id: postId });
        const post = posts.find((p) => p.id === postId);
        if (post) {
          await db
            .from("posts")
            .update({ likes_count: post.likes_count + 1 })
            .eq("id", postId);
        }
      }
    } catch (err) {
      console.error("Like error:", err);
      // Revert on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                liked_by_user: currentlyLiked,
                likes_count: currentlyLiked
                  ? p.likes_count + 1
                  : Math.max(0, p.likes_count - 1),
              }
            : p
        )
      );
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await db.from("likes").delete().eq("post_id", postId);
      const { error: err } = await db
        .from("posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user?.id || "");

      if (err) throw err;
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      return { error: null };
    } catch (err) {
      console.error("Delete post error:", err);
      return { error: "Erro ao excluir postagem." };
    }
  };

  const toggleSave = async (postId: string, currentlySaved: boolean) => {
    if (!user) return { error: "Usuário não autenticado." };

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, saved_by_user: !currentlySaved }
          : p
      )
    );

    try {
      console.log(
        `[Save] ${currentlySaved ? "Removendo" : "Adicionando"} favorito post ${postId}`
      );

      if (currentlySaved) {
        const { error } = await db
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
        const { error } = await db
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

      return { error: null };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
      console.error("[Save] Erro geral:", errorMsg);
      // Revert on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, saved_by_user: currentlySaved }
            : p
        )
      );
      return { error: errorMsg };
    }
  };

  return { posts, loading, error, refetch: fetchPosts, toggleLike, deletePost, toggleSave };
}

export function useUserPosts(userId: string | undefined) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await db
        .from("posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (err) throw err;

      const postsData = (data || []) as Post[];
      const postIds = postsData.map((p) => p.id);
      let likedPostIds = new Set<string>();

      if (postIds.length > 0 && user) {
        const { data: likes } = await db
          .from("likes")
          .select("post_id")
          .eq("user_id", user.id)
          .in("post_id", postIds);
        likedPostIds = new Set(
          (likes || []).map((l: { post_id: string }) => l.post_id)
        );
      }

      const postsWithProfiles = await attachProfilesToPosts(postsData);
      const enriched: PostWithProfile[] = postsWithProfiles.map((post) => ({
        ...post,
        liked_by_user: likedPostIds.has(post.id),
      }));

      setPosts(enriched);
    } catch (err) {
      console.error("User posts error:", err);
      setError("Erro ao carregar postagens.");
    } finally {
      setLoading(false);
    }
  }, [userId, user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const deletePost = async (postId: string) => {
    try {
      await db.from("likes").delete().eq("post_id", postId);
      const { error: err } = await db
        .from("posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user?.id || "");

      if (err) throw err;
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      return { error: null };
    } catch {
      return { error: "Erro ao excluir postagem." };
    }
  };

  return { posts, loading, error, refetch: fetchPosts, deletePost };
}
