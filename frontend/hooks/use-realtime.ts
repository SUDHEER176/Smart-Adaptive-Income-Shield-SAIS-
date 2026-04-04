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

    const connectToStream = () => {
      try {
        eventSource = new EventSource('http://localhost:5000/api/stream')
        setIsConnected(true)
        setIsLoading(false)

        eventSource.onmessage = (event) => {
          try {
            const newData = JSON.parse(event.data)
            setData(newData)
          } catch (error) {
            console.error('Error parsing realtime data:', error)
          }
        }

        eventSource.onerror = (error) => {
          console.error('SSE Connection failed. Possible reasons: Server is offline, CORS issues, or incorrect backend URL.', error)
          setIsConnected(false)
          eventSource?.close()
          // Reconnect after 5 seconds to avoid constant retry loops
          setTimeout(connectToStream, 5000)
        }
      } catch (error) {
        console.error('Failed to initialize EventSource connection:', error)
        setIsLoading(false)
        setIsConnected(false)
        // Retry connection after 5 seconds
        setTimeout(connectToStream, 5000)
      }
    }

    connectToStream()

    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [enabled])

  return { data, isConnected, isLoading }
}
