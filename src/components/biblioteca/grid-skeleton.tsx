import { Card, CardHeader, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="flex flex-col overflow-hidden">
          <Skeleton className="w-full aspect-video rounded-none" />
          <CardHeader>
            <div className="flex justify-between mb-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6 mt-1" />
          </CardHeader>
          <CardFooter className="pt-4 flex justify-between border-t mt-auto">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
