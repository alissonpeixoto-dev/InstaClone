import { useState } from "react";
import { Link } from "react-router-dom";
import { useSearchUsers } from "@/hooks/useSearchUsers";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Search } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { profiles, loading, error } = useSearchUsers(query);

  return (
    <div className="max-w-[935px] mx-auto px-4 py-4">
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e8e8e]" />
        <input
          type="text"
          placeholder="Pesquisar usuários..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-3 text-sm bg-[#efefef] rounded-xl border-none outline-none text-[#262626] placeholder:text-[#8e8e8e]"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 p-4 bg-white border border-[#dbdbdb] rounded-xl">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white border border-[#dbdbdb] rounded-xl p-8 text-center">
          <p className="text-sm text-[#262626] font-semibold mb-2">Erro ao buscar usuários</p>
          <p className="text-sm text-[#8e8e8e]">{error}</p>
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-[#8e8e8e]">Digite um nome ou username para pesquisar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map((profile) => (
            <Link
              key={profile.id}
              to={`/profile/${profile.username}`}
              className="flex items-center gap-3 p-4 bg-white border border-[#dbdbdb] rounded-xl hover:bg-[#fafafa]"
            >
              <Avatar src={profile.avatar_url} size="sm" alt={profile.username} />
              <div>
                <p className="text-sm font-semibold text-[#262626]">{profile.full_name || profile.username}</p>
                <p className="text-xs text-[#8e8e8e]">@{profile.username}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
