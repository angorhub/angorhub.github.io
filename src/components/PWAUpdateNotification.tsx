import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, X } from 'lucide-react'
import { usePWAUpdate } from '@/hooks/usePWA'

export function PWAUpdateNotification() {
  const { updateAvailable, updateSW } = usePWAUpdate()
  const [isVisible, setIsVisible] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    if (updateAvailable && !hasShown) {
      // Show notification only once per session
      setIsVisible(true)
      setHasShown(true)
      
      // Don't auto-hide - let user decide when to update
    }
  }, [updateAvailable, hasShown])

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      await updateSW()
      // Note: The page will reload automatically after updateSW completes
    } catch (error) {
      console.error('Update failed:', error)
      setIsUpdating(false)
      // Fallback: force reload
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!isVisible || !updateAvailable) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white border border-green-600 rounded-lg shadow-lg p-4 animate-in slide-in-from-top-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              App Update Available
            </h3>
            <p className="text-xs opacity-90 mb-3">
              A new version is ready to install
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1 bg-white text-green-600 hover:bg-green-50"
              >
                {isUpdating ? (
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-1" />
                )}
                {isUpdating ? 'Updating...' : 'Update Now'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                disabled={isUpdating}
                className="bg-transparent border-white/20 hover:bg-white/10 text-white"
              >
                Later
              </Button>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            disabled={isUpdating}
            className="p-1 h-auto hover:bg-white/10 text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
