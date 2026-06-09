import React from "react";
import { cn } from "@/utils/cn";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  hasStory?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizes = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14",
  xl: "w-20 h-20",
  "2xl": "w-28 h-28",
};

export function Avatar({
  src,
  alt = "Avatar",
  size = "md",
  hasStory = false,
  className,
  onClick,
}: AvatarProps) {
  const [error, setError] = React.useState(false);

  const content = (
    <div
      className={cn(
        "rounded-full overflow-hidden bg-[#efefef] flex items-center justify-center flex-shrink-0",
        sizes[size],
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <User
          className={cn(
            "text-[#8e8e8e]",
            size === "xs" ? "w-3 h-3" :
            size === "sm" ? "w-4 h-4" :
            size === "md" ? "w-5 h-5" :
            size === "lg" ? "w-7 h-7" :
            size === "xl" ? "w-10 h-10" :
            "w-14 h-14"
          )}
        />
      )}
    </div>
  );

  if (hasStory) {
    return (
      <div
        className={cn(
          "rounded-full p-[2px] flex-shrink-0",
          "bg-gradient-to-tr from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888]"
        )}
        onClick={onClick}
        style={{ cursor: onClick ? "pointer" : "default" }}
      >
        <div className="rounded-full p-[2px] bg-white">
          <div
            className={cn(
              "rounded-full overflow-hidden bg-[#efefef] flex items-center justify-center",
              sizes[size]
            )}
          >
            {src && !error ? (
              <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover"
                onError={() => setError(true)}
              />
            ) : (
              <User className="w-5 h-5 text-[#8e8e8e]" />
            )}
          </div>
        </div>
      </div>
    );
  }

  return content;
}
