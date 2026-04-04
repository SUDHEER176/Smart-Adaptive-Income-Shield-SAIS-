import { useEffect, useState } from 'react'

export interface RealtimeData {
  dashboardStats?: {
    totalWorkers: number
    activeWorkers: number
    coveredWorkers: number
    totalPremiumsCollected: number
    totalPayoutsProcessed: number
    activeTriggers: number
    claimsToday: number
    fraudDetected: number
    avgProcessingTime: string
    weeklyGrowth: number
  }
  workers?: any[]
  zones?: any[]
  claims?: any[]
  triggers?: any[]
  payouts?: any[]
  policies?: any[]
  registrations?: any[]
  fraudAlerts?: any[]
}

export function useRealtimeData(enabled = true) {
  const [data, setData] = useState<RealtimeData>({})
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!enabled) return

    let eventSource: EventSource | null = null
    let retryCount = 0
    let reconnectTimeout: NodeJS.Timeout | null = null

    const connectToStream = () => {
      // Clear any existing connection
      if (eventSource) {
        eventSource.close()
        eventSource = null
      }
      
      // Clear any pending reconnect
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
        reconnectTimeout = null
      }

      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000)
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://smart-adaptive-income-shield-sais.onrender.com'
      
      try {
        console.log(`📡 Connecting to SSE stream at ${baseUrl}/api/stream (Retry: ${retryCount})`)
        eventSource = new EventSource(`${baseUrl}/api/stream`)
        
        eventSource.onopen = () => {
          console.log('✅ SSE Connection established')
          setIsConnected(true)
          setIsLoading(false)
          retryCount = 0 // Reset on success
        }

        eventSource.onmessage = (event: MessageEvent) => {
          try {
            const newData = JSON.parse(event.data)
            setData(newData)
          } catch (error) {
            console.error('❌ Error parsing SSE data:', error)
          }
        }

        eventSource.onerror = (error) => {
          console.warn('⚠️ SSE Connection failed. Reconnecting...', error)
          setIsConnected(false)
          
          if (eventSource) {
            eventSource.close()
            eventSource = null
          }

          retryCount++
          console.log(`🔄 Reconnecting in ${retryDelay/1000}s...`)
          reconnectTimeout = setTimeout(connectToStream, retryDelay)
        }
      } catch (error) {
        console.error('❌ Failed to initialize EventSource:', error)
        setIsLoading(false)
        setIsConnected(false)
        
        retryCount++
        reconnectTimeout = setTimeout(connectToStream, retryDelay)
      }
    }

    connectToStream()

    return () => {
      if (eventSource) {
        eventSource.close()
        eventSource = null
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
    }
  }, [enabled])

  return { data, isConnected, isLoading }
}
