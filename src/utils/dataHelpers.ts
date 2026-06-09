import { supabase } from "@/lib/supabase";
import type { Comment, CommentWithProfile, Post, PostWithProfile, Profile } from "@/types/database";

export async function fetchProfilesByIds(userIds: string[]) {
  if (userIds.length === 0) return [] as Profile[];

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("id", userIds);

  if (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }

  return (data || []) as Profile[];
}

export async function attachProfilesToPosts(posts: Post[]) {
  if (posts.length === 0) return [] as PostWithProfile[];

  const userIds = Array.from(new Set(posts.map((post) => post.user_id)));
  const profiles = await fetchProfilesByIds(userIds);
  const profileMap = new Map<string, Profile>(
    profiles.map((profile) => [profile.id, profile])
  );

  return posts.map((post) => ({
    ...post,
    profiles: profileMap.get(post.user_id) ?? null,
  }));
}

export async function attachProfilesToComments(comments: Comment[]) {
  if (comments.length === 0) return [] as CommentWithProfile[];

  const userIds = Array.from(new Set(comments.map((comment) => comment.user_id)));
  const profiles = await fetchProfilesByIds(userIds);
  const profileMap = new Map<string, Profile>(
    profiles.map((profile) => [profile.id, profile])
  );

  return comments.map((comment) => ({
    ...comment,
    profile: profileMap.get(comment.user_id) ?? null,
    is_owner: false,
  }));
}
