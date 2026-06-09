import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { Profile } from "@/types/database";

export interface Activity {
  id: string;
  type: "like" | "follow" | "comment";
  user: Profile;
  postId?: string;
  postCaption?: string;
  comment?: string;
  createdAt: string;
}

export function useActivities() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch likes on user's posts
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString();

      const { data: likes } = await supabase
        .from("likes")
        .select(
          `
          id,
          created_at,
          user:profiles!liker_id(id, username, avatar_url, full_name)
        `
        )
        .eq("post_id", user.id) // likes on posts by this user
        .gte("created_at", sevenDaysAgo)
        .order("created_at", { ascending: false })
        .limit(10);

      // Fetch follows of user
      const { data: follows } = await supabase
        .from("follows")
        .select(
          `
          id,
          created_at,
          follower:profiles!follower_id(id, username, avatar_url, full_name)
        `
        )
        .eq("following_id", user.id)
        .gte("created_at", sevenDaysAgo)
        .order("created_at", { ascending: false })
        .limit(10);

      // Fetch comments on user's posts
      const { data: userPosts } = await supabase
        .from("posts")
        .select("id")
        .eq("user_id", user.id);

      let comments: any[] = [];
      if (userPosts && userPosts.length > 0) {
        const postIds = userPosts.map((p: any) => p.id);
        const { data: commentData } = await supabase
          .from("comments")
          .select(
            `
            id,
            content,
            created_at,
            post_id,
            user:profiles!user_id(id, username, avatar_url, full_name),
            post:posts(caption)
          `
          )
          .in("post_id", postIds)
          .gte("created_at", sevenDaysAgo)
          .order("created_at", { ascending: false })
          .limit(10);
        comments = commentData || [];
      }

      // Combine and sort activities
      const allActivities: Activity[] = [];

      likes?.forEach((like: any) => {
        if (like.user) {
          allActivities.push({
            id: `like-${like.id}`,
            type: "like",
            user: like.user,
            createdAt: like.created_at,
          });
        }
      });

      follows?.forEach((follow: any) => {
        if (follow.follower) {
          allActivities.push({
            id: `follow-${follow.id}`,
            type: "follow",
            user: follow.follower,
            createdAt: follow.created_at,
          });
        }
      });

      comments.forEach((comment: any) => {
        if (comment.user && comment.post) {
          allActivities.push({
            id: `comment-${comment.id}`,
            type: "comment",
            user: comment.user,
            postId: comment.post_id,
            postCaption: comment.post.caption,
            comment: comment.content,
            createdAt: comment.created_at,
          });
        }
      });

      // Sort by date descending
      allActivities.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setActivities(allActivities.slice(0, 20)); // Limit to 20 most recent
    } catch (err) {
      console.error("[Activities] Error fetching activities:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActivities();
    // Refetch every 30 seconds
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, [fetchActivities]);

  return { activities, loading, refetch: fetchActivities };
}
