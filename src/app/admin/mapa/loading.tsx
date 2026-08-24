import { Skeleton } from "@/components/ui/skeleton";

export default function AdminMapaLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="aspect-[3/2] w-full rounded-2xl" />
    </div>
  );
}
