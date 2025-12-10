export type Product = {
  id: string
  name: string
  price: number
  stock: number
  status: "active" | "draft" | "archived"
  image_url: string | null
  created_at: string
}