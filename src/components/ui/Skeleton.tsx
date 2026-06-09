import { cn } from "@/utils/cn";

interface SkeletonProps {
  className?: string;
  rounded?: boolean;
}

export function Skeleton({ className, rounded = false }: SkeletonProps) {
  return (
    <div
      className={cn(
        "skeleton bg-[#efefef]",
        rounded ? "rounded-full" : "rounded",
        className
      )}
    />
  );
}

export function PostSkeleton() {
  return (
    <div className="bg-white border border-[#dbdbdb] rounded-xl mb-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <Skeleton className="w-10 h-10" rounded />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      {/* Image */}
      <Skeleton className="w-full aspect-square rounded-none" />
      {/* Actions */}
      <div className="p-3 space-y-2">
        <div className="flex gap-3">
          <Skeleton className="h-6 w-6" rounded />
          <Skeleton className="h-6 w-6" rounded />
          <Skeleton className="h-6 w-6" rounded />
        </div>
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="p-4">
      <div className="flex items-start gap-8 mb-8">
        <Skeleton className="w-24 h-24" rounded />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-32" />
          <div className="flex gap-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    </div>
  );
}
