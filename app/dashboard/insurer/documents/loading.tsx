import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"

export default function DocumentsLoading() {
  return (
    <DashboardLayout
      user={{
        name: "Loading...",
        role: "Insurance Company",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        <Skeleton className="h-10 w-full" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left sidebar skeleton */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-24 mb-4" />
                <div className="space-y-2">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content skeleton */}
          <div className="md:col-span-3">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-32" />
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-24" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
