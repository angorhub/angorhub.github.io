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
      // Listen for service worker updates
      const handleSWUpdate = (event: SWUpdateEvent) => {
        if (event.detail && event.detail.type === 'workbox-waiting') {
          setUpdateAvailable(true)
          setRegistration(event.detail.registration)
        }
      }

      // Listen for the custom event dispatched by the service worker
      window.addEventListener('sw-update', handleSWUpdate)

      return () => {
        window.removeEventListener('sw-update', handleSWUpdate)
      }
    }
  }, [])

  const updateSW = async () => {
    if (registration && registration.waiting) {
      // Send message to service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      
      // Listen for service worker to become active
      registration.addEventListener('controllerchange', () => {
        window.location.reload()
      })
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
