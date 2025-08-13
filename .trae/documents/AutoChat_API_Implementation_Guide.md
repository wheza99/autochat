# AutoChat API Implementation Guide

## 1. Struktur Folder API yang Direkomendasikan

```
app/api/
├── auth/
│   ├── session/
│   │   └── route.ts
│   └── refresh/
│       └── route.ts
├── chat/
│   ├── send/
│   │   └── route.ts
│   └── history/
│       └── route.ts
├── agents/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
├── devices/
│   ├── route.ts
│   ├── register/
│   │   └── route.ts
│   └── [id]/
│       ├── route.ts
│       └── status/
│           └── route.ts
├── usage/
│   └── stats/
│       └── route.ts
├── health/
│   └── route.ts
└── middleware/
    ├── auth.ts
    ├── rateLimit.ts
    ├── validation.ts
    └── logging.ts
```

## 2. Middleware Implementation

### 2.1 Authentication Middleware

**File:** **`app/api/middleware/auth.ts`**

```typescript
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for server-side
)

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    role: string
  }
}

export async function authenticateUser(request: NextRequest): Promise<{
  success: boolean
  user?: any
  error?: string
}> {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Missing or invalid authorization header' }
    }

    const token = authHeader.substring(7)
    
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return { success: false, error: 'Invalid or expired token' }
    }

    return { success: true, user }
  } catch (error) {
    console.error('Authentication error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

export function requireAuth(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    const authResult = await authenticateUser(request)
    
    if (!authResult.success) {
      return Response.json(
        { error: authResult.error },
        { status: 401 }
      )
    }

    // Add user to request object
    ;(request as AuthenticatedRequest).user = authResult.user
    
    return handler(request, context)
  }
}
```

### 2.2 Rate Limiting Middleware

**File:** **`app/api/middleware/rateLimit.ts`**

```typescript
import { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Different rate limits for different endpoints
const rateLimits = {
  chat: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
    analytics: true,
  }),
  agents: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'), // 30 requests per minute
    analytics: true,
  }),
  devices: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 requests per minute
    analytics: true,
  }),
  default: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute
    analytics: true,
  }),
}

export async function applyRateLimit(
  request: NextRequest,
  userId: string,
  type: keyof typeof rateLimits = 'default'
): Promise<{ success: boolean; error?: string; remaining?: number }> {
  try {
    const identifier = `${userId}:${type}`
    const rateLimit = rateLimits[type]
    
    const { success, limit, reset, remaining } = await rateLimit.limit(identifier)
    
    if (!success) {
      return {
        success: false,
        error: `Rate limit exceeded. Try again in ${Math.round((reset - Date.now()) / 1000)} seconds`,
        remaining: 0
      }
    }

    return { success: true, remaining }
  } catch (error) {
    console.error('Rate limiting error:', error)
    // Allow request to proceed if rate limiting fails
    return { success: true }
  }
}

export function withRateLimit(type: keyof typeof rateLimits = 'default') {
  return function (handler: Function) {
    return async (request: NextRequest, context?: any) => {
      const user = (request as any).user
      
      if (!user) {
        return Response.json(
          { error: 'Authentication required for rate limiting' },
          { status: 401 }
        )
      }

      const rateLimitResult = await applyRateLimit(request, user.id, type)
      
      if (!rateLimitResult.success) {
        return Response.json(
          { error: rateLimitResult.error },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Remaining': '0',
              'Retry-After': '60'
            }
          }
        )
      }

      const response = await handler(request, context)
      
      // Add rate limit headers to response
      if (response instanceof Response && rateLimitResult.remaining !== undefined) {
        response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
      }
      
      return response
    }
  }
}
```

### 2.3 Validation Middleware

**File:** **`app/api/middleware/validation.ts`**

```typescript
import { z } from 'zod'
import { NextRequest } from 'next/server'

// Common validation schemas
export const schemas = {
  chatMessage: z.object({
    message: z.string().min(1).max(1000),
    agentId: z.string().uuid(),
    sessionId: z.string().min(1).max(255),
  }),
  
  agent: z.object({
    name: z.string().min(1).max(100),
    phone: z.string().optional(),
    systemPrompt: z.string().max(2000).optional(),
    model: z.string().optional(),
    apiKey: z.string().optional(),
  }),
  
  deviceRegister: z.object({
    deviceName: z.string().min(1).max(100),
    deviceType: z.enum(['desktop', 'mobile', 'tablet']),
    deviceFingerprint: z.string().min(1).max(255),
  }),
}

export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return function (handler: Function) {
    return async (request: NextRequest, context?: any) => {
      try {
        const body = await request.json()
        const validatedData = schema.parse(body)
        
        // Add validated data to request
        ;(request as any).validatedData = validatedData
        
        return handler(request, context)
      } catch (error) {
        if (error instanceof z.ZodError) {
          return Response.json(
            {
              error: 'Validation failed',
              details: error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
              }))
            },
            { status: 400 }
          )
        }
        
        return Response.json(
          { error: 'Invalid request body' },
          { status: 400 }
        )
      }
    }
  }
}
```

