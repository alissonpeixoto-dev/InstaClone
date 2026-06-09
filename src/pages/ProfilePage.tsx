import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPosts } from "@/hooks/usePosts";
import { useToast } from "@/components/ui/Toast";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ProfileSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import type { Profile, PostWithProfile } from "@/types/database";
import { Grid3X3, Heart, Settings, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostWithProfile | null>(null);
  const [deletingPost, setDeletingPost] = useState<string | null>(null);

  const isOwner = profile?.id === user?.id;
  const { posts, loading: postsLoading, deletePost } = useUserPosts(profile?.id);

  useEffect(() => {
    const load = async () => {
      if (!username) return;
      setProfileLoading(true);
      setProfileError(false);

      try {
        // Try to find by username first
        let { data, error } = await db
          .from("profiles")
          .select("*")
          .eq("username", username)
          .single();

        // Fallback: try by ID
        if (error || !data) {
          const res = await db
            .from("profiles")
            .select("*")
            .eq("id", username)
            .single();
          data = res.data;
          error = res.error;
        }

        if (error || !data) {
          setProfileError(true);
        } else {
          setProfile(data);
        }
      } catch {
        setProfileError(true);
      } finally {
        setProfileLoading(false);
      }
    };

    load();
  }, [username]);

  const handleDeletePost = async (postId: string) => {
    setDeletingPost(postId);
    const { error } = await deletePost(postId);
    setDeletingPost(null);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Postagem excluída.");
      setSelectedPost(null);
    }
  };

  if (profileLoading) return <ProfileSkeleton />;

  if (profileError || !profile) {
    return (
      <div className="max-w-[935px] mx-auto px-4 py-8 text-center">
        <p className="text-lg font-semibold text-[#262626] mb-2">Usuário não encontrado</p>
        <p className="text-sm text-[#8e8e8e] mb-4">
          Este perfil não existe ou foi removido.
        </p>
        <Button variant="secondary" onClick={() => navigate("/")}>
          Voltar ao início
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[935px] mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-16 mb-8">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar
            src={profile.avatar_url}
            size="2xl"
            alt={profile.username}
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <h1 className="text-2xl font-light text-[#262626]">
              {profile.username}
            </h1>
            {isOwner ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                >
                  Editar perfil
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/settings")}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button size="sm">Seguir</Button>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-8 mb-4">
            <div className="text-center md:text-left">
              <span className="text-sm font-semibold text-[#262626]">
                {postsLoading ? (
                  <Skeleton className="h-4 w-8 inline-block" />
                ) : (
                  posts.length
                )}
              </span>
              <span className="text-sm text-[#262626] ml-1">
                {posts.length === 1 ? "publicação" : "publicações"}
              </span>
            </div>
            <div>
              <span className="text-sm font-semibold text-[#262626]">0</span>
              <span className="text-sm text-[#262626] ml-1">seguidores</span>
            </div>
            <div>
              <span className="text-sm font-semibold text-[#262626]">0</span>
              <span className="text-sm text-[#262626] ml-1">seguindo</span>
            </div>
          </div>

          {/* Bio */}
          <div>
            {profile.full_name && (
              <p className="text-sm font-semibold text-[#262626]">
                {profile.full_name}
              </p>
            )}
            {profile.bio && (
              <p className="text-sm text-[#262626] whitespace-pre-wrap mt-1">
                {profile.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#dbdbdb] mb-6">
        <div className="flex justify-center">
          <button className="flex items-center gap-1.5 px-4 py-3 text-xs font-semibold text-[#262626] border-t-2 border-[#262626] -mt-px">
            <Grid3X3 className="w-3 h-3" />
            PUBLICAÇÕES
          </button>
        </div>
      </div>

      {/* Posts Grid */}
      {postsLoading ? (
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-[#262626] flex items-center justify-center">
            <Grid3X3 className="w-8 h-8 text-[#262626]" />
          </div>
          <p className="text-2xl font-light text-[#262626] mb-2">
            {isOwner ? "Compartilhe fotos" : "Nenhuma publicação ainda"}
          </p>
          {isOwner && (
            <p className="text-sm text-[#8e8e8e]">
              Quando você compartilhar fotos, elas aparecerão aqui.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {posts.map((post) => (
            <button
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="relative aspect-square overflow-hidden group bg-[#efefef]"
            >
              <img
                src={post.image_url}
                alt={post.caption || ""}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4">
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <Heart className="w-5 h-5 fill-white" />
                  {post.likes_count}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          refreshProfile();
          // Reload profile
          setProfile((prev) => prev ? { ...prev } : prev);
        }}
      />

      {/* Post Detail Modal */}
      <Modal
        open={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        size="xl"
      >
        {selectedPost && (
          <div className="flex flex-col md:flex-row">
            <div className="md:w-96 bg-black flex items-center justify-center">
              <img
                src={selectedPost.image_url}
                alt={selectedPost.caption || ""}
                className="w-full md:aspect-square object-cover"
              />
            </div>
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#262626]">
                    {profile.username}
                  </p>
                  {selectedPost.caption && (
                    <p className="text-sm text-[#262626] mt-2">
                      {selectedPost.caption}
                    </p>
                  )}
                </div>
                {isOwner && (
                  <button
                    onClick={() => handleDeletePost(selectedPost.id)}
                    disabled={deletingPost === selectedPost.id}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
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
