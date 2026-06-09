import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/utils/cn";
import { Home, Search, PlusSquare, Heart, Bookmark } from "lucide-react";

interface BottomNavProps {
  onNewPost: () => void;
}

export function BottomNav({ onNewPost }: BottomNavProps) {
  const location = useLocation();
  const { profile, user } = useAuth();

  const navItems = [
    { icon: Home, href: "/" },
    { icon: Search, href: "/explore" },
    { icon: Bookmark, href: "/saved" },
    { icon: PlusSquare, onClick: onNewPost },
    { icon: Heart, href: "/activity" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#dbdbdb] z-40 safe-area-pb">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item, i) => {
          const isActive = item.href ? location.pathname === item.href : false;

          if (item.onClick) {
            return (
              <button
                key={i}
                onClick={item.onClick}
                className="p-2 flex items-center justify-center"
              >
                <item.icon className="w-7 h-7 text-[#262626]" />
              </button>
            );
          }

          return (
            <Link
              key={i}
              to={item.href!}
              className="p-2 flex items-center justify-center"
            >
              <item.icon
                className={cn(
                  "w-7 h-7 text-[#262626]",
                  isActive && "stroke-[2.5]"
                )}
              />
            </Link>
          );
        })}

        {/* Profile avatar */}
        <Link
          to={`/profile/${profile?.username || user?.id}`}
          className="p-1"
        >
          <div
            className={cn(
              "rounded-full",
              location.pathname.startsWith("/profile") &&
                "ring-2 ring-[#262626] ring-offset-1"
            )}
          >
            <Avatar src={profile?.avatar_url} size="sm" alt={profile?.username} />
          </div>
        </Link>
      </div>
    </nav>
  );
}