## 3. API Endpoint Implementations

### 3.1 Secure Chat API

**File:** **`app/api/chat/send/route.ts`**

```typescript
import { NextRequest } from 'next/server'
import { requireAuth } from '@/app/api/middleware/auth'
import { withRateLimit } from '@/app/api/middleware/rateLimit'
import { validateRequest, schemas } from '@/app/api/middleware/validation'
import { supabase } from '@/lib/supabase'
import { logUsage } from '@/app/api/middleware/logging'

// Compose middleware
const handler = requireAuth(
  withRateLimit('chat')(
    validateRequest(schemas.chatMessage)(
      async (request: NextRequest) => {
        try {
          const user = (request as any).user
          const { message, agentId, sessionId } = (request as any).validatedData

          // Get agent details with security check
          const { data: agent, error: agentError } = await supabase
            .from('agents')
            .select('*')
            .eq('id', agentId)
            .eq('user_id', user.id)
            .single()

          if (agentError || !agent) {
            return Response.json(
              { error: 'Agent not found or access denied' },
              { status: 404 }
            )
          }

          // Create or get chat session
          const { data: session, error: sessionError } = await supabase
            .from('chat_sessions')
            .upsert({
              user_id: user.id,
              agent_id: agentId,
              session_id: sessionId,
              updated_at: new Date().toISOString()
            })
            .select()
            .single()

          if (sessionError) {
            console.error('Session error:', sessionError)
            return Response.json(
              { error: 'Failed to create chat session' },
              { status: 500 }
            )
          }

          // Save user message
          const { error: messageError } = await supabase
            .from('messages')
            .insert({
              session_id: session.id,
              type: 'user',
              content: message,
              metadata: { timestamp: new Date().toISOString() }
            })

          if (messageError) {
            console.error('Message save error:', messageError)
          }

          // Call N8N webhook securely from backend
          const webhookResponse = await fetch(
            `${process.env.N8N_WEBHOOK_URL}/fluterflow`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.N8N_API_KEY}`, // Secure API key
              },
              body: JSON.stringify({
                message,
                timestamp: new Date().toISOString(),
                user: {
                  id: user.id,
                  email: user.email,
                  name: user.user_metadata?.full_name || user.email?.split('@')[0]
                },
                sessionId,
                phone: agent.phone,
                systemPrompt: agent.system_prompt,
                model: agent.model
              })
            }
          )

          if (!webhookResponse.ok) {
            throw new Error(`Webhook failed: ${webhookResponse.status}`)
          }

          const webhookData = await webhookResponse.json()
          let assistantResponse = 'Sorry, I could not process your request.'

          // Extract response safely
          if (webhookData?.output) {
            assistantResponse = webhookData.output
          } else if (Array.isArray(webhookData) && webhookData[0]?.output) {
            assistantResponse = webhookData[0].output
          }

          // Save assistant response
          const { data: assistantMessage, error: assistantMessageError } = await supabase
            .from('messages')
            .insert({
              session_id: session.id,
              type: 'assistant',
              content: assistantResponse,
              metadata: { 
                timestamp: new Date().toISOString(),
                webhookResponse: webhookData
              }
            })
            .select()
            .single()

          if (assistantMessageError) {
            console.error('Assistant message save error:', assistantMessageError)
          }

          // Log usage
          await logUsage(user.id, 'chat_message', {
            agentId,
            sessionId,
            messageLength: message.length
          })

          return Response.json({
            success: true,
            data: agent
          })
        } catch (error) {
          console.error('Agent creation error:', error)
          return Response.json(
            { error: 'Failed to create agent' },
            { status: 500 }
          )
        }
      }
    )
  )
)

export { getHandler as GET, postHandler as POST }
```

### 3.3 Device Management API

**File:** **`app/api/devices/register/route.ts`**

```typescript
import { NextRequest } from 'next/server'
import { requireAuth } from '@/app/api/middleware/auth'
import { withRateLimit } from '@/app/api/middleware/rateLimit'
import { validateRequest, schemas } from '@/app/api/middleware/validation'
import { supabase } from '@/lib/supabase'

