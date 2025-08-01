import { useState, useEffect } from 'react'

interface PWAUpdateAvailable {
  updateAvailable: boolean
  updateSW: () => Promise<void>
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface SWUpdateEvent extends Event {
  detail?: {
    type: string
    registration: ServiceWorkerRegistration
  }
}

export function usePWAUpdate(): PWAUpdateAvailable {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Get the service worker registration
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg)
        
        // Check for updates immediately
        reg.update()
        
        // Set up periodic update checks (every 60 seconds)
        const interval = setInterval(() => {
          reg.update()
        }, 60000)
        
        // Check if there's already a waiting service worker
        if (reg.waiting) {
          console.log('Service worker already waiting')
          setUpdateAvailable(true)
        }
        
        // Listen for new service worker installing
        reg.addEventListener('updatefound', () => {
          console.log('New service worker found')
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              console.log('Service worker state changed:', newWorker.state)
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New service worker installed and ready')
                setUpdateAvailable(true)
                setRegistration(reg)
              }
            })
          }
        })
        
        return () => clearInterval(interval)
      })

      // Listen for messages from service worker
      const handleSWMessage = (event: MessageEvent) => {
        console.log('SW Message received:', event.data)
        if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
          console.log('Update available from service worker message')
          setUpdateAvailable(true)
        }
      }

      // Listen for service worker updates (Workbox specific)
      const handleSWUpdate = (event: SWUpdateEvent) => {
        console.log('SW Update event received:', event.detail)
        if (event.detail && event.detail.type === 'workbox-waiting') {
          setUpdateAvailable(true)
          setRegistration(event.detail.registration)
        }
      }

      // Add all listeners
      navigator.serviceWorker.addEventListener('message', handleSWMessage)
      window.addEventListener('sw-update', handleSWUpdate)

      return () => {
        navigator.serviceWorker.removeEventListener('message', handleSWMessage)
        window.removeEventListener('sw-update', handleSWUpdate)
      }
    }
  }, [])

  const updateSW = async () => {
    if (!registration) {
      console.log('No registration available for update')
      return
    }

    try {
      // If there's a waiting service worker, tell it to take control
      if (registration.waiting) {
        console.log('Sending SKIP_WAITING message to service worker')
        
        // Listen for controller change once to reload the page
        const handleControllerChange = () => {
          console.log('Service worker controller changed - reloading page')
          navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
          setTimeout(() => {
            window.location.reload()
          }, 100)
        }
        
        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
        
        // Send the skip waiting message
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        
      } else {
        console.log('No waiting service worker, forcing reload')
        // No waiting worker, just reload the page
        window.location.reload()
      }
    } catch (error) {
      console.error('Error during service worker update:', error)
      // Fallback: just reload the page
      window.location.reload()
    }
  }

  return {
    updateAvailable,
    updateSW
  }
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setCanInstall(true)
    }

    const handleAppInstalled = () => {
      setCanInstall(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installPWA = async () => {
    if (!deferredPrompt) return false

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      setDeferredPrompt(null)
      setCanInstall(false)
      
      return outcome === 'accepted'
    } catch (error) {
      console.error('PWA installation error:', error)
      return false
    }
  }

  return {
    canInstall,
    installPWA
  }
}
