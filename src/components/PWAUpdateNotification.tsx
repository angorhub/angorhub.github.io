import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, X } from 'lucide-react'
import { usePWAUpdate } from '@/hooks/usePWA'

export function PWAUpdateNotification() {
  const { updateAvailable, updateSW } = usePWAUpdate()
  const [isVisible, setIsVisible] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (updateAvailable) {
      setIsVisible(true)
    }
  }, [updateAvailable])

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      await updateSW()
    } catch (error) {
      console.error('Update failed:', error)
      setIsUpdating(false)
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
      <div className="bg-primary text-primary-foreground border border-primary rounded-lg shadow-lg p-4 animate-in slide-in-from-top-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">New Update</h3>
            <p className="text-xs opacity-90 mb-3">
              A new version of Angor Hub is available
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? (
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-1" />
                )}
                {isUpdating ? 'Updating...' : 'Update'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                disabled={isUpdating}
                className="bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10"
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
            className="p-1 h-auto hover:bg-primary-foreground/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
