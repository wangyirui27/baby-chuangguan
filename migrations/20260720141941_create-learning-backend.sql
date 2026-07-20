-- Baby Island Quest learning backend.
-- The current app keeps phone-login sessions in Express. These tables support
-- server-side persistence through the InsForge admin client, and also include
-- owner-based RLS for a future direct InsForge-auth client.

CREATE OR REPLACE FUNCTION public.baby_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TABLE public.baby_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_user_id UUID NOT NULL UNIQUE,
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL DEFAULT '小禾' CHECK (char_length(child_name) BETWEEN 1 AND 10),
  child_age SMALLINT NOT NULL DEFAULT 4 CHECK (child_age BETWEEN 3 AND 6),
  map_music BOOLEAN NOT NULL DEFAULT TRUE,
  auto_pronunciation BOOLEAN NOT NULL DEFAULT TRUE,
  show_chinese_hints BOOLEAN NOT NULL DEFAULT TRUE,
  map_world TEXT NOT NULL DEFAULT 'ocean' CHECK (map_world IN ('ocean', 'desert', 'castle')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER baby_profiles_touch_updated_at
BEFORE UPDATE ON public.baby_profiles
FOR EACH ROW EXECUTE FUNCTION public.baby_touch_updated_at();

CREATE TABLE public.baby_world_progress (
  profile_id UUID NOT NULL REFERENCES public.baby_profiles(id) ON DELETE CASCADE,
  world_id TEXT NOT NULL CHECK (world_id IN ('ocean', 'desert', 'castle')),
  completed_levels INTEGER[] NOT NULL DEFAULT '{}',
  unlocked_through SMALLINT NOT NULL DEFAULT 1 CHECK (unlocked_through BETWEEN 1 AND 200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (profile_id, world_id),
  CHECK (array_length(completed_levels, 1) IS NULL OR array_length(completed_levels, 1) <= 200)
);

CREATE INDEX baby_world_progress_profile_idx ON public.baby_world_progress (profile_id);

CREATE TRIGGER baby_world_progress_touch_updated_at
BEFORE UPDATE ON public.baby_world_progress
FOR EACH ROW EXECUTE FUNCTION public.baby_touch_updated_at();

CREATE TABLE public.baby_learning_activity (
  profile_id UUID NOT NULL REFERENCES public.baby_profiles(id) ON DELETE CASCADE,
  activity_day DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (profile_id, activity_day)
);

CREATE TABLE public.baby_mistakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.baby_profiles(id) ON DELETE CASCADE,
  world_id TEXT NOT NULL CHECK (world_id IN ('ocean', 'desert', 'castle')),
  level_id SMALLINT NOT NULL CHECK (level_id BETWEEN 1 AND 200),
  word TEXT NOT NULL DEFAULT '' CHECK (char_length(word) <= 40),
  zh_title TEXT NOT NULL DEFAULT '' CHECK (char_length(zh_title) <= 40),
  selected TEXT NOT NULL DEFAULT '' CHECK (char_length(selected) <= 40),
  correct TEXT NOT NULL DEFAULT '' CHECK (char_length(correct) <= 40),
  mistake_count SMALLINT NOT NULL DEFAULT 1 CHECK (mistake_count BETWEEN 1 AND 99),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id, world_id, level_id)
);

CREATE INDEX baby_mistakes_profile_recent_idx
ON public.baby_mistakes (profile_id, updated_at DESC)
WHERE resolved_at IS NULL;

CREATE TRIGGER baby_mistakes_touch_updated_at
BEFORE UPDATE ON public.baby_mistakes
FOR EACH ROW EXECUTE FUNCTION public.baby_touch_updated_at();

CREATE TABLE public.baby_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.baby_profiles(id) ON DELETE CASCADE,
  world_id TEXT NOT NULL CHECK (world_id IN ('ocean', 'desert', 'castle')),
  level_id SMALLINT NOT NULL CHECK (level_id BETWEEN 1 AND 200),
  selected TEXT NOT NULL DEFAULT '' CHECK (char_length(selected) <= 40),
  correct TEXT NOT NULL DEFAULT '' CHECK (char_length(correct) <= 40),
  is_correct BOOLEAN NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX baby_quiz_attempts_profile_recent_idx
ON public.baby_quiz_attempts (profile_id, attempted_at DESC);

CREATE TABLE public.baby_support_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.baby_profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 4 AND 300),
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX baby_support_feedback_profile_recent_idx
ON public.baby_support_feedback (profile_id, created_at DESC);

