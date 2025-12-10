"use client"

import { Table } from "@tanstack/react-table"
import { X, Trash2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface DataTableFloatingBarProps<TData> {
  table: Table<TData>
}

export function DataTableFloatingBar<TData>({ table }: DataTableFloatingBarProps<TData>) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const rows = table.getFilteredSelectedRowModel().rows

  if (rows.length === 0) return null

  // Логика массового удаления
  const handleBulkDelete = async () => {
    setIsLoading(true)
    const supabase = createClient()
    
    // Получаем ID выбранных товаров
    // @ts-ignore (мы знаем, что у row.original есть id)
    const ids = rows.map((row) => row.original.id)

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .in("id", ids)

      if (error) throw error

      toast.success(`Удалено товаров: ${ids.length}`)
      
      // Сбрасываем выделение и обновляем страницу
      table.toggleAllRowsSelected(false)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Ошибка при удалении")
    } finally {
      setIsLoading(false)
    }
  }

  // Логика массовой смены статуса (пример)
  const handleBulkStatus = async (status: "active" | "draft") => {
    setIsLoading(true)
    const supabase = createClient()
    // @ts-ignore
    const ids = rows.map((row) => row.original.id)

    try {
      const { error } = await supabase
        .from("products")
        .update({ status })
        .in("id", ids)

      if (error) throw error

      toast.success("Статусы обновлены")
      table.toggleAllRowsSelected(false)
      router.refresh()
    } catch (error) {
      toast.error("Ошибка обновления")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex items-center justify-between rounded-full border bg-zinc-900 p-2 pl-5 text-white shadow-2xl">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Выбрано: {rows.length}
          </span>
          
          {/* Кнопка сброса выделения */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-zinc-800 text-zinc-400"
            onClick={() => table.toggleAllRowsSelected(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Разделитель */}
          <Separator orientation="vertical" className="h-6 bg-zinc-700" />
          
          {/* Кнопка "В активные" */}
          <Button
            variant="ghost"
            size="sm"
            disabled={isLoading}
            onClick={() => handleBulkStatus('active')}
            className="h-8 hover:bg-zinc-800 hover:text-green-400 transition-colors"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            В активные
          </Button>

          {/* Кнопка Удалить */}
          <Button
            variant="ghost"
            size="sm"
            disabled={isLoading}
            onClick={handleBulkDelete}
            className="h-8 hover:bg-red-900/50 hover:text-red-400 transition-colors text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Удалить
          </Button>
        </div>
      </div>
    </div>
  )
}