-- Add agent_id column to transactions table
ALTER TABLE public.transactions 
ADD COLUMN agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL;

-- Create index for better performance on agent_id queries
CREATE INDEX IF NOT EXISTS idx_transactions_agent_id ON public.transactions(agent_id);

-- Update RLS policy to include agent_id filtering
-- Drop existing policy first
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;

-- Create new policy that allows users to see transactions for their agents
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (
        auth.uid() = user_id OR 
        agent_id IN (
            SELECT id FROM public.agents WHERE user_id = auth.uid()
        )
    );

-- Update insert policy to allow agent_id
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        (agent_id IS NULL OR agent_id IN (
            SELECT id FROM public.agents WHERE user_id = auth.uid()
        ))
    );

-- Update update policy to include agent_id check
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        (agent_id IS NULL OR agent_id IN (
            SELECT id FROM public.agents WHERE user_id = auth.uid()
        ))
    );