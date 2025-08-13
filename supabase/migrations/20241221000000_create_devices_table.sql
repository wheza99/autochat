-- Create device table with new schema as requested
CREATE TABLE IF NOT EXISTS public.device (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT gen_random_uuid(),
    device_name TEXT NULL,
    device_type TEXT NULL,
    device_id TEXT NULL,
    phone_number TEXT NULL,
    last_active TIMESTAMP WITHOUT TIME ZONE NULL,
    is_active BOOLEAN NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NULL,
    api_key TEXT NULL,
    CONSTRAINT device_pkey PRIMARY KEY (id)

-- Enable RLS (Row Level Security)
ALTER TABLE public.device ENABLE ROW LEVEL SECURITY;

-- Create policies for device access
CREATE POLICY "Users can view their own devices" ON public.device
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own devices" ON public.device
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own devices" ON public.device
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own devices" ON public.device
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create indexes for faster queries
CREATE INDEX idx_device_user_id ON public.device(user_id);
CREATE INDEX idx_device_device_id ON public.device(device_id);
CREATE INDEX idx_device_last_active ON public.device(last_active);

-- Create user_device_limits table for managing device limits per user
CREATE TABLE IF NOT EXISTS public.user_device_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    max_devices INTEGER DEFAULT 5,
    plan_type VARCHAR(50) DEFAULT 'free', -- 'free', 'pro', 'enterprise'
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS for user_device_limits
ALTER TABLE public.user_device_limits ENABLE ROW LEVEL SECURITY;

-- Create policies for user_device_limits
CREATE POLICY "Users can view their own device limits" ON public.user_device_limits
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own device limits" ON public.user_device_limits
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own device limits" ON public.user_device_limits
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Create index for user_device_limits
CREATE INDEX idx_user_device_limits_user_id ON public.user_device_limits(user_id);

-- Insert default device limits for existing users
INSERT INTO public.user_device_limits (user_id, max_devices, plan_type)
SELECT id, 5, 'free'
FROM auth.users
WHERE id::text NOT IN (SELECT user_id::text FROM public.user_device_limits)
ON CONFLICT (user_id) DO NOTHING;