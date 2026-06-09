import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import type { PostWithProfile } from "@/types/database";

interface PostCardProps {
  post: PostWithProfile;
  onLike: (postId: string, liked: boolean) => void;
  onDelete?: (postId: string) => void;
  onSave?: (postId: string, saved: boolean) => void;
  onOpenPost?: (postId: string) => void;
}

export function PostCard({ post, onLike, onDelete, onSave, onOpenPost }: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const isOwner = user?.id === post.user_id;
  const profile = post.profiles;

  const handleLike = () => {
    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 300);
    onLike(post.id, post.liked_by_user ?? false);
  };

  const handleDoubleTap = () => {
    if (!post.liked_by_user) {
      handleLike();
    }
  };

  const handleDelete = async () => {
    setShowMenu(false);
    if (onDelete) {
      onDelete(post.id);
    }
  };

  const handleCopyLink = async () => {
    const url = window.location.origin + `/post/${post.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.username || "Usuário"} no InstaClone`,
          text: post.caption || "Veja esta postagem.",
          url,
        });
        toast.success("Link compartilhado com sucesso!");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Sharing failed", err);
          toast.error("Não foi possível compartilhar.");
        }
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.info("Link copiado com sucesso");
    }

    setShowMenu(false);
  };

  const handleSave = () => {
    if (onSave) onSave(post.id, post.saved_by_user ?? false);
  };

  const handleOpenPost = () => {
    if (onOpenPost) onOpenPost(post.id);
  };

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <article className="bg-white border border-[#dbdbdb] rounded-xl mb-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link
          to={`/profile/${profile?.username || post.user_id}`}
          className="flex items-center gap-3"
        >
          <Avatar
            src={profile?.avatar_url}
            alt={profile?.username}
            size="sm"
          />
          <div>
            <p className="text-sm font-semibold text-[#262626] hover:text-[#8e8e8e]">
              {profile?.username || "Usuário"}
            </p>
            {profile?.full_name && (
              <p className="text-xs text-[#8e8e8e]">{profile.full_name}</p>
            )}
          </div>
        </Link>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-[#262626] hover:text-[#8e8e8e]"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 bg-white border border-[#dbdbdb] rounded-xl shadow-lg z-20 overflow-hidden min-w-[150px]">
                <button
                  onClick={handleCopyLink}
                  className="w-full px-4 py-2.5 text-sm text-[#262626] hover:bg-[#fafafa] text-left"
                >
                  Copiar link
                </button>
                {isOwner && (
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2.5 text-sm text-red-500 hover:bg-[#fafafa] text-left flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image */}
      <div
        className="relative bg-[#fafafa] cursor-pointer"
        onDoubleClick={handleDoubleTap}
      >
        {!imgError ? (
          <img
            src={post.image_url}
            alt={post.caption || "Postagem"}
            className="w-full aspect-square object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full aspect-square bg-[#efefef] flex items-center justify-center">
            <p className="text-sm text-[#8e8e8e]">Imagem não disponível</p>
          </div>
        )}

        {/* Double-tap heart animation */}
        {isLikeAnimating && !post.liked_by_user && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart className="w-24 h-24 text-white fill-white opacity-90 animate-ping" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={handleLike}
            className="hover:opacity-70"
            aria-label={post.liked_by_user ? "Descurtir" : "Curtir"}
          >
            <Heart
              className={`w-6 h-6 transition-all duration-200 ${
                post.liked_by_user
                  ? "fill-red-500 text-red-500 scale-110"
                  : "text-[#262626]"
              }`}
            />
          </button>
          <button
            onClick={handleOpenPost}
            className="hover:opacity-70"
            aria-label="Abrir postagem"
          >
            <MessageCircle className="w-6 h-6 text-[#262626]" />
          </button>
          <button
            onClick={handleCopyLink}
            className="hover:opacity-70"
            aria-label="Compartilhar"
          >
            <Send className="w-6 h-6 text-[#262626]" />
          </button>
          <button
            onClick={handleSave}
            className="ml-auto hover:opacity-70"
            aria-label={post.saved_by_user ? "Remover dos salvos" : "Salvar"}
          >
            <Bookmark
              className={`w-6 h-6 transition-all duration-200 ${
                post.saved_by_user
                  ? "fill-[#262626] text-[#262626]"
                  : "text-[#262626]"
              }`}
            />
          </button>
        </div>

        {post.comments_count !== undefined && (
          <p className="text-sm text-[#262626] mb-1">
            {post.comments_count} comentário{post.comments_count === 1 ? "" : "s"}
          </p>
        )}

        {/* Likes count */}
        {post.likes_count > 0 && (
          <p className="text-sm font-semibold text-[#262626] mb-1">
            {post.likes_count.toLocaleString("pt-BR")}{" "}
            {post.likes_count === 1 ? "curtida" : "curtidas"}
          </p>
        )}

        {/* Caption */}
        {post.caption && (
          <p className="text-sm text-[#262626] mb-1">
            <Link
              to={`/profile/${profile?.username || post.user_id}`}
              className="font-semibold hover:text-[#8e8e8e] mr-2"
            >
              {profile?.username || "Usuário"}
            </Link>
            {post.caption}
          </p>
        )}

        {/* Timestamp */}
        <p className="text-xs text-[#8e8e8e] uppercase mt-1 mb-2">{timeAgo}</p>
      </div>
    </article>
  );
}
