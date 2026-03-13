"use client"

import * as React from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { ServerIcon } from "lucide-react"

export function WakingIndicator({ isVisible }: { isVisible: boolean }) {
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 100
          return prev + (100 - prev) * 0.1 // Asymptotic progress
        })
      }, 300)
      return () => clearInterval(interval)
    } else {
      setProgress(0)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-300">
      <Card className="w-full max-w-md shadow-2xl border-primary/20">
        <CardContent className="pt-6 flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <ServerIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-lg font-semibold font-headline">Waking up Python Server...</h3>
            <p className="text-sm text-muted-foreground">The backend is starting from a cold state on Render. This usually takes a few seconds.</p>
          </div>
          <Progress value={progress} className="h-2 w-full" />
          <p className="text-xs font-mono text-muted-foreground">{Math.round(progress)}% connected</p>
        </CardContent>
      </Card>
    </div>
  )
}
