// src/app/products/page.tsx
import { createServerSideClient } from "@/lib/supabase-server"
import { DataTable } from "./data-table"
import { columns } from "./columns" // Проверьте, чтобы имя файла совпадало (columns или column)
import { Product } from "./product-schema"

// Импортируем компоненты карточки
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function ProductsPage() {
  const supabase = await createServerSideClient()

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  const formattedProducts: Product[] = products || []

  return (
    <div className="container mx-auto py-10">
      {/* Оборачиваем всё в Карточку */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Товары</CardTitle>
          <CardDescription>
            Управление складом и ценами. Всего товаров: {formattedProducts.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={formattedProducts} />
        </CardContent>
      </Card>
    </div>
  )
}