import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";

export function useSearchUsers(query: string) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setProfiles([]);
      setLoading(false);
      setError(null);
      return;
    }

    let canceled = false;
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const searchValue = `%${query.trim()}%`;
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .or(
            `username.ilike.${searchValue},full_name.ilike.${searchValue}`
          )
          .limit(30);

        if (error) throw error;

        if (!canceled) {
          setProfiles(data || []);
        }
      } catch (err) {
        console.error("Search users error:", err);
        if (!canceled) {
          setError("Não foi possível buscar usuários.");
        }
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      canceled = true;
    };
  }, [query]);

  return { profiles, loading, error };
}
