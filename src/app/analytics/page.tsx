"use client"

import { OverviewChart } from "./overview-chart"
import { KpiCards } from "./kpi-cards"
import { CityStats } from "./city-stats" // 1. Импорт
import { QueryProvider } from "@/components/query-provider"

export default function AnalyticsPage() {
  return (
    <QueryProvider>
        <div className="container mx-auto py-10 space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Дашборд</h2>
            
            <KpiCards />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Левая часть - График выручки */}
                <div className="col-span-4">
                    <OverviewChart />
                </div>

                {/* Правая часть - География (CityStats) */}
                <div className="col-span-3">
                    <CityStats /> 
                </div>
            </div>
        </div>
    </QueryProvider>
  )
}