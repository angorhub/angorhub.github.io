import { useState, useEffect } from 'react'
import { Wifi, WifiOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOfflineOverlay, setShowOfflineOverlay] = useState(false)
  const [showConnectionRestored, setShowConnectionRestored] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineOverlay(false)
      setShowConnectionRestored(true)
      
      // Hide connection restored message after 3 seconds
      setTimeout(() => {
        setShowConnectionRestored(false)
      }, 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineOverlay(true)
      setShowConnectionRestored(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial offline state
    if (!navigator.onLine) {
      setShowOfflineOverlay(true)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleCloseOfflineOverlay = () => {
    setShowOfflineOverlay(false)
  }

  return (
    <>
      {/* Online/Offline Status Indicator in Header */}
      <div className="flex items-center">
        {isOnline ? (
          <div className="flex items-center gap-1 text-green-500">
            <Wifi className="w-4 h-4" />
          </div>
        ) : (
          <div className="flex items-center gap-1 text-red-500">
            <WifiOff className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Connection Restored Notification */}
      {showConnectionRestored && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto">
          <div className="bg-green-500 text-white border border-green-600 rounded-lg shadow-lg p-3 animate-in slide-in-from-top-5">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">Connection restored</span>
            </div>
          </div>
        </div>
      )}

      {/* Offline Blur Overlay */}
      {showOfflineOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-md" />
          
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCloseOfflineOverlay}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Offline message */}
          <div className="relative z-10 text-center space-y-4 animate-in zoom-in-95 fade-in duration-300">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-red-500/30">
                <WifiOff className="w-8 h-8 text-red-400" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">Offline</h2>
                <p className="text-white/80 text-lg max-w-sm mx-auto">
                  You're currently offline. Some features may not be available.
                </p>
              </div>

              <div className="flex items-center gap-2 text-white/60 text-sm">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <span>No internet connection</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
