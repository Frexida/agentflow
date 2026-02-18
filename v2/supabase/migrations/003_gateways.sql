-- Gateways table (Fly.io machine tracking)
CREATE TABLE IF NOT EXISTS gateways (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  machine_id TEXT NOT NULL,
  machine_name TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'nrt',
  gateway_token TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'stopped',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE gateways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own gateway" ON gateways
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
