"use client"

import * as React from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { ServerIcon, ShieldCheck } from "lucide-react"

export function WakingIndicator({ isVisible }: { isVisible: boolean }) {
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 100
          return prev + (100 - prev) * 0.1 // Asymptotic progress
        })
      }, 250)
      return () => clearInterval(interval)
    } else {
      setProgress(0)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md transition-all duration-500">
      <Card className="w-full max-w-md shadow-2xl border-none bg-white dark:bg-slate-900 overflow-hidden">
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800">
          <div 
            className="h-full bg-blue-600 transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <CardContent className="pt-8 pb-10 flex flex-col items-center gap-6 px-10">
          <div className="relative">
            <div className="h-20 w-20 rounded-2xl bg-blue-600/10 flex items-center justify-center animate-pulse">
              <ServerIcon className="h-10 w-10 text-blue-600" />
            </div>
            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white dark:bg-slate-900 shadow-lg flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Connecting to Render Cloud</h3>
            <p className="text-sm text-slate-500 leading-relaxed">The HRMS backend is waking up from a cold state. Initializing PostgreSQL secure tunnel...</p>
          </div>
          <div className="w-full space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Status: Handshaking</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
