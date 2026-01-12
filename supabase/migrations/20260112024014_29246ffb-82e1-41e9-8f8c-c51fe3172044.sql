-- Create bump_records table to store all check-in records
CREATE TABLE public.bump_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bump', 'safe')),
  location TEXT,
  severity TEXT CHECK (severity IS NULL OR severity IN ('超痛', '很痛', '一般痛', '不怎么痛'))
);

-- Enable Row Level Security
ALTER TABLE public.bump_records ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read records (public app, no auth)
CREATE POLICY "Anyone can view bump records" 
ON public.bump_records 
FOR SELECT 
USING (true);

-- Create policy to allow anyone to insert records
CREATE POLICY "Anyone can insert bump records" 
ON public.bump_records 
FOR INSERT 
WITH CHECK (true);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.bump_records;