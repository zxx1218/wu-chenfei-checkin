CREATE TABLE public.doi_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  position TEXT,
  passion_score INTEGER,
  notes TEXT
);

ALTER TABLE public.doi_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view doi records"
ON public.doi_records FOR SELECT USING (true);

CREATE POLICY "Anyone can insert doi records"
ON public.doi_records FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete doi records"
ON public.doi_records FOR DELETE USING (true);