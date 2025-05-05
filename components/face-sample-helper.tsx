"use client"

import { useState, useEffect } from "react"

interface FaceSampleHelperProps {
  angleId: string
  sampleImage: string
}

export function FaceSampleHelper({ angleId, sampleImage }: FaceSampleHelperProps) {
  const [imageUrl, setImageUrl] = useState<string>("")

  useEffect(() => {
    // Xử lý hình ảnh dựa trên góc chụp
    const baseUrl = sampleImage
    let cropParams = ""

    // Trong thực tế, bạn có thể cần xử lý cắt ảnh hoặc chọn ảnh phù hợp
    // Đây chỉ là ví dụ đơn giản
    switch (angleId) {
      case "front":
        cropParams = "#center"
        break
      case "right":
        cropParams = "#right"
        break
      case "left":
        cropParams = "#left"
        break
      case "up":
        cropParams = "#up"
        break
      case "down":
        cropParams = "#down"
        break
    }

    setImageUrl(`${baseUrl}${cropParams}`)
  }, [angleId, sampleImage])

  return (
    <div className="absolute inset-0">
      <img src={imageUrl || "/placeholder.svg"} alt={`Mẫu cho góc ${angleId}`} className="w-full h-full object-cover" />
    </div>
  )
}
