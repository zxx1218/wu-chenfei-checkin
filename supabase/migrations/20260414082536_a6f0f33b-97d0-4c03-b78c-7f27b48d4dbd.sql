
CREATE TABLE public.milktea_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  type TEXT NOT NULL, -- 'milktea' or 'no_milktea'
  brand TEXT,
  drink_name TEXT
);

ALTER TABLE public.milktea_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view milktea records" ON public.milktea_records FOR SELECT USING (true);
CREATE POLICY "Anyone can insert milktea records" ON public.milktea_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete milktea records" ON public.milktea_records FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.milktea_records;
