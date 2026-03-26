/*
  # Kindergarten Substitute Teacher Management System

  1. New Tables
    - `users`: Extended user profiles with role and metadata
    - `kindergartens`: Kindergarten facilities with details
    - `substitute_profiles`: Substitute teacher information and contact details
    - `availability`: Date-specific availability for substitute teachers
    - `kindergarten_preferences`: Preferences for which kindergartens substitutes will work at
    - `substitute_requests`: Requests for substitutes created by kindergarten teachers
    - `request_matches`: Tracking which substitutes were notified for each request
    - `request_acceptances`: History of which substitute accepted which request

  2. Security
    - Enable RLS on all tables
    - Add policies for user-specific data access
    - Add policies for request visibility and management

  3. Relationships
    - Foreign keys linking all tables to users or requests
    - Cascade delete for cleanup
    - Unique constraints where appropriate
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_id uuid UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL CHECK (role IN ('kindergarten_teacher', 'substitute_teacher')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = supabase_id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = supabase_id)
  WITH CHECK (auth.uid() = supabase_id);

-- Create kindergartens table
CREATE TABLE IF NOT EXISTS kindergartens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  address text,
  phone text,
  email text,
  principal_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE kindergartens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view kindergartens"
  ON kindergartens FOR SELECT
  TO authenticated
  USING (true);

-- Create substitute_profiles table
CREATE TABLE IF NOT EXISTS substitute_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bio text,
  experience_years integer DEFAULT 0,
  certifications text,
  hourly_rate numeric(10, 2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE substitute_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all substitute profiles"
  ON substitute_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Substitutes can update own profile"
  ON substitute_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create availability table
CREATE TABLE IF NOT EXISTS availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  substitute_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  available_date date NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all availability"
  ON availability FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Substitutes can manage own availability"
  ON availability FOR INSERT
  TO authenticated
  WITH CHECK (substitute_id = auth.uid());

CREATE POLICY "Substitutes can update own availability"
  ON availability FOR UPDATE
  TO authenticated
  USING (substitute_id = auth.uid())
  WITH CHECK (substitute_id = auth.uid());

CREATE POLICY "Substitutes can delete own availability"
  ON availability FOR DELETE
  TO authenticated
  USING (substitute_id = auth.uid());

-- Create kindergarten_preferences table
CREATE TABLE IF NOT EXISTS kindergarten_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  substitute_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kindergarten_id uuid NOT NULL REFERENCES kindergartens(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(substitute_id, kindergarten_id)
);

ALTER TABLE kindergarten_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all preferences"
  ON kindergarten_preferences FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Substitutes can manage own preferences"
  ON kindergarten_preferences FOR INSERT
  TO authenticated
  WITH CHECK (substitute_id = auth.uid());

CREATE POLICY "Substitutes can delete own preferences"
  ON kindergarten_preferences FOR DELETE
  TO authenticated
  USING (substitute_id = auth.uid());

-- Create substitute_requests table
CREATE TABLE IF NOT EXISTS substitute_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requesting_teacher_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kindergarten_id uuid NOT NULL REFERENCES kindergartens(id),
  request_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE substitute_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all requests"
  ON substitute_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can create requests"
  ON substitute_requests FOR INSERT
  TO authenticated
  WITH CHECK (requesting_teacher_id = auth.uid());

CREATE POLICY "Requesters can update own requests"
  ON substitute_requests FOR UPDATE
  TO authenticated
  USING (requesting_teacher_id = auth.uid())
  WITH CHECK (requesting_teacher_id = auth.uid());

-- Create request_matches table
CREATE TABLE IF NOT EXISTS request_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES substitute_requests(id) ON DELETE CASCADE,
  substitute_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notified_at timestamptz DEFAULT now(),
  notification_method text DEFAULT 'email',
  UNIQUE(request_id, substitute_id)
);

ALTER TABLE request_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view matches"
  ON request_matches FOR SELECT
  TO authenticated
  USING (true);

-- Create request_acceptances table
CREATE TABLE IF NOT EXISTS request_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL UNIQUE REFERENCES substitute_requests(id) ON DELETE CASCADE,
  substitute_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accepted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE request_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view acceptances"
  ON request_acceptances FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Substitutes can accept requests"
  ON request_acceptances FOR INSERT
  TO authenticated
  WITH CHECK (substitute_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_substitute_profiles_user_id ON substitute_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_availability_substitute_id ON availability(substitute_id);
CREATE INDEX IF NOT EXISTS idx_availability_date ON availability(available_date);
CREATE INDEX IF NOT EXISTS idx_kindergarten_preferences_substitute_id ON kindergarten_preferences(substitute_id);
CREATE INDEX IF NOT EXISTS idx_kindergarten_preferences_kindergarten_id ON kindergarten_preferences(kindergarten_id);
CREATE INDEX IF NOT EXISTS idx_substitute_requests_teacher_id ON substitute_requests(requesting_teacher_id);
CREATE INDEX IF NOT EXISTS idx_substitute_requests_kindergarten_id ON substitute_requests(kindergarten_id);
CREATE INDEX IF NOT EXISTS idx_substitute_requests_date ON substitute_requests(request_date);
CREATE INDEX IF NOT EXISTS idx_substitute_requests_status ON substitute_requests(status);
CREATE INDEX IF NOT EXISTS idx_request_matches_request_id ON request_matches(request_id);
CREATE INDEX IF NOT EXISTS idx_request_matches_substitute_id ON request_matches(substitute_id);
CREATE INDEX IF NOT EXISTS idx_request_acceptances_request_id ON request_acceptances(request_id);
CREATE INDEX IF NOT EXISTS idx_request_acceptances_substitute_id ON request_acceptances(substitute_id);
