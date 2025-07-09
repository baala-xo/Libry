import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function LinkSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Skeleton className="h-4 w-full mb-2" />
            <div className="flex flex-wrap gap-1">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-10" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
