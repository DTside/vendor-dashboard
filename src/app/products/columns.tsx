"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Product } from "./product-schema"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { InlineCell } from "./inline-cell"
import { ProductImageUploader } from "./product-image-uploader"
import { useRouter } from "next/navigation" // Нам понадобится router для обновления
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Форматтер валюты (Intl)
const formatPrice = (price: number) => {
  // 1. Форматируем только число (без валюты)
  const formattedNumber = new Intl.NumberFormat("uk-UA", {
    style: "decimal", // Важно: не currency, а decimal
    minimumFractionDigits: 0,
  }).format(price);

  // 2. Добавляем символ гривны вручную
  return `${formattedNumber} ₴`; 
}

const ImageCell = ({ row }: { row: any }) => {
    const router = require("next/navigation").useRouter() // Lazy import or hook inside component
    
    return (
        <ProductImageUploader 
            productId={row.original.id}
            currentImageUrl={row.original.image_url}
            onUploadComplete={() => router.refresh()}
        />
    )
}

export const columns: ColumnDef<Product>[] = [
  // 1. Чекбокс для выбора (Bulk Actions)
  {
    id: "image",
    header: "Фото",
    cell: ({ row }) => <ImageCell row={row} />,
    enableSorting: false,
  },
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // 2. Название (с сортировкой)
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Название
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium truncate max-w-[200px]">{row.getValue("name")}</div>,
  },
  // 3. Статус (цветные бейджи)
  {
    accessorKey: "status",
    header: "Статус",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"
      
      if (status === "active") variant = "default"
      if (status === "archived") variant = "destructive"

      return <Badge variant={variant}>{status}</Badge>
    },
  },
  // 4. Цена (отформатированная)
  {
    accessorKey: "price",
    header: () => <div className="text-right">Цена</div>,
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <InlineCell 
            id={row.original.id} 
            column="price" 
            value={parseFloat(row.getValue("price"))} 
          />
        </div>
      )
    },
  },
  // 5. Остаток
  {
    accessorKey: "stock",
    header: "Остаток",
    cell: ({ row }) => {
      return (
        <InlineCell 
          id={row.original.id} 
          column="stock" 
          value={parseInt(row.getValue("stock"))} 
        />
      )
    },
  },
  // 6. Действия (Кнопка с тремя точками)
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Действия</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(product.id)}
            >
              Копировать ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Редактировать</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Удалить</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]