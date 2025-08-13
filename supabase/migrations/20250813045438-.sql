-- Restrict detailed_feedback visibility to feedback creator and idea author
-- 1) Remove public SELECT policy
DROP POLICY IF EXISTS "Feedback is viewable by everyone" ON public.detailed_feedback;

-- 2) Allow only the feedback creator to view their own feedback
CREATE POLICY "Users can view their own feedback"
ON public.detailed_feedback
FOR SELECT
USING (auth.uid() = user_id);

-- 3) Allow idea authors to view feedback left on their ideas
CREATE POLICY "Idea authors can view feedback on their ideas"
ON public.detailed_feedback
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.ideas i
    WHERE i.id = detailed_feedback.idea_id
      AND i.author_id = auth.uid()
  )
);
