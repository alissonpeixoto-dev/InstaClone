import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/utils/cn";
import {
  Home,
  Search,
  Bookmark,
  PlusSquare,
  Heart,
  User,
  LogOut,
  Settings,
} from "lucide-react";

interface SidebarProps {
  onNewPost: () => void;
}

export function Sidebar({ onNewPost }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile, user } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Até logo!");
    navigate("/login");
  };

  const navItems = [
    { icon: Home, label: "Início", href: "/" },
    { icon: Search, label: "Explorar", href: "/explore" },
    { icon: Bookmark, label: "Salvos", href: "/saved" },
    { icon: Search, label: "Buscar", href: "/search" },
    {
      icon: PlusSquare,
      label: "Criar",
      onClick: onNewPost,
    },
    { icon: Heart, label: "Atividade", href: "/activity" },
    {
      icon: User,
      label: "Perfil",
      href: `/profile/${profile?.username || user?.id}`,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[244px] fixed top-0 left-0 h-screen bg-white border-r border-[#dbdbdb] py-6 px-3 z-40">
      {/* Logo */}
      <Link to="/" className="px-3 mb-8 block">
        <h1 className="text-2xl font-bold ig-gradient-text" style={{ fontFamily: "cursive" }}>
          InstaClone
        </h1>
      </Link>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item, i) => {
          const isActive = item.href ? location.pathname === item.href : false;

          if (item.onClick) {
            return (
              <button
                key={i}
                onClick={item.onClick}
                className={cn(
                  "w-full flex items-center gap-4 px-3 py-3 rounded-xl text-sm font-medium",
                  "hover:bg-[#efefef] text-[#262626] transition-colors"
                )}
              >
                <item.icon className="w-6 h-6" />
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={i}
              to={item.href!}
              className={cn(
                "flex items-center gap-4 px-3 py-3 rounded-xl text-sm",
                "hover:bg-[#efefef] transition-colors",
                isActive
                  ? "font-bold text-[#262626]"
                  : "font-medium text-[#262626]"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive && "stroke-[2.5]")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="space-y-1">
        <Link
          to="/settings"
          className="flex items-center gap-4 px-3 py-3 rounded-xl text-sm font-medium hover:bg-[#efefef] text-[#262626]"
        >
          <Settings className="w-6 h-6" />
          <span>Configurações</span>
        </Link>

        {/* Profile mini */}
        <Link
          to={`/profile/${profile?.username || user?.id}`}
          className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#efefef]"
        >
          <Avatar src={profile?.avatar_url} size="sm" alt={profile?.username} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#262626] truncate">
              {profile?.username || "Usuário"}
            </p>
            <p className="text-xs text-[#8e8e8e] truncate">
              {profile?.full_name || ""}
            </p>
          </div>
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-sm font-medium hover:bg-[#efefef] text-[#262626]"
        >
          <LogOut className="w-6 h-6" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
