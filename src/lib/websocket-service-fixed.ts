import { useOptimizationStore } from '@/store/optimization-store'

export class WebSocketService {
  private socket: WebSocket | null = null
  private url: string
  private isReconnecting = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 2000
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor(url: string = 'ws://localhost:8000/ws/optimization') {
    this.url = url
    this.connect = this.connect.bind(this)
    this.disconnect = this.disconnect.bind(this)
    this.send = this.send.bind(this)
    this.testConnection = this.testConnection.bind(this)
  }

  async connect() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('🔗 WebSocket already connected')
      return
    }

    console.log(`🔗 Connecting to WebSocket: ${this.url}`)
    
    try {
      this.socket = new WebSocket(this.url)
      
      this.socket.onopen = (event) => {
        console.log('✅ WebSocket connected', event)
        this.isReconnecting = false
        this.reconnectAttempts = 0
        
        // Update store
        const { updateConnectionStatus } = useOptimizationStore.getState()
        updateConnectionStatus(true, 'Connected')
        
        // Send initial message
        this.send({ type: 'connected', timestamp: new Date().toISOString() })
      }

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('📨 WebSocket message:', data)
          this.handleMessage(data)
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error)
        }
      }

      this.socket.onerror = (error) => {
        console.error('❌ WebSocket error:', {
          error,
          url: this.url,
          readyState: this.socket?.readyState,
          timestamp: new Date().toISOString()
        })
        
        const { updateConnectionStatus } = useOptimizationStore.getState()
        updateConnectionStatus(false, 'Connection error')
      }

      this.socket.onclose = (event) => {
        console.log('🔌 WebSocket closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          timestamp: new Date().toISOString()
        })
        
        const { updateConnectionStatus } = useOptimizationStore.getState()
        updateConnectionStatus(false, 'Connection closed')
        
        // Attempt reconnection if not intentional
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect()
        }
      }

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error)
      throw error
    }
  }

  disconnect() {
    console.log('🔌 Disconnecting WebSocket')
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    
    this.isReconnecting = false
    this.reconnectAttempts = 0
    
    if (this.socket) {
      this.socket.close(1000, 'Intentional disconnect')
      this.socket = null
    }
    
    const { updateConnectionStatus } = useOptimizationStore.getState()
    updateConnectionStatus(false, 'Disconnected')
  }

  send(data: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket not connected, cannot send data:', data)
    }
  }

  async testConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      const testSocket = new WebSocket('ws://localhost:8000/ws/optimization')
      
      const timeout = setTimeout(() => {
        console.log('🔍 Connection test timeout')
        testSocket.close()
        resolve(false)
      }, 5000)

      testSocket.onopen = () => {
        console.log('✅ Test connection successful')
        clearTimeout(timeout)
        testSocket.close()
        resolve(true)
      }

      testSocket.onerror = (error) => {
        console.log('❌ Test connection failed:', error)
        clearTimeout(timeout)
        resolve(false)
      }

      testSocket.onclose = () => {
        console.log('🔌 Test connection closed')
      }
    })
  }

  private attemptReconnect(): void {
    if (this.isReconnecting) return
    
    this.isReconnecting = true
    this.reconnectAttempts++
    
    console.log(`🔄 Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    setTimeout(async () => {
      try {
        await this.connect()
      } catch (error) {
        console.error('❌ Reconnection failed:', {
          error: error instanceof Error ? error.message : error,
          attempt: this.reconnectAttempts,
          maxAttempts: this.maxReconnectAttempts,
          timestamp: new Date().toISOString()
        })
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('❌ Max reconnection attempts reached')
          const { updateConnectionStatus } = useOptimizationStore.getState()
          updateConnectionStatus(false, 'Connection failed after multiple attempts')
        }
      }
    }, this.reconnectDelay * this.reconnectAttempts)
  }

  private handleMessage(message: any): void {
    console.log('📨 WebSocket message received:', message)

    switch (message.type) {
      case 'connected':
        console.log('✅ WebSocket handshake complete')
        break

      case 'optimization_started':
        console.log('🚀 Optimization started on backend')
        this.broadcastToStore('optimization_started', message)
        break

      case 'optimization_progress':
        console.log('📊 Optimization progress:', message.progress)
        this.broadcastToStore('optimization_progress', message)
        break

      case 'optimization_completed':
        console.log('✅ Optimization completed')
        this.broadcastToStore('optimization_completed', message)
        break

      case 'optimization_error':
        console.error('❌ Optimization error:', message.error)
        this.broadcastToStore('optimization_error', message)
        break

      case 'pong':
        console.log('🏓 Received pong from server')
        break

      default:
        console.log('📨 Unknown message type:', message.type)
    }
  }

  private broadcastToStore(type: string, data: any): void {
    // Broadcast WebSocket messages to store
    console.log('📡 Broadcasting to store:', { type, data })
    
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('websocket-message', {
      detail: { type, data, timestamp: new Date().toISOString() }
    }))
  }

  startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    console.log('💓 Starting WebSocket heartbeat')
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', timestamp: Date.now() })
      }
    }, 30000) // Every 30 seconds
  }

  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' | 'reconnecting' {
    if (!this.socket) return 'disconnected'
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return this.isReconnecting ? 'reconnecting' : 'connecting'
      case WebSocket.OPEN:
        return 'connected'
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return this.isReconnecting ? 'reconnecting' : 'disconnected'
      default:
        return 'disconnected'
    }
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService()

// Export configuration for different modes
export const websocketConfig = {
  mode: 'ortools' as 'ortools' | 'simulation',
  enableWebSocket: true,
  url: 'ws://localhost:8000/ws/optimization'
}

// Main service function
export function useWebSocketService() {
  const config = websocketConfig
  const isConnected = webSocketService.getConnectionStatus() === 'connected'
  const connectionError = webSocketService.getConnectionStatus() === 'disconnected'

  const connect = async () => {
    if (config.mode === 'ortools' && config.enableWebSocket) {
      try {
        await webSocketService.connect()
        webSocketService.startHeartbeat()
      } catch (error) {
        console.error('Failed to connect WebSocket:', error)
      }
    }
  }

  const disconnect = () => {
    webSocketService.disconnect()
  }

  const send = (message: any) => {
    webSocketService.send(message)
  }

  const testConnection = () => {
    return webSocketService.testConnection()
  }

  return {
    isConnected,
    connectionError,
    connectionStatus: webSocketService.getConnectionStatus(),
    connect,
    disconnect,
    send,
    testConnection
  }
}

// Hook to listen for WebSocket events
export function useWebSocketEvents() {
  const addEventListener = (callback: (event: CustomEvent) => void) => {
    window.addEventListener('websocket-message', callback as EventListener)
    
    // Return cleanup function
    return () => {
      window.removeEventListener('websocket-message', callback as EventListener)
    }
  }

  return { addEventListener }
}