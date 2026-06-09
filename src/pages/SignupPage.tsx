import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    fullName: "",
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email.trim()) errs.email = "Email é obrigatório.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Email inválido.";

    if (!form.fullName.trim()) errs.fullName = "Nome completo é obrigatório.";
    else if (form.fullName.trim().length < 2) errs.fullName = "Nome muito curto.";

    if (!form.username.trim()) errs.username = "Nome de usuário é obrigatório.";
    else if (form.username.trim().length < 3) errs.username = "Username deve ter pelo menos 3 caracteres.";
    else if (!/^[a-zA-Z0-9._]+$/.test(form.username)) errs.username = "Apenas letras, números, pontos e underscores.";

    if (!form.password) errs.password = "Senha é obrigatória.";
    else if (form.password.length < 6) errs.password = "Senha deve ter pelo menos 6 caracteres.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await signUp(
      form.email.trim(),
      form.password,
      form.username.trim(),
      form.fullName.trim()
    );
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Conta criada! Verifique seu email para confirmar.");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-[#dbdbdb] rounded-xl p-8 mb-3">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold ig-gradient-text mb-3" style={{ fontFamily: "cursive" }}>
              InstaClone
            </h1>
            <p className="text-base font-semibold text-[#8e8e8e] leading-snug">
              Cadastre-se para ver fotos e vídeos dos seus amigos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange("email")}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              type="text"
              placeholder="Nome completo"
              value={form.fullName}
              onChange={handleChange("fullName")}
              error={errors.fullName}
              autoComplete="name"
            />
            <Input
              type="text"
              placeholder="Nome de usuário"
              value={form.username}
              onChange={handleChange("username")}
              error={errors.username}
              autoComplete="username"
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={form.password}
                onChange={handleChange("password")}
                error={errors.password}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#8e8e8e] hover:text-[#262626]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-xs text-[#8e8e8e] text-center px-2">
              Ao se cadastrar, você concorda com nossos Termos e Política de Privacidade.
            </p>

            <Button
              type="submit"
              fullWidth
              loading={loading}
            >
              Cadastrar
            </Button>
          </form>
        </div>

        <div className="bg-white border border-[#dbdbdb] rounded-xl p-4 text-center">
          <p className="text-sm text-[#262626]">
            Já tem uma conta?{" "}
            <Link to="/login" className="font-semibold ig-gradient-text">
              Entre agora.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
