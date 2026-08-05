-- Allow the math maps to use the shared learning backend.

ALTER TABLE public.baby_profiles
  DROP CONSTRAINT IF EXISTS baby_profiles_map_world_check,
  ADD CONSTRAINT baby_profiles_map_world_check
  CHECK (map_world IN ('ocean', 'desert', 'math', 'math58', 'math912', 'castle'));

ALTER TABLE public.baby_world_progress
  DROP CONSTRAINT IF EXISTS baby_world_progress_world_id_check,
  ADD CONSTRAINT baby_world_progress_world_id_check
  CHECK (world_id IN ('ocean', 'desert', 'math', 'math58', 'math912', 'castle'));

ALTER TABLE public.baby_mistakes
  DROP CONSTRAINT IF EXISTS baby_mistakes_world_id_check,
  ADD CONSTRAINT baby_mistakes_world_id_check
  CHECK (world_id IN ('ocean', 'desert', 'math', 'math58', 'math912', 'castle'));

ALTER TABLE public.baby_quiz_attempts
  DROP CONSTRAINT IF EXISTS baby_quiz_attempts_world_id_check,
  ADD CONSTRAINT baby_quiz_attempts_world_id_check
  CHECK (world_id IN ('ocean', 'desert', 'math', 'math58', 'math912', 'castle'));
