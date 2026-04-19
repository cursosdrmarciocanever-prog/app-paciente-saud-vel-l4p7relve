import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { MOCK_MEALS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function MealTabs() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})

  const toggle = (mealId: string, idx: number) => {
    const key = `${mealId}-${idx}`
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <Tabs defaultValue={MOCK_MEALS[0].id} className="w-full">
      <ScrollArea className="w-full pb-3 border-b">
        <TabsList className="inline-flex w-max min-w-full justify-start h-12 bg-transparent p-0">
          {MOCK_MEALS.map((meal) => (
            <TabsTrigger
              key={meal.id}
              value={meal.id}
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-full px-5 py-2 mr-2 border border-transparent data-[state=active]:border-primary/20 transition-all"
            >
              {meal.title}
            </TabsTrigger>
          ))}
        </TabsList>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>

      {MOCK_MEALS.map((meal) => (
        <TabsContent key={meal.id} value={meal.id} className="animate-fade-in-up mt-6">
          <Card className="border-border/50 shadow-sm border-t-4 border-t-primary">
            <CardHeader className="bg-muted/20 pb-4">
              <CardTitle className="text-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {meal.title}
                <span className="text-sm font-medium bg-background px-3 py-1 rounded-full text-muted-foreground w-fit border shadow-sm flex items-center">
                  <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse" />
                  Horário ideal: {meal.time}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {meal.items.map((item, idx) => {
                  const key = `${meal.id}-${idx}`
                  const isChecked = checkedItems[key]
                  return (
                    <div
                      key={idx}
                      className={cn(
                        'flex items-start space-x-4 p-3 rounded-lg border transition-all duration-200',
                        isChecked
                          ? 'bg-muted/50 border-muted'
                          : 'bg-card border-border hover:border-primary/50',
                      )}
                    >
                      <Checkbox
                        id={key}
                        checked={isChecked}
                        onCheckedChange={() => toggle(meal.id, idx)}
                        className="mt-1 w-5 h-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label
                        htmlFor={key}
                        className={cn(
                          'text-base cursor-pointer leading-tight flex-1 pt-1 select-none transition-all duration-200',
                          isChecked && 'line-through text-muted-foreground',
                        )}
                      >
                        {item}
                      </label>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  )
}
