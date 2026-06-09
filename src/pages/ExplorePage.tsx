import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Link } from "react-router-dom";
import type { PostWithProfile, Post, Profile } from "@/types/database";
import { Heart, Search } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

async function loadExplorePosts() {
  const { data } = await db
    .from("posts")
    .select("*")
    .order("likes_count", { ascending: false })
    .limit(30);

  const postsData = (data || []) as Post[];
  const userIds = Array.from(new Set(postsData.map((post) => post.user_id)));

  const { data: profiles } = await db
    .from("profiles")
    .select("*")
    .in("id", userIds);

  const profileMap = new Map<string, Profile>(
    (profiles || []).map((profile: Profile) => [profile.id, profile])
  );

  return postsData.map((post) => ({
    ...post,
    profiles: profileMap.get(post.user_id) ?? null,
  }));
}

export default function ExplorePage() {
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<PostWithProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const postsWithProfiles = await loadExplorePosts();
        setPosts(postsWithProfiles);
      } catch (err) {
        console.error("Explore error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = posts.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.profiles?.username?.toLowerCase().includes(q) ||
      p.profiles?.full_name?.toLowerCase().includes(q) ||
      p.caption?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-[935px] mx-auto px-4 py-4">
      {/* Search bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e8e8e]" />
        <input
          type="text"
          placeholder="Pesquisar"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#efefef] rounded-xl border-none outline-none text-[#262626] placeholder:text-[#8e8e8e]"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-[#8e8e8e] mx-auto mb-3" />
          <p className="text-lg font-semibold text-[#262626] mb-1">
            {searchQuery ? "Nenhum resultado" : "Nenhuma postagem"}
          </p>
          <p className="text-sm text-[#8e8e8e]">
            {searchQuery
              ? `Não encontramos resultados para "${searchQuery}"`
              : "As postagens aparecerão aqui."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {filtered.map((post, i) => (
            <button
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className={`relative overflow-hidden group bg-[#efefef] ${
                i % 7 === 0 ? "col-span-2 row-span-2" : ""
              } aspect-square`}
            >
              <img
                src={post.image_url}
                alt={post.caption || ""}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <Heart className="w-5 h-5 fill-white" />
                  {post.likes_count}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Post detail modal */}
      <Modal
        open={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        size="xl"
      >
        {selectedPost && (
          <div className="flex flex-col md:flex-row">
            <div className="md:w-96 bg-black flex items-center">
              <img
                src={selectedPost.image_url}
                alt={selectedPost.caption || ""}
                className="w-full object-contain max-h-[500px]"
              />
            </div>
            <div className="flex-1 p-4">
              <Link
                to={`/profile/${selectedPost.profiles?.username || selectedPost.user_id}`}
                onClick={() => setSelectedPost(null)}
                className="flex items-center gap-3 mb-4"
              >
                <Avatar
                  src={selectedPost.profiles?.avatar_url}
                  size="sm"
                  alt={selectedPost.profiles?.username}
                />
                <span className="text-sm font-semibold text-[#262626] hover:text-[#8e8e8e]">
                  {selectedPost.profiles?.username || "Usuário"}
                </span>
              </Link>
              {selectedPost.caption && (
                <p className="text-sm text-[#262626]">{selectedPost.caption}</p>
              )}
              <div className="mt-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#262626]" />
                <span className="text-sm font-semibold text-[#262626]">
                  {selectedPost.likes_count}{" "}
                  {selectedPost.likes_count === 1 ? "curtida" : "curtidas"}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
