import { useState, useEffect } from 'react'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(null)
  const [lastOfflineTime, setLastOfflineTime] = useState<Date | null>(null)

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)
      
      if (online) {
        setLastOnlineTime(new Date())
      } else {
        setLastOfflineTime(new Date())
      }
    }

    const handleOnline = () => {
      console.log('Network: Online')
      updateOnlineStatus()
    }

    const handleOffline = () => {
      console.log('Network: Offline')
      updateOnlineStatus()
    }

    // Listen for network status changes
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial status
    updateOnlineStatus()

    // Optional: Periodic connectivity check using fetch
    const checkConnectivity = async () => {
      if (navigator.onLine) {
        try {
          // Try to fetch a small resource to verify actual connectivity
          const response = await fetch('/favicon.ico', {
            method: 'HEAD',
            cache: 'no-cache'
          })
          if (!response.ok && isOnline) {
            // Browser thinks we're online but we can't reach our server
            setIsOnline(false)
            setLastOfflineTime(new Date())
          }
        } catch {
          if (isOnline) {
            console.log('Connectivity check failed, but browser reports online')
            setIsOnline(false)
            setLastOfflineTime(new Date())
          }
        }
      }
    }

    // Check connectivity every 30 seconds when online
    const connectivityInterval = setInterval(checkConnectivity, 30000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(connectivityInterval)
    }
  }, [isOnline])

  return {
    isOnline,
    lastOnlineTime,
    lastOfflineTime,
    isFirstConnection: !lastOfflineTime && !lastOnlineTime
  }
}
