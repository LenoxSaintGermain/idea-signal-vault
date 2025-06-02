
-- Signal Vault Database Schema Setup
-- Run this in your Supabase SQL Editor

-- Enable RLS on auth.users if not already enabled
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  signal_points INTEGER DEFAULT 0,
  ideas_influenced INTEGER DEFAULT 0,
  estimated_take DECIMAL DEFAULT 0,
  is_admin BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  valuation_estimate DECIMAL DEFAULT 0,
  vote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  headline TEXT,
  subheadline TEXT,
  pain_point TEXT,
  solution TEXT,
  is_pain_point BOOLEAN DEFAULT false,
  cta TEXT,
  target_personas TEXT[] DEFAULT '{}'
);

-- Create user_activities table
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create detailed_feedback table
CREATE TABLE IF NOT EXISTS detailed_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  feedback TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create personas table
CREATE TABLE IF NOT EXISTS personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  linked_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  tags_of_interest TEXT[] DEFAULT '{}',
  idea_catalog TEXT[] DEFAULT '{}',
  review_queue TEXT[] DEFAULT '{}',
  concept_doc_catalog TEXT[] DEFAULT '{}',
  concept_doc_review_queue TEXT[] DEFAULT '{}',
  last_reviewed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create concept_docs table
CREATE TABLE IF NOT EXISTS concept_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  author TEXT NOT NULL,
  html_url TEXT NOT NULL,
  pdf_url TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  target_personas TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(id) ON DELETE CASCADE
);

-- Create persona_reviews table
CREATE TABLE IF NOT EXISTS persona_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
  concept_doc_id UUID REFERENCES concept_docs(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('keep', 'reject')),
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE detailed_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE concept_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow user creation on signup" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for ideas table
CREATE POLICY "Ideas are viewable by everyone" ON ideas
  FOR SELECT USING (true);

CREATE POLICY "Users can create ideas" ON ideas
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own ideas" ON ideas
  FOR UPDATE USING (auth.uid() = author_id);

-- RLS Policies for user_activities table
CREATE POLICY "Users can view their own activities" ON user_activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities" ON user_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for comments table
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for detailed_feedback table
CREATE POLICY "Feedback is viewable by everyone" ON detailed_feedback
  FOR SELECT USING (true);

CREATE POLICY "Users can create feedback" ON detailed_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for personas table
CREATE POLICY "Personas are viewable by everyone" ON personas
  FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can manage personas" ON personas
  FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for concept_docs table
CREATE POLICY "Concept docs are viewable by everyone" ON concept_docs
  FOR SELECT USING (true);

CREATE POLICY "Users can create concept docs" ON concept_docs
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- RLS Policies for persona_reviews table
CREATE POLICY "Persona reviews are viewable by everyone" ON persona_reviews
  FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can create reviews" ON persona_reviews
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for admin_logs table
CREATE POLICY "Only admins can view admin logs" ON admin_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Only admins can create admin logs" ON admin_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ideas_author_id ON ideas(author_id);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_tags ON ideas USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_idea_id ON user_activities(idea_id);
CREATE INDEX IF NOT EXISTS idx_comments_idea_id ON comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_detailed_feedback_idea_id ON detailed_feedback(idea_id);
CREATE INDEX IF NOT EXISTS idx_personas_linked_user_id ON personas(linked_user_id);
CREATE INDEX IF NOT EXISTS idx_concept_docs_uploaded_by ON concept_docs(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_persona_reviews_persona_id ON persona_reviews(persona_id);

-- Create function to automatically set admin status for specific email
CREATE OR REPLACE FUNCTION set_admin_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'lenox.paris@outlook.com' THEN
    NEW.is_admin = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set admin status on user creation
CREATE OR REPLACE TRIGGER trigger_set_admin_status
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_admin_status();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
SELECT 'Database schema setup completed successfully!' as status;
