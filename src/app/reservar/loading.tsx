import { Skeleton } from "@/components/ui/skeleton";
import { DiagonalSection } from "@/components/layout/diagonal-section";

export default function ReservarLoading() {
  return (
    <DiagonalSection tone="muted" className="py-10 sm:py-14">
      <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <Skeleton className="mx-auto h-4 w-32" />
          <Skeleton className="mx-auto h-10 w-64" />
          <Skeleton className="mx-auto h-5 w-96 max-w-full" />
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="aspect-[3/2] w-full rounded-2xl" />
      </div>
    </DiagonalSection>
  );
}