const handler = requireAuth(
  withRateLimit('devices')(
    validateRequest(schemas.deviceRegister)(
      async (request: NextRequest) => {
        try {
          const user = (request as any).user
          const { deviceName, deviceType, deviceFingerprint } = (request as any).validatedData

          // Check if device already exists
          const { data: existingDevice } = await supabase
            .from('devices')
            .select('id')
            .eq('user_id', user.id)
            .eq('device_fingerprint', deviceFingerprint)
            .single()

          if (existingDevice) {
            return Response.json(
              { error: 'Device already registered' },
              { status: 409 }
            )
          }

          const { data: device, error } = await supabase
            .from('devices')
            .insert({
              user_id: user.id,
              device_name: deviceName,
              device_type: deviceType,
              device_fingerprint: deviceFingerprint,
              is_active: true,
              last_seen: new Date().toISOString()
            })
            .select()
            .single()

          if (error) {
            console.error('Device registration error:', error)
            return Response.json(
              { error: 'Failed to register device' },
              { status: 500 }
            )
          }

          return Response.json({
            success: true,
            data: device
          })
        } catch (error) {
          console.error('Device registration API error:', error)
          return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
          )
        }
      }
    )
  )
)

export { handler as POST }
```

## 4. Encryption Utilities

**File:** **`lib/encryption.ts`**

```typescript
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY! // 32 bytes key
const ALGORITHM = 'aes-256-gcm'

export async function encrypt(text: string): Promise<string> {
  try {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY)
    cipher.setAAD(Buffer.from('additional-data'))
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

export async function decrypt(encryptedData: string): Promise<string> {
  try {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':')
    
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY)
    decipher.setAAD(Buffer.from('additional-data'))
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}
```

## 5. Usage Logging

**File:** **`app/api/middleware/logging.ts`**

```typescript
import { supabase } from '@/lib/supabase'

export async function logUsage(
  userId: string,
  action: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await supabase
      .from('usage_logs')
      .insert({
        user_id: userId,
        action,
        metadata,
        timestamp: new Date().toISOString()
      })
  } catch (error) {
    console.error('Usage logging error:', error)
    // Don't throw error to avoid breaking main functionality
  }
}

export async function getUsageStats(userId: string, timeframe: string = '30d') {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(timeframe.replace('d', '')))

    const { data, error } = await supabase
      .from('usage_logs')
      .select('action, metadata, timestamp')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Usage stats error:', error)
    return []
  }
}
```

## 6. Client-Side API Integration

### 6.1 Secure API Client

**File:** **`lib/api-client.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

