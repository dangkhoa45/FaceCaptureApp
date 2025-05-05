"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"

// Interface đơn giản cho việc phát hiện khuôn mặt
interface UseFaceDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement>
  enabled: boolean
}

interface FaceDetectionResult {
  faceDetected: boolean
  message: string
}

// Hook giả lập phát hiện khuôn mặt
export function useFaceDetection({ videoRef, enabled }: UseFaceDetectionProps): FaceDetectionResult {
  const [result, setResult] = useState<FaceDetectionResult>({
    faceDetected: false,
    message: "Đang khởi tạo camera...",
  })

  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enabled || !videoRef.current) {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }
      return
    }

    // Đợi video sẵn sàng
    const videoElement = videoRef.current
    if (!videoElement.readyState || videoElement.readyState < 2) {
      const handleVideoReady = () => {
        startFaceDetection()
        videoElement.removeEventListener("loadeddata", handleVideoReady)
      }

      videoElement.addEventListener("loadeddata", handleVideoReady)
      return () => {
        videoElement.removeEventListener("loadeddata", handleVideoReady)
      }
    } else {
      startFaceDetection()
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }
    }
  }, [videoRef, enabled])

  // Giả lập phát hiện khuôn mặt
  const startFaceDetection = () => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current)
    }

    // Kiểm tra mỗi 500ms
    checkIntervalRef.current = setInterval(() => {
      // Giả lập phát hiện khuôn mặt với xác suất 80%
      const faceDetected = Math.random() > 0.2

      if (faceDetected) {
        // Giả lập các trường hợp khác nhau
        const scenarios = [
          { detected: true, message: "Khuôn mặt đã được phát hiện. Giữ yên để chụp." },
          { detected: true, message: "Khuôn mặt đã được căn chỉnh tốt." },
          { detected: false, message: "Khuôn mặt quá xa. Vui lòng di chuyển gần hơn." },
          { detected: false, message: "Khuôn mặt không nằm trong khung. Vui lòng điều chỉnh." },
        ]

        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)]

        setResult({
          faceDetected: scenario.detected,
          message: scenario.message,
        })
      } else {
        setResult({
          faceDetected: false,
          message: "Không tìm thấy khuôn mặt. Vui lòng đảm bảo khuôn mặt nằm trong khung hình.",
        })
      }
    }, 1000)
  }

  return result
}
