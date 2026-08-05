-- Keep the bounded 3-5 math attempt log available for cross-device reports and coach input.
ALTER TABLE public.baby_profiles
  ADD COLUMN IF NOT EXISTS math_attempts JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.baby_profiles
  DROP CONSTRAINT IF EXISTS baby_profiles_math_attempts_array,
  ADD CONSTRAINT baby_profiles_math_attempts_array
  CHECK (jsonb_typeof(math_attempts) = 'array' AND jsonb_array_length(math_attempts) <= 80);
