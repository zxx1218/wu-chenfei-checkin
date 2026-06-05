
ALTER TABLE public.doi_records
  ADD COLUMN IF NOT EXISTS partner_overall_score integer,
  ADD COLUMN IF NOT EXISTS partner_passion_score integer,
  ADD COLUMN IF NOT EXISTS partner_duration_feedback text,
  ADD COLUMN IF NOT EXISTS partner_position_feedback text,
  ADD COLUMN IF NOT EXISTS partner_comment text,
  ADD COLUMN IF NOT EXISTS partner_reviewer text,
  ADD COLUMN IF NOT EXISTS partner_reviewed_at timestamptz;

CREATE POLICY "Anyone can update doi records"
  ON public.doi_records
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
