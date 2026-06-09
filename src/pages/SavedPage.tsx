import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import { useLikes } from "@/hooks/useLikes";
import { PostCard } from "@/components/post/PostCard";
import { PostSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { Bookmark, ImagePlus } from "lucide-react";

export default function SavedPage() {
  const { posts, loading, error, refetch, toggleFavorite } = useFavorites();
  const { toggleLike } = useLikes();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSave = async (postId: string, saved: boolean) => {
    const { error } = await toggleFavorite(postId, saved);
    if (error) {
      toast.error(error);
    } else {
      toast.success(saved ? "Removido dos salvos." : "Post salvo.");
      await refetch();
    }
  };

  const handleLike = async (postId: string, liked: boolean) => {
    const { error } = await toggleLike(postId, liked);
    if (error) {
      toast.error(error);
    } else {
      toast.success(liked ? "Curtida removida." : "Post curtido.");
      refetch();
    }
  };

  const openPost = (postId: string) => navigate(`/post/${postId}`);

  return (
    <div className="max-w-[935px] mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#262626]">Salvos</h1>
          <p className="text-sm text-[#8e8e8e]">Todas as postagens que você salvou.</p>
        </div>
      </div>

      {loading ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : error ? (
        <div className="bg-white border border-[#dbdbdb] rounded-xl p-8 text-center">
          <p className="text-sm text-[#262626] font-semibold mb-2">Erro ao carregar salvos</p>
          <p className="text-sm text-[#8e8e8e] mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 rounded-lg bg-[#efefef] hover:bg-[#dbdbdb]"
          >
            Tentar novamente
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-[#dbdbdb] rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#efefef] flex items-center justify-center">
            <Bookmark className="w-8 h-8 text-[#8e8e8e]" />
          </div>
          <p className="text-lg font-semibold text-[#262626] mb-1">Nenhum salvo ainda</p>
          <p className="text-sm text-[#8e8e8e] mb-4">
            Salve posts para vê-los depois.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-lg bg-[#0095f6] text-white hover:bg-[#0077cc]"
          >
            Ir para o feed
          </button>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onSave={handleSave}
            onOpenPost={openPost}
          />
        ))
      )}
    </div>
  );
}
