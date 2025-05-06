import React from "react"
import { cn } from "@/lib/utils"
import { CheckIcon, AlertTriangle } from "lucide-react"

interface StepProps {
  completed?: boolean
  error?: boolean
  children: React.ReactNode
}

interface StepperProps {
  currentStep: number
  className?: string
  children: React.ReactNode
}

export function StepTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-medium">{children}</div>
}

export function StepDescription({ children }: { children: React.ReactNode }) {
  return <div className="text-xs text-muted-foreground">{children}</div>
}

export function Step({ completed, error, children }: StepProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold",
          completed
            ? "border-primary bg-primary text-primary-foreground"
            : error
              ? "border-destructive bg-destructive/10 text-destructive"
              : "border-muted-foreground/20 text-muted-foreground",
        )}
      >
        {completed ? <CheckIcon className="h-4 w-4" /> : error ? <AlertTriangle className="h-4 w-4" /> : null}
      </div>
      <div className="mt-2 text-center">{children}</div>
    </div>
  )
}

export function Stepper({ currentStep, className, children }: StepperProps) {
  const steps = React.Children.toArray(children)
  const totalSteps = steps.length

  return (
    <div className={cn("w-full", className)}>
      <div className="relative flex justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {step}
            {index < totalSteps - 1 && (
              <div className="absolute top-4 left-0 right-0 h-[2px] -z-10">
                <div
                  className={cn("h-full bg-muted-foreground/20", index < currentStep - 1 && "bg-primary")}
                  style={{
                    width: `calc(100% - ${totalSteps * 32}px)`,
                    marginLeft: `calc(${index * 100}% / ${totalSteps - 1} + 16px)`,
                  }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
