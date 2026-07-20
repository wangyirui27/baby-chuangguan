ALTER TABLE public.baby_profiles
  ADD COLUMN IF NOT EXISTS birth_date DATE;

ALTER TABLE public.baby_world_progress
  ADD COLUMN IF NOT EXISTS level_stars JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD CONSTRAINT baby_world_progress_level_stars_object
  CHECK (jsonb_typeof(level_stars) = 'object');

ALTER TABLE public.baby_quiz_attempts
  ADD COLUMN IF NOT EXISTS duration_ms INTEGER
    CHECK (duration_ms IS NULL OR duration_ms BETWEEN 0 AND 600000),
  ADD COLUMN IF NOT EXISTS attempt_count SMALLINT NOT NULL DEFAULT 1
    CHECK (attempt_count BETWEEN 1 AND 20),
  ADD COLUMN IF NOT EXISTS hint_used BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.baby_mistakes
  ADD COLUMN IF NOT EXISTS error_type TEXT NOT NULL DEFAULT 'unknown'
    CHECK (error_type IN ('unknown', 'misread', 'meaning', 'listening', 'attention', 'motor'));
