"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import Cropper from "react-easy-crop"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider" // Убедитесь, что слайдер установлен: npx shadcn@latest add slider
import { getCroppedImg } from "@/lib/canvas-utils"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react"

interface ProductImageUploaderProps {
  productId: string
  currentImageUrl: string | null
  onUploadComplete: (url: string) => void
}

export function ProductImageUploader({ productId, currentImageUrl, onUploadComplete }: ProductImageUploaderProps) {
  const [open, setOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 1. Обработка Drag & Drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      const reader = new FileReader()
      reader.addEventListener("load", () => setImageSrc(reader.result as string))
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  })

  // 2. Сохранение координат кропа
  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  // 3. Загрузка в Supabase
  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      // А. Получаем Blob из канваса
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels, "new-image.jpg")
      
      // Б. Генерируем путь: public/product_id/random.jpg
      const filePath = `public/${productId}/${Date.now()}.jpg`

      // В. Загружаем
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, croppedImageBlob)

      if (uploadError) throw uploadError

      // Г. Получаем публичную ссылку
      const { data: { publicUrl } } = supabase.storage
        .from("products")
        .getPublicUrl(filePath)

      // Д. Обновляем запись в таблице products
      const { error: dbError } = await supabase
        .from("products")
        .update({ image_url: publicUrl })
        .eq("id", productId)

      if (dbError) throw dbError

      toast.success("Фото обновлено")
      onUploadComplete(publicUrl)
      setOpen(false)
      setImageSrc(null) // Сброс
      
    } catch (error) {
      console.error(error)
      toast.error("Ошибка загрузки")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="relative h-10 w-10 rounded-md overflow-hidden cursor-pointer border border-zinc-200 hover:opacity-80 transition-opacity bg-zinc-100 group">
            {currentImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentImageUrl} alt="Product" className="h-full w-full object-cover" />
            ) : (
                <div className="h-full w-full flex items-center justify-center text-zinc-400">
                    <ImageIcon className="h-4 w-4" />
                </div>
            )}
            {/* Оверлей при наведении */}
            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
                <Upload className="h-4 w-4 text-white" />
            </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Загрузка изображения</DialogTitle>
        </DialogHeader>

        {!imageSrc ? (
          // Зона Dropzone
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
              ${isDragActive ? "border-blue-500 bg-blue-50" : "border-zinc-300 hover:border-zinc-400"}
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-10 w-10 text-zinc-400" />
              <p className="text-sm text-zinc-600">Перетащите фото сюда или кликните</p>
              <p className="text-xs text-zinc-400">JPG, PNG до 5MB</p>
            </div>
          </div>
        ) : (
          // Зона Кроппера
          <div className="space-y-4">
            <div className="relative h-[300px] w-full bg-black rounded-lg overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1} // Квадрат 1:1
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            
            {/* Слайдер зума */}
            <div className="flex items-center gap-4">
                <span className="text-xs font-medium w-10">Zoom</span>
                <Slider 
                    value={[zoom]} 
                    min={1} 
                    max={3} 
                    step={0.1} 
                    onValueChange={(val) => setZoom(val[0])} 
                />
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setImageSrc(null)}>Назад</Button>
                <Button onClick={handleUpload} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Сохранить
                </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}