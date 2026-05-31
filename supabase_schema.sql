-- ARISE: THE SYSTEM - Database Schema

-- 1. Profiles Table (Extends Auth.Users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT DEFAULT 'Newbie Hunter',
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  rank TEXT DEFAULT 'E-Rank',
  attribute_points INTEGER DEFAULT 0,
  onboarding JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Stats Table
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  strength INTEGER DEFAULT 10,
  agility INTEGER DEFAULT 10,
  vitality INTEGER DEFAULT 10,
  intelligence INTEGER DEFAULT 10,
  sense INTEGER DEFAULT 10,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Quests Table
CREATE TABLE quests (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  task_type TEXT,
  rank TEXT,
  difficulty TEXT,
  objectives JSONB NOT NULL,
  rewards JSONB NOT NULL,
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_penalty BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Inventory Table
CREATE TABLE inventory (
  id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rarity TEXT NOT NULL,
  description TEXT,
  is_consumable BOOLEAN DEFAULT TRUE,
  attribute_boost JSONB,
  quantity INTEGER DEFAULT 1,
  PRIMARY KEY (id, user_id)
);

-- 5. Wellness Tasks Table
CREATE TABLE wellness_tasks (
  id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  reward_xp INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (id, user_id)
);

-- 6. Programs Table
CREATE TABLE programs (
  id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  difficulty TEXT,
  category TEXT,
  tasks JSONB NOT NULL,
  rewards JSONB NOT NULL,
  is_claimed BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (id, user_id)
);

-- 7. System Logs
CREATE TABLE system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) - Basic Setup
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- (Repeat similar policies for other tables)
CREATE POLICY "Users can manage own stats" ON user_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own quests" ON quests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own inventory" ON inventory FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own wellness_tasks" ON wellness_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own programs" ON programs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own logs" ON system_logs FOR ALL USING (auth.uid() = user_id);