CREATE TRIGGER baby_support_feedback_touch_updated_at
BEFORE UPDATE ON public.baby_support_feedback
FOR EACH ROW EXECUTE FUNCTION public.baby_touch_updated_at();

CREATE OR REPLACE FUNCTION public.baby_profile_owned(profile_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.baby_profiles
    WHERE id = profile_uuid
      AND auth_user_id = auth.uid()
  );
$$;

ALTER TABLE public.baby_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baby_world_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baby_learning_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baby_mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baby_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baby_support_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY baby_profiles_select_own ON public.baby_profiles
  FOR SELECT TO authenticated
  USING (auth_user_id = (SELECT auth.uid()));

CREATE POLICY baby_profiles_insert_own ON public.baby_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth_user_id = (SELECT auth.uid()));

CREATE POLICY baby_profiles_update_own ON public.baby_profiles
  FOR UPDATE TO authenticated
  USING (auth_user_id = (SELECT auth.uid()))
  WITH CHECK (auth_user_id = (SELECT auth.uid()));

CREATE POLICY baby_profiles_delete_own ON public.baby_profiles
  FOR DELETE TO authenticated
  USING (auth_user_id = (SELECT auth.uid()));

CREATE POLICY baby_world_progress_select_own ON public.baby_world_progress
  FOR SELECT TO authenticated
  USING (public.baby_profile_owned(profile_id));

CREATE POLICY baby_world_progress_insert_own ON public.baby_world_progress
  FOR INSERT TO authenticated
  WITH CHECK (public.baby_profile_owned(profile_id));

CREATE POLICY baby_world_progress_update_own ON public.baby_world_progress
  FOR UPDATE TO authenticated
  USING (public.baby_profile_owned(profile_id))
  WITH CHECK (public.baby_profile_owned(profile_id));

CREATE POLICY baby_world_progress_delete_own ON public.baby_world_progress
  FOR DELETE TO authenticated
  USING (public.baby_profile_owned(profile_id));

CREATE POLICY baby_learning_activity_select_own ON public.baby_learning_activity
  FOR SELECT TO authenticated
  USING (public.baby_profile_owned(profile_id));

CREATE POLICY baby_learning_activity_insert_own ON public.baby_learning_activity
  FOR INSERT TO authenticated
  WITH CHECK (public.baby_profile_owned(profile_id));

CREATE POLICY baby_learning_activity_delete_own ON public.baby_learning_activity
  FOR DELETE TO authenticated
  USING (public.baby_profile_owned(profile_id));

CREATE POLICY baby_mistakes_select_own ON public.baby_mistakes
  FOR SELECT TO authenticated
  USING (public.baby_profile_owned(profile_id));

CREATE POLICY baby_mistakes_insert_own ON public.baby_mistakes
  FOR INSERT TO authenticated
  WITH CHECK (public.baby_profile_owned(profile_id));

CREATE POLICY baby_mistakes_update_own ON public.baby_mistakes
  FOR UPDATE TO authenticated
  USING (public.baby_profile_owned(profile_id))
  WITH CHECK (public.baby_profile_owned(profile_id));

CREATE POLICY baby_mistakes_delete_own ON public.baby_mistakes
  FOR DELETE TO authenticated
  USING (public.baby_profile_owned(profile_id));

CREATE POLICY baby_quiz_attempts_select_own ON public.baby_quiz_attempts
  FOR SELECT TO authenticated
  USING (public.baby_profile_owned(profile_id));

CREATE POLICY baby_quiz_attempts_insert_own ON public.baby_quiz_attempts
  FOR INSERT TO authenticated
  WITH CHECK (public.baby_profile_owned(profile_id));

CREATE POLICY baby_support_feedback_select_own ON public.baby_support_feedback
  FOR SELECT TO authenticated
  USING (public.baby_profile_owned(profile_id));

CREATE POLICY baby_support_feedback_insert_own ON public.baby_support_feedback
  FOR INSERT TO authenticated
  WITH CHECK (public.baby_profile_owned(profile_id));

CREATE POLICY baby_support_feedback_update_own ON public.baby_support_feedback
  FOR UPDATE TO authenticated
  USING (public.baby_profile_owned(profile_id))
  WITH CHECK (public.baby_profile_owned(profile_id));

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.baby_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.baby_world_progress TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.baby_learning_activity TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.baby_mistakes TO authenticated;
GRANT SELECT, INSERT ON public.baby_quiz_attempts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.baby_support_feedback TO authenticated;
GRANT EXECUTE ON FUNCTION public.baby_profile_owned(UUID) TO authenticated;
