-- Create quiz_questions table
CREATE TABLE public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false')),
  category text NOT NULL CHECK (category IN ('rapper_facts', 'albums', 'origins', 'career', 'discography')),
  difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  rapper_id uuid REFERENCES public.rappers(id) ON DELETE SET NULL,
  album_id uuid REFERENCES public.albums(id) ON DELETE SET NULL,
  correct_answer text NOT NULL,
  wrong_answers jsonb NOT NULL DEFAULT '[]',
  points integer NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create quiz_badges table
CREATE TABLE public.quiz_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  threshold_correct integer NOT NULL,
  rarity text NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points integer NOT NULL DEFAULT 0,
  icon text NOT NULL DEFAULT 'Brain',
  badge_color text,
  tier_level integer DEFAULT 1,
  next_tier_id uuid REFERENCES public.quiz_badges(id),
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create user_quiz_attempts table
CREATE TABLE public.user_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  is_correct boolean NOT NULL,
  user_answer text NOT NULL,
  time_taken_seconds integer,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- Create user_quiz_badges table
CREATE TABLE public.user_quiz_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.quiz_badges(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Add quiz stats columns to member_stats
ALTER TABLE public.member_stats
ADD COLUMN IF NOT EXISTS quiz_questions_answered integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS quiz_correct_answers integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS quiz_current_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS quiz_best_streak integer DEFAULT 0;

-- Enable RLS on all new tables
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_questions (public read, admin write)
CREATE POLICY "Anyone can view active quiz questions"
ON public.quiz_questions FOR SELECT
USING (is_active = true);

-- RLS Policies for quiz_badges (public read)
CREATE POLICY "Anyone can view active quiz badges"
ON public.quiz_badges FOR SELECT
USING (is_active = true);

-- RLS Policies for user_quiz_attempts
CREATE POLICY "Users can view their own quiz attempts"
ON public.user_quiz_attempts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz attempts"
ON public.user_quiz_attempts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_quiz_badges
CREATE POLICY "Anyone can view user quiz badges"
ON public.user_quiz_badges FOR SELECT
USING (true);

CREATE POLICY "System can insert user quiz badges"
ON public.user_quiz_badges FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_quiz_questions_category ON public.quiz_questions(category);
CREATE INDEX idx_quiz_questions_rapper ON public.quiz_questions(rapper_id);
CREATE INDEX idx_quiz_questions_album ON public.quiz_questions(album_id);
CREATE INDEX idx_quiz_questions_active ON public.quiz_questions(is_active);
CREATE INDEX idx_user_quiz_attempts_user ON public.user_quiz_attempts(user_id);
CREATE INDEX idx_user_quiz_attempts_question ON public.user_quiz_attempts(question_id);
CREATE INDEX idx_user_quiz_badges_user ON public.user_quiz_badges(user_id);
CREATE INDEX idx_quiz_badges_category ON public.quiz_badges(category);

-- Function to get unanswered questions for a user
CREATE OR REPLACE FUNCTION public.get_unanswered_questions(
  p_user_id uuid,
  p_category text DEFAULT NULL,
  p_limit integer DEFAULT 10
)
RETURNS SETOF public.quiz_questions
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT q.* FROM quiz_questions q
  WHERE q.is_active = true
    AND q.id NOT IN (
      SELECT question_id FROM user_quiz_attempts WHERE user_id = p_user_id
    )
    AND (p_category IS NULL OR q.category = p_category)
  ORDER BY random()
  LIMIT p_limit;
$$;

-- Function to get user quiz stats by category
CREATE OR REPLACE FUNCTION public.get_user_quiz_stats_by_category(p_user_id uuid)
RETURNS TABLE(
  category text,
  total_answered bigint,
  total_correct bigint,
  accuracy numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    q.category,
    COUNT(*) as total_answered,
    COUNT(*) FILTER (WHERE a.is_correct) as total_correct,
    ROUND(COUNT(*) FILTER (WHERE a.is_correct)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as accuracy
  FROM user_quiz_attempts a
  JOIN quiz_questions q ON q.id = a.question_id
  WHERE a.user_id = p_user_id
  GROUP BY q.category;
$$;

-- Function to submit a quiz answer
CREATE OR REPLACE FUNCTION public.submit_quiz_answer(
  p_user_id uuid,
  p_question_id uuid,
  p_user_answer text,
  p_time_taken integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_correct_answer text;
  v_is_correct boolean;
  v_points integer;
  v_current_streak integer;
  v_new_badges jsonb := '[]'::jsonb;
BEGIN
  -- Get the correct answer
  SELECT correct_answer, points INTO v_correct_answer, v_points
  FROM quiz_questions
  WHERE id = p_question_id AND is_active = true;
  
  IF v_correct_answer IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Question not found');
  END IF;
  
  -- Check if already answered
  IF EXISTS (SELECT 1 FROM user_quiz_attempts WHERE user_id = p_user_id AND question_id = p_question_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already answered');
  END IF;
  
  -- Check if correct (case-insensitive)
  v_is_correct := LOWER(TRIM(p_user_answer)) = LOWER(TRIM(v_correct_answer));
  
  -- Insert the attempt
  INSERT INTO user_quiz_attempts (user_id, question_id, is_correct, user_answer, time_taken_seconds)
  VALUES (p_user_id, p_question_id, v_is_correct, p_user_answer, p_time_taken);
  
  -- Update member_stats
  UPDATE member_stats
  SET 
    quiz_questions_answered = COALESCE(quiz_questions_answered, 0) + 1,
    quiz_correct_answers = COALESCE(quiz_correct_answers, 0) + CASE WHEN v_is_correct THEN 1 ELSE 0 END,
    quiz_current_streak = CASE WHEN v_is_correct THEN COALESCE(quiz_current_streak, 0) + 1 ELSE 0 END,
    quiz_best_streak = GREATEST(COALESCE(quiz_best_streak, 0), CASE WHEN v_is_correct THEN COALESCE(quiz_current_streak, 0) + 1 ELSE quiz_current_streak END),
    updated_at = now()
  WHERE id = p_user_id;
  
  -- If no member_stats row exists, create one
  IF NOT FOUND THEN
    INSERT INTO member_stats (id, quiz_questions_answered, quiz_correct_answers, quiz_current_streak, quiz_best_streak)
    VALUES (p_user_id, 1, CASE WHEN v_is_correct THEN 1 ELSE 0 END, CASE WHEN v_is_correct THEN 1 ELSE 0 END, CASE WHEN v_is_correct THEN 1 ELSE 0 END);
  END IF;
  
  -- Check and award badges
  SELECT check_and_award_quiz_badges(p_user_id) INTO v_new_badges;
  
  RETURN jsonb_build_object(
    'success', true,
    'is_correct', v_is_correct,
    'correct_answer', v_correct_answer,
    'points_earned', CASE WHEN v_is_correct THEN v_points ELSE 0 END,
    'new_badges', v_new_badges
  );
END;
$$;

-- Function to check and award quiz badges
CREATE OR REPLACE FUNCTION public.check_and_award_quiz_badges(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_correct integer;
  v_best_streak integer;
  v_category_stats record;
  v_badge record;
  v_new_badges jsonb := '[]'::jsonb;
BEGIN
  -- Get overall stats
  SELECT 
    COALESCE(quiz_correct_answers, 0),
    COALESCE(quiz_best_streak, 0)
  INTO v_total_correct, v_best_streak
  FROM member_stats
  WHERE id = p_user_id;
  
  -- Check overall badges
  FOR v_badge IN 
    SELECT * FROM quiz_badges 
    WHERE category = 'overall' 
      AND is_active = true 
      AND threshold_correct <= v_total_correct
      AND id NOT IN (SELECT badge_id FROM user_quiz_badges WHERE user_id = p_user_id)
  LOOP
    INSERT INTO user_quiz_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id);
    v_new_badges := v_new_badges || jsonb_build_object('id', v_badge.id, 'name', v_badge.name, 'icon', v_badge.icon, 'rarity', v_badge.rarity);
  END LOOP;
  
  -- Check streak badges
  FOR v_badge IN 
    SELECT * FROM quiz_badges 
    WHERE category = 'streak' 
      AND is_active = true 
      AND threshold_correct <= v_best_streak
      AND id NOT IN (SELECT badge_id FROM user_quiz_badges WHERE user_id = p_user_id)
  LOOP
    INSERT INTO user_quiz_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id);
    v_new_badges := v_new_badges || jsonb_build_object('id', v_badge.id, 'name', v_badge.name, 'icon', v_badge.icon, 'rarity', v_badge.rarity);
  END LOOP;
  
  -- Check category-specific badges
  FOR v_category_stats IN 
    SELECT q.category, COUNT(*) FILTER (WHERE a.is_correct) as correct_count
    FROM user_quiz_attempts a
    JOIN quiz_questions q ON q.id = a.question_id
    WHERE a.user_id = p_user_id
    GROUP BY q.category
  LOOP
    FOR v_badge IN 
      SELECT * FROM quiz_badges 
      WHERE category = v_category_stats.category 
        AND is_active = true 
        AND threshold_correct <= v_category_stats.correct_count
        AND id NOT IN (SELECT badge_id FROM user_quiz_badges WHERE user_id = p_user_id)
    LOOP
      INSERT INTO user_quiz_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id);
      v_new_badges := v_new_badges || jsonb_build_object('id', v_badge.id, 'name', v_badge.name, 'icon', v_badge.icon, 'rarity', v_badge.rarity);
    END LOOP;
  END LOOP;
  
  RETURN v_new_badges;
END;
$$;

-- Seed initial quiz badges
INSERT INTO public.quiz_badges (name, description, category, threshold_correct, rarity, points, icon, tier_level) VALUES
-- Overall badges
('Quiz Rookie', 'Answer 10 questions correctly', 'overall', 10, 'common', 50, 'Brain', 1),
('Quiz Enthusiast', 'Answer 50 questions correctly', 'overall', 50, 'rare', 150, 'Lightbulb', 2),
('Quiz Master', 'Answer 150 questions correctly', 'overall', 150, 'epic', 400, 'GraduationCap', 3),
('Quiz Legend', 'Answer 500 questions correctly', 'overall', 500, 'legendary', 1000, 'Crown', 4),
-- Rapper facts badges
('Rapper Scholar I', 'Get 25 rapper facts correct', 'rapper_facts', 25, 'common', 75, 'User', 1),
('Rapper Scholar II', 'Get 75 rapper facts correct', 'rapper_facts', 75, 'rare', 200, 'Users', 2),
('Rapper Expert', 'Get 200 rapper facts correct', 'rapper_facts', 200, 'epic', 500, 'UserCheck', 3),
-- Album badges
('Discography Buff I', 'Get 25 album questions correct', 'albums', 25, 'common', 75, 'Disc', 1),
('Discography Buff II', 'Get 75 album questions correct', 'albums', 75, 'rare', 200, 'Disc3', 2),
('Album Archivist', 'Get 200 album questions correct', 'albums', 200, 'epic', 500, 'Library', 3),
-- Origins badges
('Geography Guru I', 'Get 25 origin questions correct', 'origins', 25, 'common', 75, 'MapPin', 1),
('Geography Guru II', 'Get 75 origin questions correct', 'origins', 75, 'rare', 200, 'Map', 2),
('Origins Master', 'Get 200 origin questions correct', 'origins', 200, 'epic', 500, 'Globe', 3),
-- Career badges
('Timeline Tracker I', 'Get 25 career questions correct', 'career', 25, 'common', 75, 'Calendar', 1),
('Timeline Tracker II', 'Get 75 career questions correct', 'career', 75, 'rare', 200, 'Clock', 2),
('Career Historian', 'Get 200 career questions correct', 'career', 200, 'epic', 500, 'History', 3),
-- Streak badges
('Hot Streak', 'Get 10 in a row', 'streak', 10, 'common', 100, 'Flame', 1),
('Fire Streak', 'Get 25 in a row', 'streak', 25, 'rare', 250, 'Zap', 2),
('Inferno Streak', 'Get 50 in a row', 'streak', 50, 'epic', 600, 'Sparkles', 3),
('Untouchable', 'Get 100 in a row', 'streak', 100, 'legendary', 1500, 'Trophy', 4);

-- Update trigger for timestamps
CREATE TRIGGER update_quiz_questions_updated_at
BEFORE UPDATE ON public.quiz_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quiz_badges_updated_at
BEFORE UPDATE ON public.quiz_badges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();