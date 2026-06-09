import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email é obrigatório.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email inválido.");
      return;
    }

    setLoading(true);
    const { error: err } = await resetPassword(email.trim());
    setLoading(false);

    if (err) {
      toast.error(err);
    } else {
      setSent(true);
      toast.success("Email de recuperação enviado!");
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-white border border-[#dbdbdb] rounded-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-tr from-[#833AB4] to-[#F77737] flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-[#262626] mb-2">
              Email enviado!
            </h2>
            <p className="text-sm text-[#8e8e8e] mb-6">
              Verifique sua caixa de entrada e clique no link para redefinir sua senha.
            </p>
            <p className="text-xs text-[#8e8e8e] mb-4">
              O link irá direcioná-lo para a página de redefinição de senha.
            </p>
            <Link
              to="/login"
              className="text-sm font-semibold text-[#0095f6] hover:text-[#00376b]"
            >
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-[#dbdbdb] rounded-xl p-8 mb-3">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-[#262626] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[#262626] mb-1">
              Problemas para entrar?
            </h2>
            <p className="text-sm text-[#8e8e8e]">
              Digite seu endereço de email e enviaremos um link para você voltar a ter acesso à sua conta.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              error={error}
              autoComplete="email"
            />
            <Button type="submit" fullWidth loading={loading}>
              Enviar link de redefinição
            </Button>
          </form>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#dbdbdb]" />
            <span className="text-xs font-semibold text-[#8e8e8e]">OU</span>
            <div className="flex-1 h-px bg-[#dbdbdb]" />
          </div>

          <div className="mt-4 text-center">
            <Link to="/signup" className="text-sm font-semibold text-[#262626] hover:text-[#8e8e8e]">
              Criar nova conta
            </Link>
          </div>
        </div>

        <div className="bg-white border border-[#dbdbdb] rounded-xl p-4 text-center">
          <Link
            to="/login"
            className="text-sm font-semibold text-[#262626] flex items-center justify-center gap-1 hover:text-[#8e8e8e]"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  );
}
