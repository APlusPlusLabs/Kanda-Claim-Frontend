import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-4 w-[300px] mt-2" />
        </div>
        <Skeleton className="h-10 w-[150px]" />
      </div>

      {/* Filters Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Skeleton className="h-4 w-[100px] mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-[100px] mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-[100px] mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-[600px]" />

        {/* Bid Cards Skeleton */}
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-[150px]" />
                    <Skeleton className="h-6 w-[100px]" />
                  </div>
                  <Skeleton className="h-4 w-[200px] mt-2" />
                </div>
                <Skeleton className="h-10 w-[120px]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
