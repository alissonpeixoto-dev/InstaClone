import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePost } from "@/hooks/usePost";
import { useComments } from "@/hooks/useComments";
import { useToast } from "@/components/ui/Toast";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { PostSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { Heart, Bookmark, Share2, ArrowLeft, Trash2 } from "lucide-react";

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const { post, loading, error, toggleLike, toggleSave, refetch } = usePost(id);
  const { comments, loading: commentsLoading, addComment, deleteComment } = useComments(id);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      toast.error("Comentário não pode ficar vazio.");
      return;
    }

    setCommentSubmitting(true);
    const { error: addError } = await addComment(commentText);
    setCommentSubmitting(false);

    if (addError) {
      toast.error(addError);
    } else {
      toast.success("Comentário publicado.");
      setCommentText("");
      refetch();
    }
  };

  const handleToggleLike = async () => {
    if (!post) return;
    const { error: likeError } = await toggleLike(post.id, !!post.liked_by_user);
    if (likeError) toast.error(likeError);
    else {
      toast.success(post.liked_by_user ? "Curtida removida." : "Post curtido.");
      refetch();
    }
  };

  const handleToggleSave = async () => {
    if (!post) return;
    const { error: saveError } = await toggleSave(post.id, !!post.saved_by_user);
    if (saveError) toast.error(saveError);
    else {
      toast.success(post.saved_by_user ? "Removido dos salvos." : "Salvo com sucesso.");
      refetch();
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error: deleteError } = await deleteComment(commentId);
    if (deleteError) {
      toast.error(deleteError);
      return;
    }
    toast.success("Comentário removido.");
    refetch();
  };

  if (loading) {
    return <PostSkeleton />;
  }

  if (error || !post) {
    return (
      <div className="max-w-[935px] mx-auto px-4 py-8 text-center">
        <p className="text-lg font-semibold text-[#262626] mb-2">Não foi possível carregar a postagem.</p>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ptBR,
  });
  const shareUrl = `${window.location.origin}/post/${post.id}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.profiles?.username || "Usuário"} no InstaClone`,
          text: post.caption || "Veja esta postagem.",
          url: shareUrl,
        });
        toast.success("Link compartilhado com sucesso!");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Share error", err);
          toast.error("Não foi possível compartilhar.");
        }
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copiado com sucesso.");
    }
  };

  return (
    <div className="max-w-[935px] mx-auto px-4 py-4">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-[#262626] hover:text-[#8e8e8e]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-[#262626]">Postagem</h1>
      </div>

      <div className="bg-white border border-[#dbdbdb] rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#dbdbdb]">
          <Link to={`/profile/${post.profiles?.username || post.user_id}`} className="flex items-center gap-3">
            <Avatar src={post.profiles?.avatar_url} size="sm" alt={post.profiles?.username} />
            <div>
              <p className="text-sm font-semibold text-[#262626]">{post.profiles?.username || "Usuário"}</p>
              {post.profiles?.full_name && (
                <p className="text-xs text-[#8e8e8e]">{post.profiles.full_name}</p>
              )}
            </div>
          </Link>
        </div>

        <div className="bg-black flex items-center justify-center">
          <img src={post.image_url} alt={post.caption || "Post"} className="w-full object-contain" />
        </div>

        <div className="px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={handleToggleLike} className="hover:opacity-70">
              <Heart className={`w-6 h-6 ${post.liked_by_user ? "fill-red-500 text-red-500" : "text-[#262626]"}`} />
            </button>
            <button onClick={handleShare} className="hover:opacity-70">
              <Share2 className="w-6 h-6 text-[#262626]" />
            </button>
            <button onClick={handleToggleSave} className="hover:opacity-70 ml-auto">
              <Bookmark className={`w-6 h-6 ${post.saved_by_user ? "fill-[#262626] text-[#262626]" : "text-[#262626]"}`} />
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-[#262626]">
              {post.likes_count.toLocaleString("pt-BR")} curtida{post.likes_count === 1 ? "" : "s"}
            </p>
            {post.caption && (
              <p className="text-sm text-[#262626]">
                <span className="font-semibold">{post.profiles?.username || "Usuário"}</span> {post.caption}
              </p>
            )}
            <p className="text-xs text-[#8e8e8e] uppercase">{timeAgo}</p>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-semibold text-[#262626] mb-3">Comentários</h2>

            <div className="space-y-3">
              {commentsLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-3 bg-[#fafafa] rounded-xl">
                    <Skeleton className="h-3 w-24 mb-2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))
              ) : comments.length === 0 ? (
                <p className="text-sm text-[#8e8e8e]">Seja a primeira pessoa a comentar.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 items-start p-3 bg-[#fafafa] rounded-xl">
                    <Avatar src={comment.profile?.avatar_url} size="sm" alt={comment.profile?.username} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-[#262626]">{comment.profile?.username || "Usuário"}</span>
                        <span className="text-xs text-[#8e8e8e]">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}</span>
                      </div>
                      <p className="text-sm text-[#262626]">{comment.content}</p>
                    </div>
                    {comment.is_owner && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-500 hover:text-red-700"
                        aria-label="Excluir comentário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-4">
              <textarea
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Adicione um comentário..."
                className="w-full bg-[#fafafa] border border-[#dbdbdb] rounded-xl p-3 text-sm text-[#262626] outline-none resize-none min-h-[120px]"
                maxLength={300}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-[#8e8e8e]">{commentText.length}/300</span>
                <Button onClick={handleAddComment} loading={commentSubmitting}>
                  Comentar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
