"use client"

import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase"
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function CityStats() {
  const supabase = createClient()

  const { data, isLoading } = useQuery({
    queryKey: ["city-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_sales_by_city")
      if (error) throw error
      return data
    },
  })

  if (isLoading) {
    return <Skeleton className="w-full h-[300px] rounded-xl" />
  }

  // Цвета для разных столбцов (от темного к светлому, создавая эффект heatmap)
  const colors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Топ регионов (Heatmap)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 0, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis 
                dataKey="city" 
                type="category" 
                tickLine={false} 
                axisLine={false}
                width={80}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
                        <span className="font-bold">
                          {new Intl.NumberFormat("uk-UA", { style: "currency", currency: "UAH" }).format(payload[0].value as number)}
                        </span>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={32}>
                {data?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}