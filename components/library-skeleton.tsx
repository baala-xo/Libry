import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function LibrarySkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
