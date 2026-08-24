import { Skeleton } from "@/components/ui/skeleton";

export default function AdminConfiguracionLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-96 max-w-2xl rounded-xl" />
    </div>
  );
}
