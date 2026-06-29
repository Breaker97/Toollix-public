"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
}: SliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange([parseInt(e.target.value, 10)])
  }

  const percentage = ((value[0] - min) / (max - min)) * 100

  return (
    <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
      <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div 
          className="absolute h-full bg-[#c5a059]" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        className="absolute w-full h-2 opacity-0 cursor-pointer z-10"
      />
      <div 
        className="absolute h-5 w-5 rounded-full border-2 border-[#c5a059] bg-white dark:bg-zinc-900 shadow-xl transition-transform hover:scale-110 pointer-events-none"
        style={{ left: `calc(${percentage}% - 10px)` }}
      />
    </div>
  )
}