class ApiClient {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      throw new Error('No authentication token available')
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    }
  }

  async sendMessage(message: string, agentId: string, sessionId: string) {
    const headers = await this.getAuthHeaders()
    
    const response = await fetch('/api/chat/send', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        agentId,
        sessionId
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to send message')
    }

    return response.json()
  }

  async getAgents() {
    const headers = await this.getAuthHeaders()
    
    const response = await fetch('/api/agents', {
      method: 'GET',
      headers
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch agents')
    }

    return response.json()
  }

  async createAgent(agentData: any) {
    const headers = await this.getAuthHeaders()
    
    const response = await fetch('/api/agents', {
      method: 'POST',
      headers,
      body: JSON.stringify(agentData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create agent')
    }

    return response.json()
  }

  async registerDevice(deviceData: any) {
    const headers = await this.getAuthHeaders()
    
    const response = await fetch('/api/devices/register', {
      method: 'POST',
      headers,
      body: JSON.stringify(deviceData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to register device')
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()
```

### 6.2 Updated Chat Interface

**File: `components/chat/chat-interface.tsx` (Updated)**
```typescript
// Replace the direct webhook call with secure API call
import { apiClient } from '@/lib/api-client'

const handleSendMessage = async (message: string) => {
  if (message.trim()) {
    const newMessage = {
      id: messages.length + 1,
      type: "user" as const,
      content: message,
      timestamp: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages([...messages, newMessage]);

    try {
      // Use secure API instead of direct webhook
      const response = await apiClient.sendMessage(
        message,
        selectedAgent?.id || '',
        sessionId
      )

      if (response.success && response.data?.response) {
        const assistantMessage = {
          id: messages.length + 2,
          type: "assistant" as const,
          content: response.data.response,
          timestamp: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: messages.length + 2,
        type: "assistant" as const,
        content: "Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi.",
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  }
};
```

## 7. Health Check dan Monitoring

### 7.1 Health Check Endpoint

**File: `app/api/health/route.ts`**
```typescript
import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Check database connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      throw new Error(`Database check failed: ${error.message}`)
    }

    // Check N8N webhook availability
    let n8nStatus = 'unknown'
    try {
      const n8nResponse = await fetch(`${process.env.N8N_WEBHOOK_URL}/health`, {
        method: 'GET',
        timeout: 5000
      })
      n8nStatus = n8nResponse.ok ? 'healthy' : 'unhealthy'
    } catch {
      n8nStatus = 'unreachable'
    }

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        n8n: n8nStatus
      },
      version: process.env.npm_package_version || '1.0.0'
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return Response.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
}
```

## 8. Error Handling dan Logging

### 8.1 Global Error Handler

**File: `app/api/middleware/errorHandler.ts`**
```typescript
import { NextRequest } from 'next/server'

export function withErrorHandler(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context)
    } catch (error) {
      console.error('API Error:', {
        url: request.url,
        method: request.method,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      })

      // Don't expose internal errors in production
      const isDevelopment = process.env.NODE_ENV === 'development'
      
      return Response.json(
        {
          error: isDevelopment 
            ? (error instanceof Error ? error.message : 'Unknown error')
            : 'Internal server error',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }
  }
}
```

## 9. Testing

### 9.1 API Testing dengan Jest

**File: `__tests__/api/chat.test.ts`**
```typescript
import { POST } from '@/app/api/chat/send/route'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@/lib/supabase')
jest.mock('@/app/api/middleware/auth')

describe('/api/chat/send', () => {
  it('should send message successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/chat/send', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
        agentId: 'test-agent-id',
        sessionId: 'test-session-id'
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.response).toBeDefined()
  })

  it('should handle rate limiting', async () => {
    // Test rate limiting logic
  })

  it('should validate input', async () => {
    // Test input validation
  })
})
```

## 10. Deployment Checklist

### 10.1 Environment Setup
- [ ] Set all required environment variables
- [ ] Configure Supabase RLS policies
- [ ] Set up Redis for rate limiting
- [ ] Configure N8N webhook security
- [ ] Set up monitoring and logging

### 10.2 Security Checklist
- [ ] API keys encrypted and stored securely
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Authentication required for all protected routes
- [ ] CORS configured properly
- [ ] Error messages don't expose sensitive information
- [ ] Database queries use parameterized statements
- [ ] File uploads (if any) are validated and sanitized

### 10.3 Performance Checklist
- [ ] Database indexes created
- [ ] API responses cached where appropriate
- [ ] Rate limiting configured
- [ ] Connection pooling enabled
- [ ] Monitoring and alerting set up: {
              response: assistantResponse,
              messageId: assistantMessage?.id
            }
          })

        } catch (error) {
          console.error('Chat API error:', error)
          return Response.json(
            { error: 'Failed to process message' },
            { status: 500 }
          )
        }
      }
    )
  )
)

export { handler as POST }
```

### 3.2 Agent Management API

**File:** **`app/api/agents/route.ts`**

```typescript
import { NextRequest } from 'next/server'
import { requireAuth } from '@/app/api/middleware/auth'
import { withRateLimit } from '@/app/api/middleware/rateLimit'
import { validateRequest, schemas } from '@/app/api/middleware/validation'
import { supabase } from '@/lib/supabase'
import { encrypt, decrypt } from '@/lib/encryption'

// GET - List user's agents
const getHandler = requireAuth(
  withRateLimit('agents')(
    async (request: NextRequest) => {
      try {
        const user = (request as any).user
        
        const { data: agents, error } = await supabase
          .from('agents')
          .select('id, name, phone, system_prompt, model, is_active, created_at, updated_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Agents fetch error:', error)
          return Response.json(
            { error: 'Failed to fetch agents' },
            { status: 500 }
          )
        }

        return Response.json({
          success: true,
          data: agents
        })
      } catch (error) {
        console.error('Agents API error:', error)
        return Response.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      }
    }
  )
)

// POST - Create new agent
const postHandler = requireAuth(
  withRateLimit('agents')(
    validateRequest(schemas.agent)(
      async (request: NextRequest) => {
        try {
          const user = (request as any).user
          const { name, phone, systemPrompt, model, apiKey } = (request as any).validatedData

          // Encrypt API key if provided
          let encryptedApiKey = null
          if (apiKey) {
            encryptedApiKey = await encrypt(apiKey)
          }

          const { data: agent, error } = await supabase
            .from('agents')
            .insert({
              user_id: user.id,
              name,
              phone,
              system_prompt: systemPrompt,
              model,
              api_key_encrypted: encryptedApiKey,
              is_active: true
            })
            .select('id, name, phone, system_prompt, model, is_active, created_at')
            .single()

          if (error) {
            console.error('Agent creation error:', error)
            return Response.json(
              { error: 'Failed to create agent' },
              { status: 500 }
            )
          }

          return Response.json({
            success: true,
            data
```

