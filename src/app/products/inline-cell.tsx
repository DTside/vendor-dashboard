"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"

interface InlineCellProps {
  id: string
  column: "price" | "stock"
  value: number
  type?: "number"
}

export function InlineCell({ id, column, value: initialValue }: InlineCellProps) {
  const [value, setValue] = useState(initialValue)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  // Если данные обновились извне (например, сортировка), синхронизируем стейт
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const handleBlur = async () => {
    // Если значение не изменилось, ничего не делаем
    if (value === initialValue) return

    setIsLoading(true)

    try {
      // Отправляем запрос в Supabase
      const { error } = await supabase
        .from("products")
        .update({ [column]: value }) // Динамический ключ: price или stock
        .eq("id", id)

      if (error) throw error

      toast.success(`${column === 'price' ? 'Цена' : 'Остаток'} обновлен`)
    } catch (error) {
      console.error(error)
      toast.error("Ошибка обновления")
      setValue(initialValue) // Откатываем значение при ошибке
    } finally {
      setIsLoading(false)
    }
  }

  // Обработка нажатия Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur() // Вызывает onBlur
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Input
        type="number"
        value={value}
        disabled={isLoading}
        onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`h-8 w-24 text-right ${
            // Подсветка, если значение меняется
            value !== initialValue ? "border-orange-400 bg-orange-50" : ""
        }`}
      />
       {/* Если это цена, добавим значок валюты справа визуально */}
       {column === 'price' && <span className="text-sm text-muted-foreground">₴</span>}
    </div>
  )
}