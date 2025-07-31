import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw } from 'lucide-react'
import { usePWAUpdate } from '@/hooks/usePWA'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function PWAUpdateButton() {
  const { updateAvailable, updateSW } = usePWAUpdate()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      await updateSW()
    } catch (error) {
      console.error('Update failed:', error)
      setIsUpdating(false)
    }
  }

  if (!updateAvailable) {
    return null
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUpdate}
          disabled={isUpdating}
          className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/30 relative"
        >
          {isUpdating ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Download className="w-5 h-5" />
              {/* Pulse animation indicator */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm font-medium">New update available</p>
        <p className="text-xs text-muted-foreground">Click to update the app</p>
      </TooltipContent>
    </Tooltip>
  )
}
