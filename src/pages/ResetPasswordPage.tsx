import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event from Supabase
    // The URL hash contains the access token
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      } else if (session) {
        setSessionReady(true);
      }
    });

    // Also check if we have a session already (from the URL hash)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const validate = () => {
    const errs: { password?: string; confirm?: string } = {};
    if (!password) errs.password = "Nova senha é obrigatória.";
    else if (password.length < 6) errs.password = "A senha deve ter pelo menos 6 caracteres.";

    if (!confirmPassword) errs.confirm = "Confirmação é obrigatória.";
    else if (password !== confirmPassword) errs.confirm = "As senhas não coincidem.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      if (error.message.includes("expired") || error.message.includes("invalid")) {
        toast.error("Link expirado ou inválido. Solicite um novo email de redefinição.");
      } else {
        toast.error("Erro ao atualizar senha. Tente novamente.");
      }
    } else {
      setSuccess(true);
      toast.success("Senha atualizada com sucesso!");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-white border border-[#dbdbdb] rounded-xl p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-[#262626] mb-2">
              Senha atualizada!
            </h2>
            <p className="text-sm text-[#8e8e8e] mb-4">
              Sua senha foi atualizada com sucesso. Redirecionando para o login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-white border border-[#dbdbdb] rounded-xl p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#833AB4] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm text-[#8e8e8e]">Verificando link...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-[#dbdbdb] rounded-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold ig-gradient-text mb-4" style={{ fontFamily: "cursive" }}>
              InstaClone
            </h1>
            <h2 className="text-lg font-semibold text-[#262626] mb-1">
              Redefinir senha
            </h2>
            <p className="text-sm text-[#8e8e8e]">
              Digite sua nova senha abaixo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Nova senha"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((p) => ({ ...p, password: undefined }));
                }}
                error={errors.password}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#8e8e8e]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Confirmar nova senha"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((p) => ({ ...p, confirm: undefined }));
              }}
              error={errors.confirm}
              autoComplete="new-password"
            />

            <Button type="submit" fullWidth loading={loading}>
              Salvar nova senha
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
