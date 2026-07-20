CREATE OR REPLACE FUNCTION public.baby_valid_level_array(levels INTEGER[])
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(
    (
      SELECT COUNT(*) = COUNT(DISTINCT level_id)
        AND BOOL_AND(level_id BETWEEN 1 AND 200)
      FROM unnest(levels) AS value(level_id)
    ),
    TRUE
  );
$$;

ALTER TABLE public.baby_world_progress
  ADD CONSTRAINT baby_world_progress_completed_levels_valid
  CHECK (public.baby_valid_level_array(completed_levels));

DROP POLICY IF EXISTS baby_support_feedback_update_own ON public.baby_support_feedback;
REVOKE UPDATE ON public.baby_support_feedback FROM authenticated;

GRANT EXECUTE ON FUNCTION public.baby_valid_level_array(INTEGER[]) TO authenticated;
