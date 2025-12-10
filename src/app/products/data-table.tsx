"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel, // <--- 1. Импорт фильтрации
  SortingState,
  ColumnFiltersState, // <--- 2. Импорт типов
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" // <--- 3. Импорт инпута
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu" // <--- 4. Импорт меню настроек
import { Settings2, Search } from "lucide-react"
import { DataTableFloatingBar } from "./data-table-floating-bar"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [rowSelection, setRowSelection] = React.useState({})
  
  // 5. Новые стейты: Фильтр и Плотность
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [density, setDensity] = React.useState("normal") // "normal" | "compact" | "spacious"

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    // 6. Подключаем фильтрацию
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      rowSelection,
      columnFilters,
    },
  })

  // 7. Логика высоты строки в зависимости от density
  const getRowHeight = () => {
    if (density === "compact") return "h-8 py-1"
    if (density === "spacious") return "h-16 py-4"
    return "h-12 py-2" // normal
  }

  return (
    <div className="space-y-4">
      {/* 8. Панель инструментов (Поиск + Настройки) */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center w-full max-w-sm gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
            placeholder="Поиск по названию..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
            />
        </div>

        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                    <Settings2 className="mr-2 h-4 w-4" />
                    Вид
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={density} onValueChange={setDensity}>
                    <DropdownMenuRadioItem value="compact">Компактный</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="normal">Обычный</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="spacious">Просторный</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border h-[60vh] overflow-y-auto relative bg-background">
        <Table>
          <TableHeader className="sticky top-0 z-20 bg-background shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="bg-background">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  // 9. Применяем класс высоты
                  className={getRowHeight()} 
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-1">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Ничего не найдено.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} из{" "}
          {table.getFilteredRowModel().rows.length} выбрано.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Назад
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Вперед
          </Button>
        </div>
      </div>
      
      <DataTableFloatingBar table={table} />
    </div>
  )
}