import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFeedPosts } from "@/hooks/usePosts";
import { PostCard } from "@/components/post/PostCard";
import { PostSkeleton } from "@/components/ui/Skeleton";
import { NewPostModal } from "@/components/post/NewPostModal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import { RefreshCw, ImagePlus, Wifi } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function FeedPage() {
  const navigate = useNavigate();
  const { posts, loading, error, refetch, toggleLike, deletePost, toggleSave } = useFeedPosts();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [showNewPost, setShowNewPost] = useState(false);

  const handleDelete = async (postId: string) => {
    const { error: err } = await deletePost(postId);
    if (err) toast.error(err);
    else toast.success("Postagem excluída.");
  };

  const handleSave = async (postId: string, saved: boolean) => {
    const { error: err } = await toggleSave(postId, saved);
    if (err) {
      toast.error(err);
    } else {
      toast.success(saved ? "Removido dos salvos." : "Post salvo.");
    }
  };

  if (error) {
    return (
      <div className="max-w-[470px] mx-auto px-4 py-8">
        <div className="bg-white border border-[#dbdbdb] rounded-xl p-8 text-center">
          <Wifi className="w-12 h-12 text-[#8e8e8e] mx-auto mb-3" />
          <p className="text-sm text-[#262626] font-semibold mb-1">Erro de conexão</p>
          <p className="text-sm text-[#8e8e8e] mb-4">{error}</p>
          <Button variant="secondary" onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[470px] mx-auto px-4 py-4">
      {/* Create post quick bar */}
      <div className="bg-white border border-[#dbdbdb] rounded-xl p-3 mb-4 flex items-center gap-3">
        <Avatar src={profile?.avatar_url} size="sm" alt={profile?.username} />
        <button
          onClick={() => setShowNewPost(true)}
          className="flex-1 text-left text-sm text-[#8e8e8e] bg-[#fafafa] border border-[#dbdbdb] rounded-lg px-3 py-2 hover:bg-[#efefef]"
        >
          O que você quer compartilhar?
        </button>
        <button
          onClick={() => setShowNewPost(true)}
          className="p-2 text-[#8e8e8e] hover:text-[#262626]"
        >
          <ImagePlus className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-[#dbdbdb] rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#efefef] flex items-center justify-center">
            <ImagePlus className="w-8 h-8 text-[#8e8e8e]" />
          </div>
          <p className="text-lg font-semibold text-[#262626] mb-1">
            Nenhuma postagem ainda
          </p>
          <p className="text-sm text-[#8e8e8e] mb-4">
            Seja o primeiro a compartilhar algo!
          </p>
          <Button onClick={() => setShowNewPost(true)}>
            Criar postagem
          </Button>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={toggleLike}
            onDelete={handleDelete}
            onSave={handleSave}
            onOpenPost={(postId) => navigate(`/post/${postId}`)}
          />
        ))
      )}

      <NewPostModal
        open={showNewPost}
        onClose={() => setShowNewPost(false)}
        onSuccess={refetch}
      />
    </div>
  );
}
