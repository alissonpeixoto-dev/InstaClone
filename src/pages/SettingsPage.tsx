import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Eye, EyeOff, LogOut, ChevronRight, Lock, User } from "lucide-react";

type Tab = "account" | "password";

export default function SettingsPage() {
  const { signOut, updatePassword, user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("account");
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Até logo!");
    navigate("/login");
  };

  const validatePasswords = () => {
    const errs: Record<string, string> = {};
    if (!passwords.new) errs.new = "Nova senha é obrigatória.";
    else if (passwords.new.length < 6) errs.new = "Mínimo 6 caracteres.";
    if (!passwords.confirm) errs.confirm = "Confirmação é obrigatória.";
    else if (passwords.new !== passwords.confirm) errs.confirm = "As senhas não coincidem.";
    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswords()) return;
    setSavingPassword(true);
    const { error } = await updatePassword(passwords.new);
    setSavingPassword(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Senha atualizada com sucesso!");
      setPasswords({ current: "", new: "", confirm: "" });
    }
  };

  return (
    <div className="max-w-[935px] mx-auto flex min-h-screen">
      {/* Settings Sidebar */}
      <aside className="hidden md:block w-[236px] border-r border-[#dbdbdb] py-8">
        <h2 className="text-lg font-semibold text-[#262626] px-6 mb-6">
          Configurações
        </h2>
        <nav>
          <button
            onClick={() => setTab("account")}
            className={`w-full flex items-center gap-3 px-6 py-3 text-sm border-l-2 transition-colors ${
              tab === "account"
                ? "border-[#262626] text-[#262626] font-semibold"
                : "border-transparent text-[#262626] hover:bg-[#fafafa]"
            }`}
          >
            <User className="w-4 h-4" />
            Informações da conta
          </button>
          <button
            onClick={() => setTab("password")}
            className={`w-full flex items-center gap-3 px-6 py-3 text-sm border-l-2 transition-colors ${
              tab === "password"
                ? "border-[#262626] text-[#262626] font-semibold"
                : "border-transparent text-[#262626] hover:bg-[#fafafa]"
            }`}
          >
            <Lock className="w-4 h-4" />
            Alterar senha
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4 md:px-12">
        {/* Mobile tabs */}
        <div className="md:hidden flex gap-2 mb-6">
          <button
            onClick={() => setTab("account")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg border ${
              tab === "account"
                ? "border-[#262626] bg-[#262626] text-white"
                : "border-[#dbdbdb] text-[#262626]"
            }`}
          >
            Conta
          </button>
          <button
            onClick={() => setTab("password")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg border ${
              tab === "password"
                ? "border-[#262626] bg-[#262626] text-white"
                : "border-[#dbdbdb] text-[#262626]"
            }`}
          >
            Senha
          </button>
        </div>

        {tab === "account" && (
          <div>
            <h3 className="text-xl font-semibold text-[#262626] mb-6">
              Informações da conta
            </h3>

            <div className="space-y-4 max-w-md">
              <div className="bg-[#fafafa] border border-[#dbdbdb] rounded-xl p-4">
                <p className="text-xs text-[#8e8e8e] mb-1">Nome de usuário</p>
                <p className="text-sm font-semibold text-[#262626]">
                  {profile?.username || "—"}
                </p>
              </div>
              <div className="bg-[#fafafa] border border-[#dbdbdb] rounded-xl p-4">
                <p className="text-xs text-[#8e8e8e] mb-1">Email</p>
                <p className="text-sm text-[#262626]">{user?.email || "—"}</p>
              </div>
              <div className="bg-[#fafafa] border border-[#dbdbdb] rounded-xl p-4">
                <p className="text-xs text-[#8e8e8e] mb-1">Nome completo</p>
                <p className="text-sm text-[#262626]">{profile?.full_name || "—"}</p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate(`/profile/${profile?.username || user?.id}`)}
                  className="w-full flex items-center justify-between p-4 bg-white border border-[#dbdbdb] rounded-xl hover:bg-[#fafafa]"
                >
                  <span className="text-sm text-[#0095f6] font-medium">
                    Editar perfil
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#8e8e8e]" />
                </button>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-[#dbdbdb] max-w-md">
              <h3 className="text-base font-semibold text-[#262626] mb-3">
                Sessão
              </h3>
              <Button
                variant="danger"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair da conta
              </Button>
            </div>
          </div>
        )}

        {tab === "password" && (
          <div>
            <h3 className="text-xl font-semibold text-[#262626] mb-6">
              Alterar senha
            </h3>

            <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
              <div className="relative">
                <Input
                  label="Nova senha"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) => {
                    setPasswords((p) => ({ ...p, new: e.target.value }));
                    setPasswordErrors((p) => ({ ...p, new: "" }));
                  }}
                  error={passwordErrors.new}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((p) => ({ ...p, new: !p.new }))
                  }
                  className="absolute right-3 top-8 text-[#8e8e8e]"
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirmar nova senha"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) => {
                    setPasswords((p) => ({ ...p, confirm: e.target.value }));
                    setPasswordErrors((p) => ({ ...p, confirm: "" }));
                  }}
                  error={passwordErrors.confirm}
                  placeholder="Digite a senha novamente"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))
                  }
                  className="absolute right-3 top-8 text-[#8e8e8e]"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              <Button type="submit" loading={savingPassword}>
                Alterar senha
              </Button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
