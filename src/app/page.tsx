import { createServerSideClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Package, TrendingUp, ShieldCheck } from "lucide-react"

export default async function Home() {
  // 1. Проверяем, залогинен ли пользователь
  const supabase = await createServerSideClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Если да — сразу отправляем работать в Товары
  if (user) {
    redirect("/products")
  }

  // 3. Если нет — показываем Лендинг
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Хедер */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-primary text-primary-foreground p-1 rounded-md">
              <Package className="h-5 w-5" />
            </div>
            Vendor Portal
          </div>
          <div className="flex gap-4">
             <Link href="/login">
                <Button variant="ghost">Войти</Button>
             </Link>
             <Link href="/login">
                <Button>Регистрация</Button>
             </Link>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="grid gap-12 lg:grid-cols-2 max-w-5xl items-center">
            
            {/* Текст слева */}
            <div className="space-y-6">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Управляйте продажами <br/>
                    <span className="text-primary">профессионально</span>
                </h1>
                <p className="text-muted-foreground text-lg">
                    Единый центр управления для B2B-поставщиков. Аналитика, управление складом и обработка заказов в реальном времени.
                </p>
                
                <div className="space-y-3">
                    <FeatureItem text="Моментальное обновление остатков" />
                    <FeatureItem text="Аналитика продаж Year-over-Year" />
                    <FeatureItem text="Массовое управление ценами" />
                    <FeatureItem text="Безопасная загрузка медиа" />
                </div>

                <div className="pt-4">
                    <Link href="/login">
                        <Button size="lg" className="w-40">Начать работу</Button>
                    </Link>
                </div>
            </div>

            {/* Карточка справа (Визуализация) */}
            <div className="flex justify-center lg:justify-end">
                <Card className="w-[380px] shadow-2xl border-muted">
                    <CardHeader>
                        <CardTitle>Статус аккаунта</CardTitle>
                        <CardDescription>Сводка за сегодня</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex items-center rounded-md border p-4">
                            <TrendingUp className="mr-4 h-8 w-8 text-green-500" />
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">Продажи</p>
                                <p className="text-sm text-muted-foreground">+12% к прошлой неделе</p>
                            </div>
                        </div>
                        <div className="flex items-center rounded-md border p-4">
                            <ShieldCheck className="mr-4 h-8 w-8 text-blue-500" />
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">Безопасность</p>
                                <p className="text-sm text-muted-foreground">Аккаунт верифицирован</p>
                            </div>
                        </div>
                         <Button className="w-full" variant="outline" disabled>
                            Перейти в дашборд
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>

      {/* Футер */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © 2024 Vendor Portal Inc. Все права защищены.
      </footer>
    </div>
  )
}

function FeatureItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span>{text}</span>
        </div>
    )
}