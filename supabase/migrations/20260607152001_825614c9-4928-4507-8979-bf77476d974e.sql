
ALTER TABLE public.doi_records
  ADD COLUMN IF NOT EXISTS scene text,
  ADD COLUMN IF NOT EXISTS female_orgasm boolean,
  ADD COLUMN IF NOT EXISTS oral_sex boolean,
  ADD COLUMN IF NOT EXISTS oral_explosion boolean,
  ADD COLUMN IF NOT EXISTS ejaculation_method text;
