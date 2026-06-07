-- 创建数据库迁移文件以添加新字段到doi_records表

ALTER TABLE public.doi_records
  ADD COLUMN IF NOT EXISTS scene TEXT,
  ADD COLUMN IF NOT EXISTS female_orgasm BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS oral_sex BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS oral_explosion BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ejaculation_method TEXT;

-- 更新策略确保新字段也可以被访问
CREATE POLICY "Anyone can insert doi records"
  ON public.doi_records
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update doi records"
  ON public.doi_records
  FOR UPDATE
  USING (true)
  WITH CHECK (true);