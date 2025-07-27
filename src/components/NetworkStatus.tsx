import { useState, useEffect } from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineMessage(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineMessage(true)
      
      // Hide message after 5 seconds if back online
      setTimeout(() => {
        if (navigator.onLine) {
          setShowOfflineMessage(false)
        }
      }, 5000)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showOfflineMessage && isOnline) {
    return null
  }

  return (
    <div
      className={cn(
        "fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto",
        "bg-background border rounded-lg shadow-lg p-3",
        "animate-in slide-in-from-top-5",
        !isOnline && "border-destructive bg-destructive/10"
      )}
    >
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-destructive" />
        )}
        <span className={cn(
          "text-sm font-medium",
          !isOnline && "text-destructive"
        )}>
          {isOnline ? 'Connection restored' : 'No internet connection'}
        </span>
      </div>
      {!isOnline && (
        <p className="text-xs text-muted-foreground mt-1">
          Some features may be unavailable
        </p>
      )}
    </div>
  )
}
