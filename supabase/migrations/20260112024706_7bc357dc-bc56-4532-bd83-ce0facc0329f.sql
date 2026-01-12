-- Add DELETE policy for bump_records
CREATE POLICY "Anyone can delete bump records"
ON public.bump_records
FOR DELETE
USING (true);