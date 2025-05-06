"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SignaturePadProps {
  width?: number
  height?: number
  className?: string
  onChange: (signature: string | null) => void
}

export function SignaturePad({ width = 400, height = 200, className, onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = width
    canvas.height = height

    // Set up canvas
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.strokeStyle = "#000"
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw signature line
    ctx.beginPath()
    ctx.moveTo(20, height - 30)
    ctx.lineTo(width - 20, height - 30)
    ctx.stroke()

    // Add signature hint text
    ctx.font = "12px Arial"
    ctx.fillStyle = "#aaa"
    ctx.textAlign = "center"
    ctx.fillText("Sign above", width / 2, height - 10)
  }, [width, height])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)
    setHasSignature(true)

    // Get coordinates
    let x, y
    if ("touches" in e) {
      const rect = canvas.getBoundingClientRect()
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.nativeEvent.offsetX
      y = e.nativeEvent.offsetY
    }

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get coordinates
    let x, y
    if ("touches" in e) {
      e.preventDefault() // Prevent scrolling when drawing
      const rect = canvas.getBoundingClientRect()
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.nativeEvent.offsetX
      y = e.nativeEvent.offsetY
    }

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const endDrawing = () => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.closePath()
    setIsDrawing(false)

    // Pass signature data to parent
    onChange(canvas.toDataURL())
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Redraw signature line
    ctx.beginPath()
    ctx.strokeStyle = "#000"
    ctx.moveTo(20, height - 30)
    ctx.lineTo(width - 20, height - 30)
    ctx.stroke()

    // Add signature hint text
    ctx.font = "12px Arial"
    ctx.fillStyle = "#aaa"
    ctx.textAlign = "center"
    ctx.fillText("Sign above", width / 2, height - 10)

    setHasSignature(false)
    onChange(null)
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <canvas
        ref={canvasRef}
        className="border border-gray-300 rounded-md touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
        style={{ width: `${width}px`, height: `${height}px` }}
      />
      <div className="flex justify-end w-full mt-2">
        <Button variant="outline" size="sm" onClick={clearSignature} type="button">
          Clear
        </Button>
      </div>
    </div>
  )
}
