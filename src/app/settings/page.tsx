"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [storeName, setStoreName] = useState("")
  const [fullName, setFullName] = useState("")
  const supabase = createClient()

  // Загружаем данные профиля при входе
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setStoreName(data.store_name || "")
        setFullName(data.full_name || "")
      }
      setLoading(false)
    }
    loadProfile()
  }, [supabase]) // Добавлена зависимость

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
        const { error } = await supabase
            .from('profiles')
            .update({ 
                store_name: storeName,
                full_name: fullName
            })
            .eq('id', user.id)
        
        if (error) {
            toast.error("Ошибка сохранения")
        } else {
            toast.success("Профиль обновлен")
        }
    }
    setSaving(false)
  }

  // Функция выхода
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  if (loading) return <div className="p-10">Загрузка профиля...</div>

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <h2 className="text-3xl font-bold tracking-tight mb-8">Настройки аккаунта</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Профиль магазина</CardTitle>
          <CardDescription>
            Эта информация будет видна покупателям.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Название магазина</Label>
            <Input 
                value={storeName} 
                onChange={(e) => setStoreName(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label>Ваше имя</Label>
            <Input 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="destructive" onClick={handleSignOut}>
                Выйти из аккаунта
            </Button>
            
            <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Сохранить изменения
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}