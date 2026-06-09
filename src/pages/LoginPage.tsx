import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) errs.email = "Email é obrigatório.";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Email inválido.";
    if (!password) errs.password = "Senha é obrigatória.";
    else if (password.length < 6) errs.password = "Senha deve ter pelo menos 6 caracteres.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Login realizado com sucesso!");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo Card */}
        <div className="bg-white border border-[#dbdbdb] rounded-xl p-8 mb-3">
          {/* Instagram-style Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold ig-gradient-text" style={{ fontFamily: "cursive" }}>
              InstaClone
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#8e8e8e] hover:text-[#262626]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              className="mt-2"
            >
              Entrar
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link
              to="/forgot-password"
              className="text-xs text-[#0095f6] hover:text-[#00376b] font-medium"
            >
              Esqueceu a senha?
            </Link>
          </div>
        </div>

        {/* Sign up Card */}
        <div className="bg-white border border-[#dbdbdb] rounded-xl p-4 text-center">
          <p className="text-sm text-[#262626]">
            Não tem uma conta?{" "}
            <Link
              to="/signup"
              className="font-semibold ig-gradient-text"
            >
              Cadastre-se
            </Link>
          </p>
        </div>

        {/* Env notice */}
        {!import.meta.env.VITE_SUPABASE_URL && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 text-center">
              ⚠️ Configure o arquivo <code className="font-mono">.env.local</code> com suas credenciais do Supabase.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
