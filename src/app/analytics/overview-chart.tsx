"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function OverviewChart() {
  const supabase = createClient()

  // Запрос данных через React Query
  const { data, isLoading } = useQuery({
    queryKey: ["sales-stats"],
    queryFn: async () => {
      // Вызываем нашу SQL функцию
      const { data, error } = await supabase.rpc("get_monthly_sales")
      if (error) throw error
      return data
    },
  })

  if (isLoading) {
    return <Skeleton className="w-full h-[350px] rounded-xl" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Динамика выручки (12 мес)</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis 
                dataKey="month_date" 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8} 
                fontSize={12}
                tickFormatter={(value) => {
                    // Превращаем "2024-01" в "Янв"
                    const date = new Date(value + "-01")
                    return date.toLocaleDateString('ru-RU', { month: 'short' })
                }}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `₴${value / 1000}k`} 
                fontSize={12}
              />
              <Tooltip 
                content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                    return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Выручка
                            </span>
                            <span className="font-bold text-muted-foreground">
                                {new Intl.NumberFormat("uk-UA", { style: "currency", currency: "UAH" }).format(payload[0].value as number)}
                            </span>
                            </div>
                        </div>
                        </div>
                    )
                    }
                    return null
                }}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#2563eb" 
                fillOpacity={1} 
                fill="url(#colorTotal)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}