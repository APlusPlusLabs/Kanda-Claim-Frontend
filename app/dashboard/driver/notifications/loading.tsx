import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function NotificationsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-10 w-20" />
              ))}
          </div>
          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="flex space-x-1">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
