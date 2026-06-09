import React, { useState, useRef, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useUpload } from "@/hooks/useUpload";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import { Camera, X } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditProfileModal({ open, onClose, onSuccess }: EditProfileModalProps) {
  const { user, profile, refreshProfile } = useAuth();
  const { uploadAvatar, uploading } = useUpload();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    username: "",
    full_name: "",
    bio: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile && open) {
      setForm({
        username: profile.username || "",
        full_name: profile.full_name || "",
        bio: profile.bio || "",
      });
      setAvatarPreview(null);
      setAvatarFile(null);
      setErrors({});
    }
  }, [profile, open]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.username.trim()) errs.username = "Username é obrigatório.";
    else if (form.username.trim().length < 3) errs.username = "Mínimo 3 caracteres.";
    else if (!/^[a-zA-Z0-9._]+$/.test(form.username))
      errs.username = "Apenas letras, números, pontos e underscores.";
    if (form.bio.length > 150) errs.bio = "Bio deve ter no máximo 150 caracteres.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setAvatarFile(file);
  };

  const handleRemoveAvatarPreview = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!validate() || !user) return;
    setSaving(true);

    try {
      let avatarUrl = profile?.avatar_url || null;

      // Upload avatar if changed
      if (avatarFile) {
        const { url, error: uploadErr } = await uploadAvatar(avatarFile);
        if (uploadErr) {
          toast.error(uploadErr);
          setSaving(false);
          return;
        }
        avatarUrl = url;
      }

      // Check username uniqueness (if changed)
      if (form.username.toLowerCase() !== profile?.username?.toLowerCase()) {
        const { data: existingUser } = await db
          .from("profiles")
          .select("id")
          .eq("username", form.username.toLowerCase().trim())
          .single();

        if (existingUser) {
          setErrors({ username: "Este nome de usuário já está em uso." });
          setSaving(false);
          return;
        }
      }

      const updates = {
        username: form.username.toLowerCase().trim(),
        full_name: form.full_name.trim() || null,
        bio: form.bio.trim() || null,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await db
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (updateError) {
        if (updateError.message?.includes("unique")) {
          toast.error("Este nome de usuário já está em uso.");
        } else {
          toast.error("Erro ao salvar perfil. Tente novamente.");
        }
        setSaving(false);
        return;
      }

      await refreshProfile();
      toast.success("Perfil atualizado com sucesso!");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Save profile error:", err);
      toast.error("Erro ao salvar perfil.");
    } finally {
      setSaving(false);
    }
  };

  const isLoading = saving || uploading;

  return (
    <Modal open={open} onClose={onClose} title="Editar perfil" size="md">
      <div className="p-6 space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <Avatar
              src={avatarPreview || profile?.avatar_url}
              size="lg"
              alt={profile?.username}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0095f6] flex items-center justify-center shadow-md hover:bg-[#0084cc] transition-colors"
              title="Alterar foto"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
            {avatarPreview && (
              <button
                onClick={handleRemoveAvatarPreview}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                title="Remover foto selecionada"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarSelect}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#262626]">
              {profile?.username}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-semibold text-[#0095f6] hover:text-[#00376b]"
            >
              Alterar foto do perfil
            </button>
            {avatarPreview && (
              <button
                onClick={handleRemoveAvatarPreview}
                className="text-xs text-red-500 font-medium hover:text-red-600 block mt-1"
              >
                Remover seleção
              </button>
            )}
          </div>
        </div>

        {/* Form */}
        <Input
          label="Nome de usuário"
          value={form.username}
          onChange={(e) => {
            setForm((p) => ({ ...p, username: e.target.value }));
            setErrors((p) => ({ ...p, username: "" }));
          }}
          error={errors.username}
          placeholder="nome.usuario"
        />

        <Input
          label="Nome completo"
          value={form.full_name}
          onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
          placeholder="Seu nome"
        />

        <div>
          <label className="block text-xs font-medium text-[#262626] mb-1">
            Bio
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => {
              setForm((p) => ({ ...p, bio: e.target.value }));
              if (e.target.value.length <= 150) {
                setErrors((p) => ({ ...p, bio: "" }));
              }
            }}
            placeholder="Conte um pouco sobre você..."
            maxLength={150}
            rows={3}
            className="w-full px-3 py-2.5 text-sm bg-[#fafafa] border border-[#dbdbdb] rounded-lg outline-none focus:border-[#a8a8a8] resize-none text-[#262626] placeholder:text-[#8e8e8e]"
          />
          <div className="flex justify-between items-center mt-1">
            {errors.bio && <p className="text-xs text-red-500">{errors.bio}</p>}
            <span className="text-xs text-[#8e8e8e] ml-auto">
              {form.bio.length}/150
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" fullWidth onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button fullWidth onClick={handleSave} loading={isLoading}>
            Salvar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
