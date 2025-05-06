"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  setRating: (rating: number) => void
  size?: "sm" | "md" | "lg"
  readOnly?: boolean
}

export function StarRating({ rating, setRating, size = "md", readOnly = false }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  const sizeClass = sizes[size]

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={cn(
            "text-gray-300 transition-colors",
            sizeClass,
            !readOnly && "hover:scale-110",
            "focus:outline-none",
          )}
          disabled={readOnly}
          onClick={() => !readOnly && setRating(star)}
          onMouseEnter={() => !readOnly && setHoverRating(star)}
          onMouseLeave={() => !readOnly && setHoverRating(0)}
        >
          <Star
            className={cn(
              sizeClass,
              "transition-colors",
              (hoverRating || rating) >= star ? "fill-yellow-400 text-yellow-400" : "fill-transparent text-gray-300",
            )}
          />
          <span className="sr-only">{star} stars</span>
        </button>
      ))}
    </div>
  )
}
