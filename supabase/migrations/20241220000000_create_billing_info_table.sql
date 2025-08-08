-- Create billing_info table
CREATE TABLE IF NOT EXISTS public.billing_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    card_holder_name VARCHAR(255) NOT NULL,
    card_number VARCHAR(19) NOT NULL, -- Formatted with spaces
    expiry_month VARCHAR(2) NOT NULL,
    expiry_year VARCHAR(4) NOT NULL,
    cvv VARCHAR(4) NOT NULL,
    billing_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.billing_info ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only access their own billing info
CREATE POLICY "Users can view their own billing info" ON public.billing_info
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own billing info" ON public.billing_info
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own billing info" ON public.billing_info
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own billing info" ON public.billing_info
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_billing_info_user_id ON public.billing_info(user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_billing_info_updated_at
    BEFORE UPDATE ON public.billing_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();