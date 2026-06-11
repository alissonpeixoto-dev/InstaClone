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
        console.log("[Activities] Fetching likes for posts:", postIds);
        
        try {
          const { data: likes, error: likesError } = await supabase
            .from("likes")
            .select("id, created_at, post_id, user_id")
            .in("post_id", postIds)
            .order("created_at", { ascending: false });

          if (likesError) {
            console.error("[Activities] Error fetching likes:", likesError.message || likesError);
          } else {
            console.log("[Activities] Found likes:", likes?.length);
            
            // Get user profiles for likes
            if (likes && likes.length > 0) {
              const likerIds = [...new Set(likes.map((l) => l.user_id))];
              const { data: likerProfiles } = await supabase
                .from("profiles")
                .select("id, username, avatar_url, full_name")
                .in("id", likerIds);

              const profilesMap = new Map(
                likerProfiles?.map((p) => [p.id, p]) || []
              );

              likes.forEach((like) => {
                const profile = profilesMap.get(like.user_id);
                if (profile) {
                  const post = userPosts.find((p) => p.id === like.post_id);
                  allActivities.push({
                    id: `like-${like.id}`,
                    type: "like",
                    user: profile,
                    postId: like.post_id,
                    postCaption: post?.caption,
                    createdAt: like.created_at,
                  });
                }
              });
            }
          }
        } catch (err) {
          console.error("[Activities] Exception fetching likes:", err);
        }
      }

      // Step 3: Fetch follows
      const { data: follows, error: followsError } = await supabase
        .from("follows")
        .select("id, created_at, follower_id")
        .eq("following_id", user.id)
        .order("created_at", { ascending: false });

      if (followsError) {
        console.error("[Activities] Error fetching follows:", followsError.message || followsError);
      } else {
        console.log("[Activities] Found follows:", follows?.length);
        
        // Get user profiles for follows
        if (follows && follows.length > 0) {
          const followerIds = [...new Set(follows.map((f) => f.follower_id))];
          const { data: followerProfiles } = await supabase
            .from("profiles")
            .select("id, username, avatar_url, full_name")
            .in("id", followerIds);

          const profilesMap = new Map(
            followerProfiles?.map((p) => [p.id, p]) || []
          );

          follows.forEach((follow) => {
            const profile = profilesMap.get(follow.follower_id);
            if (profile) {
              allActivities.push({
                id: `follow-${follow.id}`,
                type: "follow",
                user: profile,
                createdAt: follow.created_at,
              });
            }
          });
        }
      }

      // Step 4: Fetch comments on user's posts
      if (userPosts && userPosts.length > 0) {
        const postIds = userPosts.map((p) => p.id);
        const { data: comments, error: commentsError } = await supabase
          .from("comments")
          .select("id, content, created_at, post_id, user_id")
          .in("post_id", postIds)
          .order("created_at", { ascending: false });

        if (commentsError) {
          console.error("[Activities] Error fetching comments:", commentsError.message || commentsError);
        } else {
          console.log("[Activities] Found comments:", comments?.length);
          
          // Get user profiles for comments
          if (comments && comments.length > 0) {
            const commentUserIds = [...new Set(comments.map((c) => c.user_id))];
            const { data: commentProfiles } = await supabase
              .from("profiles")
              .select("id, username, avatar_url, full_name")
              .in("id", commentUserIds);

            const profilesMap = new Map(
              commentProfiles?.map((p) => [p.id, p]) || []
            );

            comments.forEach((comment) => {
              const profile = profilesMap.get(comment.user_id);
              if (profile) {
                const post = userPosts.find((p) => p.id === comment.post_id);
                allActivities.push({
                  id: `comment-${comment.id}`,
                  type: "comment",
                  user: profile,
                  postId: comment.post_id,
                  postCaption: post?.caption,
                  comment: comment.content,
                  createdAt: comment.created_at,
                });
              }
            });
          }
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
