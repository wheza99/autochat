# AutoChat Production Deployment Guide

## 1. Overview

Panduan ini menjelaskan langkah-langkah untuk deploy aplikasi AutoChat ke production dengan implementasi keamanan yang telah dirancang. Deployment ini mencakup migrasi dari direct service calls ke secure API backend.

## 2. Pre-Deployment Checklist

### 2.1 Environment Variables

Pastikan semua environment variables berikut telah dikonfigurasi:

**Required Variables:**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# N8N Webhook (Server-side only)
N8N_WEBHOOK_URL=your_n8n_webhook_url
N8N_API_KEY=your_n8n_api_key

# Redis Configuration
REDIS_URL=your_redis_connection_string

# Encryption
ENCRYPTION_KEY=your_32_byte_encryption_key

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### 2.2 Database Setup

Jalankan SQL scripts berikut di Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own agents" ON agents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own agents" ON agents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own devices" ON devices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own devices" ON devices
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own chat sessions" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own chat sessions" ON chat_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM chat_sessions WHERE id = session_id));

CREATE POLICY "Users can create own messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM chat_sessions WHERE id = session_id));

-- Grant permissions
GRANT SELECT ON users TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON agents TO authenticated;
GRANT ALL PRIVILEGES ON devices TO authenticated;
GRANT ALL PRIVILEGES ON chat_sessions TO authenticated;
GRANT ALL PRIVILEGES ON messages TO authenticated;
GRANT ALL PRIVILEGES ON usage_logs TO authenticated;
GRANT ALL PRIVILEGES ON rate_limits TO authenticated;
```

## 3. Code Migration Steps

### 3.1 Update Frontend Components

**Step 1: Install API Client**
```bash
npm install @supabase/supabase-js
```

**Step 2: Replace Direct Service Calls**

Update `components/chat/chat-interface.tsx`:
```typescript
// Remove direct webhook call
// const response = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL, ...)

// Replace with secure API call
import { apiClient } from '@/lib/api-client'

const response = await apiClient.sendMessage(message, selectedAgent?.id || '', sessionId)
```

**Step 3: Update Agent Context**

Update `contexts/agent-context.tsx`:
```typescript
// Replace direct Supabase calls with API calls
const agents = await apiClient.getAgents()
```

### 3.2 Implement API Endpoints

**Step 1: Create Middleware**
```bash
mkdir -p app/api/middleware
```

Copy middleware files dari implementation guide:
- `app/api/middleware/auth.ts`
- `app/api/middleware/rateLimit.ts`
- `app/api/middleware/validation.ts`
- `app/api/middleware/errorHandler.ts`
- `app/api/middleware/logging.ts`

**Step 2: Create API Routes**
```bash
mkdir -p app/api/chat
mkdir -p app/api/agents
mkdir -p app/api/devices
mkdir -p app/api/health
```

Copy API route files dari implementation guide:
- `app/api/chat/send/route.ts`
- `app/api/agents/route.ts`
- `app/api/devices/register/route.ts`
- `app/api/health/route.ts`

**Step 3: Create Utility Libraries**
```bash
mkdir -p lib
```

Copy utility files:
- `lib/api-client.ts`
- `lib/encryption.ts`
- `lib/redis.ts`

## 4. Testing Before Deployment

### 4.1 Local Testing

```bash
# Install dependencies
npm install

# Run tests
npm run test

# Start development server
npm run dev
```

### 4.2 API Testing

Test semua endpoint dengan curl atau Postman:

```bash
# Test health check
curl http://localhost:3000/api/health

# Test chat API (requires auth)
curl -X POST http://localhost:3000/api/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{"message":"Hello","agentId":"test","sessionId":"test"}'
```

### 4.3 Security Testing

- [ ] Test rate limiting
- [ ] Test authentication
- [ ] Test input validation
- [ ] Test error handling
- [ ] Verify no sensitive data in responses

## 5. Deployment Platforms

### 5.1 Vercel Deployment

**Step 1: Install Vercel CLI**
```bash
npm i -g vercel
```

**Step 2: Configure Environment Variables**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add N8N_WEBHOOK_URL
vercel env add N8N_API_KEY
vercel env add REDIS_URL
vercel env add ENCRYPTION_KEY
```

**Step 3: Deploy**
```bash
vercel --prod
```

### 5.2 Netlify Deployment

**Step 1: Build Configuration**

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

**Step 2: Configure Environment Variables**
Set environment variables di Netlify dashboard.

### 5.3 Railway Deployment

**Step 1: Create railway.json**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Step 2: Deploy**
```bash
railway login
railway link
railway up
```

## 6. Post-Deployment Verification

### 6.1 Functional Testing

- [ ] User registration/login works
- [ ] Chat functionality works
- [ ] Agent management works
- [ ] Device management works
- [ ] All API endpoints respond correctly

### 6.2 Security Verification

- [ ] No sensitive environment variables exposed to client
- [ ] Rate limiting is active
- [ ] Authentication is required for protected routes
- [ ] HTTPS is enforced
- [ ] CORS is configured correctly

### 6.3 Performance Testing

- [ ] API response times < 2 seconds
- [ ] Database queries are optimized
- [ ] Rate limiting doesn't block legitimate users
- [ ] Memory usage is stable

## 7. Monitoring dan Maintenance

### 7.1 Health Monitoring

Set up monitoring untuk:
- API endpoint availability
- Database connection
- External service (N8N) availability
- Error rates
- Response times

### 7.2 Log Monitoring

Monitor logs untuk:
- Authentication failures
- Rate limit violations
- API errors
- Unusual usage patterns

### 7.3 Regular Maintenance

- [ ] Update dependencies monthly
- [ ] Review and rotate API keys quarterly
- [ ] Monitor usage patterns
- [ ] Clean up old logs and sessions
- [ ] Review and update rate limits

## 8. Rollback Plan

### 8.1 Quick Rollback

Jika terjadi masalah critical:

1. Revert ke versi sebelumnya:
```bash
vercel rollback
```

2. Atau disable API bridge sementara dengan environment variable:
```bash
USE_LEGACY_API=true
```

### 8.2 Database Rollback

Jika perlu rollback database:
1. Backup current state
2. Restore dari backup sebelumnya
3. Update aplikasi sesuai schema

## 9. Troubleshooting

### 9.1 Common Issues

**Issue: API calls failing**
- Check environment variables
- Verify Supabase connection
- Check authentication tokens

**Issue: Rate limiting too aggressive**
- Adjust rate limit configuration
- Check Redis connection
- Review usage patterns

**Issue: N8N webhook not responding**
- Check N8N service status
- Verify webhook URL
- Check API key validity

### 9.2 Debug Commands

```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL

# Test database connection
npx supabase status

# Check Redis connection
redis-cli ping

# View application logs
vercel logs
```

## 10. Security Best Practices

### 10.1 Ongoing Security

- [ ] Regular security audits
- [ ] Dependency vulnerability scanning
- [ ] API key rotation
- [ ] Access log monitoring
- [ ] Incident response plan

### 10.2 Compliance

- [ ] Data privacy compliance (GDPR, etc.)
- [ ] Security documentation
- [ ] User data handling policies
- [ ] Audit trail maintenance

Dengan mengikuti panduan ini, aplikasi AutoChat akan siap untuk production dengan implementasi keamanan yang robust dan scalable.