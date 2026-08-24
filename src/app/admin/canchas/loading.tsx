import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCanchasLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}
