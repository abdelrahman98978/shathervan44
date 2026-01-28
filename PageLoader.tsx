import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export function PageLoader({ message = 'جاري التحميل...', fullScreen = true }: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-background/80 backdrop-blur-sm",
        fullScreen ? "fixed inset-0 z-50" : "absolute inset-0"
      )}
    >
      <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 shadow-xl">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
          <div className="absolute inset-0 h-12 w-12 rounded-full animate-ping bg-accent/20" />
        </div>
        <p className="text-muted-foreground font-medium text-sm">{message}</p>
      </div>
    </div>
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn("animate-pulse rounded-xl overflow-hidden bg-card border border-border", className)}>
      <div className="aspect-square bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-muted rounded w-20" />
          <div className="h-9 bg-muted rounded w-24" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonText({ className, lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={cn("animate-pulse space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-muted rounded"
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonBanner({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse w-full aspect-[21/9] bg-muted rounded-xl", className)} />
  );
}
