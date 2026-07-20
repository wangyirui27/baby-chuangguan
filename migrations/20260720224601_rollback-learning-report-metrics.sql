ALTER TABLE public.baby_mistakes
  DROP COLUMN IF EXISTS error_type;

ALTER TABLE public.baby_quiz_attempts
  DROP COLUMN IF EXISTS hint_used,
  DROP COLUMN IF EXISTS attempt_count,
  DROP COLUMN IF EXISTS duration_ms;

ALTER TABLE public.baby_world_progress
  DROP CONSTRAINT IF EXISTS baby_world_progress_level_stars_object,
  DROP COLUMN IF EXISTS level_stars;

ALTER TABLE public.baby_profiles
  DROP COLUMN IF EXISTS birth_date;
