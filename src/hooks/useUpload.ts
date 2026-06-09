import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { validateImageFile, compressImage } from "@/utils/imageUtils";
import { useAuth } from "@/contexts/AuthContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

interface UploadResult {
  url: string | null;
  error: string | null;
}

export function useUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadAvatar = async (file: File): Promise<UploadResult> => {
    const validationError = validateImageFile(file);
    if (validationError) return { url: null, error: validationError };

    setUploading(true);
    setProgress(0);

    try {
      const compressed = await compressImage(file, 400, 0.9);
      const ext = "jpg";
      const fileName = `${user?.id}/avatar.${ext}`;

      setProgress(30);

      const { error: uploadError } = await db.storage
        .from("avatars")
        .upload(fileName, compressed, {
          upsert: true,
          contentType: "image/jpeg",
        });

      setProgress(80);

      if (uploadError) {
        if (uploadError.message?.includes("Bucket not found")) {
          return { url: null, error: 'Bucket "avatars" não encontrado. Configure o Supabase Storage.' };
        }
        if (uploadError.message?.includes("not allowed") || uploadError.message?.includes("policy")) {
          return { url: null, error: "Sem permissão para upload. Verifique as políticas do Supabase Storage." };
        }
        throw uploadError;
      }

      const { data } = db.storage.from("avatars").getPublicUrl(fileName);
      setProgress(100);

      return { url: data.publicUrl + `?t=${Date.now()}`, error: null };
    } catch (err) {
      console.error("Avatar upload error:", err);
      const message = err instanceof Error ? err.message : "Erro ao fazer upload.";
      return {
        url: null,
        error: message.includes("network") || message.includes("fetch")
          ? "Falha de conexão. Tente novamente."
          : "Erro ao fazer upload da imagem.",
      };
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const uploadPost = async (file: File): Promise<UploadResult> => {
    const validationError = validateImageFile(file);
    if (validationError) return { url: null, error: validationError };

    setUploading(true);
    setProgress(0);

    try {
      const compressed = await compressImage(file, 1080, 0.85);
      const fileName = `${user?.id}/${Date.now()}.jpg`;

      setProgress(30);

      const { error: uploadError } = await db.storage
        .from("posts")
        .upload(fileName, compressed, {
          contentType: "image/jpeg",
        });

      setProgress(80);

      if (uploadError) {
        if (uploadError.message?.includes("Bucket not found")) {
          return { url: null, error: 'Bucket "posts" não encontrado. Configure o Supabase Storage.' };
        }
        if (uploadError.message?.includes("not allowed") || uploadError.message?.includes("policy")) {
          return { url: null, error: "Sem permissão para upload. Verifique as políticas do Supabase Storage." };
        }
        throw uploadError;
      }

      const { data } = db.storage.from("posts").getPublicUrl(fileName);
      setProgress(100);

      return { url: data.publicUrl, error: null };
    } catch (err) {
      console.error("Post upload error:", err);
      const message = err instanceof Error ? err.message : "";
      return {
        url: null,
        error: message.includes("network") || message.includes("fetch")
          ? "Falha de conexão. Tente novamente."
          : "Erro ao fazer upload da imagem.",
      };
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return { uploadAvatar, uploadPost, uploading, progress };
}
