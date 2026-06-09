import React, { useState, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useUpload } from "@/hooks/useUpload";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import { getFilePreview, validateImageFile } from "@/utils/imageUtils";
import { ImagePlus, X, ArrowLeft } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

interface NewPostModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = "select" | "preview" | "caption";

export function NewPostModal({ open, onClose, onSuccess }: NewPostModalProps) {
  const { user } = useAuth();
  const { uploadPost, uploading } = useUpload();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("select");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fileError, setFileError] = useState("");

  const reset = () => {
    setStep("select");
    setFile(null);
    setPreview("");
    setCaption("");
    setFileError("");
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const error = validateImageFile(selected);
    if (error) {
      setFileError(error);
      return;
    }

    setFileError("");
    setFile(selected);
    const prev = await getFilePreview(selected);
    setPreview(prev);
    setStep("caption");
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (!dropped) return;

    const error = validateImageFile(dropped);
    if (error) {
      setFileError(error);
      return;
    }

    setFileError("");
    setFile(dropped);
    const prev = await getFilePreview(dropped);
    setPreview(prev);
    setStep("caption");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSubmit = async () => {
    if (!file || !user) return;

    setSubmitting(true);

    const { url, error: uploadError } = await uploadPost(file);

    if (uploadError || !url) {
      toast.error(uploadError || "Erro ao fazer upload.");
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await db.from("posts").insert({
      user_id: user.id,
      image_url: url,
      caption: caption.trim() || null,
      likes_count: 0,
    });

    setSubmitting(false);

    if (insertError) {
      toast.error("Erro ao criar postagem. Tente novamente.");
      return;
    }

    toast.success("Postagem criada com sucesso!");
    onSuccess?.();
    handleClose();
  };

  const isLoading = uploading || submitting;

  return (
    <Modal open={open} onClose={handleClose} size="md">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#dbdbdb]">
        {step !== "select" && (
          <button
            onClick={() => setStep("select")}
            className="text-[#262626] hover:text-[#8e8e8e]"
            disabled={isLoading}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        {step === "select" && <div />}
        <h2 className="text-sm font-semibold text-[#262626] absolute left-1/2 -translate-x-1/2">
          {step === "select" ? "Nova postagem" : "Criar postagem"}
        </h2>
        {step === "caption" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!file}
          >
            Compartilhar
          </Button>
        ) : (
          <button onClick={handleClose} className="text-[#262626]">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {step === "select" && (
        <div
          className="flex flex-col items-center justify-center p-8 min-h-[300px] cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-[#efefef] flex items-center justify-center">
              <ImagePlus className="w-10 h-10 text-[#8e8e8e]" />
            </div>
            <div className="text-center">
              <p className="text-xl font-light text-[#262626] mb-1">
                Arraste as fotos aqui
              </p>
              <p className="text-sm text-[#8e8e8e]">
                JPG, PNG, WebP • Máx. 5MB
              </p>
            </div>
            {fileError && (
              <p className="text-sm text-red-500 text-center">{fileError}</p>
            )}
            <Button variant="primary" size="sm">
              Selecionar do computador
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      )}

      {step === "caption" && (
        <div className="flex flex-col md:flex-row">
          {/* Image preview */}
          <div className="md:w-64 w-full aspect-square bg-black flex-shrink-0">
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Caption */}
          <div className="flex-1 p-4 flex flex-col">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Escreva uma legenda..."
              className="flex-1 text-sm text-[#262626] placeholder:text-[#8e8e8e] border-none outline-none resize-none min-h-[120px]"
              maxLength={2200}
            />
            <div className="flex justify-between items-center pt-2 border-t border-[#efefef]">
              <span className="text-xs text-[#8e8e8e]">
                {caption.length}/2200
              </span>
            </div>

            {isLoading && (
              <div className="mt-3">
                <div className="h-1 bg-[#efefef] rounded-full overflow-hidden">
                  <div
                    className="h-full ig-gradient rounded-full transition-all duration-300"
                    style={{ width: "60%" }}
                  />
                </div>
                <p className="text-xs text-[#8e8e8e] mt-1">Fazendo upload...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
