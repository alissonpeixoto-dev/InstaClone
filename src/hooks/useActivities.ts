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
      const allActivities: Activity[] = [];
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString();

      console.log("[Activities] Fetching activities for user:", user.id);

      // Step 1: Get user's posts
      const { data: userPosts, error: postsError } = await supabase
        .from("posts")
        .select("id, caption")
        .eq("user_id", user.id);

      if (postsError) {
        console.error("[Activities] Error fetching user posts:", postsError);
      } else {
        console.log("[Activities] Found posts:", userPosts?.length);
      }

      // Step 2: Fetch likes on user's posts
      if (userPosts && userPosts.length > 0) {
        const postIds = userPosts.map((p) => p.id);
        const { data: likes, error: likesError } = await supabase
          .from("likes")
          .select(
            `
            id,
            created_at,
            post_id,
            posts(caption),
            profiles!liker_id(id, username, avatar_url, full_name)
          `
          )
          .in("post_id", postIds)
          .gte("created_at", sevenDaysAgo)
          .order("created_at", { ascending: false })
          .limit(20);

        if (likesError) {
          console.error("[Activities] Error fetching likes:", likesError);
        } else {
          console.log("[Activities] Found likes:", likes?.length);
          likes?.forEach((like: any) => {
            if (like.profiles) {
              allActivities.push({
                id: `like-${like.id}`,
                type: "like",
                user: like.profiles,
                postId: like.post_id,
                postCaption: like.posts?.caption,
                createdAt: like.created_at,
              });
            }
          });
        }
      }

      // Step 3: Fetch follows
      const { data: follows, error: followsError } = await supabase
        .from("follows")
        .select(
          `
          id,
          created_at,
          profiles!follower_id(id, username, avatar_url, full_name)
        `
        )
        .eq("following_id", user.id)
        .gte("created_at", sevenDaysAgo)
        .order("created_at", { ascending: false })
        .limit(20);

      if (followsError) {
        console.error("[Activities] Error fetching follows:", followsError);
      } else {
        console.log("[Activities] Found follows:", follows?.length);
        follows?.forEach((follow: any) => {
          if (follow.profiles) {
            allActivities.push({
              id: `follow-${follow.id}`,
              type: "follow",
              user: follow.profiles,
              createdAt: follow.created_at,
            });
          }
        });
      }

      // Step 4: Fetch comments on user's posts
      if (userPosts && userPosts.length > 0) {
        const postIds = userPosts.map((p) => p.id);
        const { data: comments, error: commentsError } = await supabase
          .from("comments")
          .select(
            `
            id,
            content,
            created_at,
            post_id,
            posts(caption),
            profiles!user_id(id, username, avatar_url, full_name)
          `
          )
          .in("post_id", postIds)
          .gte("created_at", sevenDaysAgo)
          .order("created_at", { ascending: false })
          .limit(20);

        if (commentsError) {
          console.error("[Activities] Error fetching comments:", commentsError);
        } else {
          console.log("[Activities] Found comments:", comments?.length);
          comments?.forEach((comment: any) => {
            if (comment.profiles) {
              allActivities.push({
                id: `comment-${comment.id}`,
                type: "comment",
                user: comment.profiles,
                postId: comment.post_id,
                postCaption: comment.posts?.caption,
                comment: comment.content,
                createdAt: comment.created_at,
              });
            }
          });
        }
      }

      // Sort by date descending
      allActivities.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      console.log("[Activities] Total activities:", allActivities.length);
      setActivities(allActivities.slice(0, 50)); // Limit to 50 most recent
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
