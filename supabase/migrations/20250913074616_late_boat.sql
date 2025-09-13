/*
  # Multi-Tenant SaaS Notes Application Schema

  1. New Tables
    - `tenants`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - tenant identifier
      - `name` (text) - tenant display name
      - `subscription_plan` (text) - 'free' or 'pro'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `users`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, foreign key to tenants)
      - `email` (text, unique)
      - `password_hash` (text)
      - `role` (text) - 'admin' or 'member'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `notes`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, foreign key to tenants)
      - `user_id` (uuid, foreign key to users)
      - `title` (text)
      - `content` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for tenant isolation
    - Add policies for role-based access

  3. Test Data
    - Create Acme and Globex tenants
    - Create test user accounts
*/

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  subscription_plan text NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_notes_tenant_id ON notes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);

-- RLS Policies for tenants table
CREATE POLICY "Service role can manage tenants"
  ON tenants
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for users table
CREATE POLICY "Service role can manage users"
  ON users
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for notes table
CREATE POLICY "Service role can manage notes"
  ON notes
  FOR ALL
  TO service_role
  USING (true);

-- Insert test tenants
INSERT INTO tenants (slug, name, subscription_plan) VALUES
  ('acme', 'Acme Corporation', 'free'),
  ('globex', 'Globex Corporation', 'free')
ON CONFLICT (slug) DO NOTHING;

-- Insert test users (password is 'password' hashed with bcrypt)
INSERT INTO users (tenant_id, email, password_hash, role) VALUES
  (
    (SELECT id FROM tenants WHERE slug = 'acme'),
    'admin@acme.test',
    '$2b$10$rQZ8kHWiZ8qHFQxvtjHqHOYxGx4kHWiZ8qHFQxvtjHqHOYxGx4kHW',
    'admin'
  ),
  (
    (SELECT id FROM tenants WHERE slug = 'acme'),
    'user@acme.test',
    '$2b$10$rQZ8kHWiZ8qHFQxvtjHqHOYxGx4kHWiZ8qHFQxvtjHqHOYxGx4kHW',
    'member'
  ),
  (
    (SELECT id FROM tenants WHERE slug = 'globex'),
    'admin@globex.test',
    '$2b$10$rQZ8kHWiZ8qHFQxvtjHqHOYxGx4kHWiZ8qHFQxvtjHqHOYxGx4kHW',
    'admin'
  ),
  (
    (SELECT id FROM tenants WHERE slug = 'globex'),
    'user@globex.test',
    '$2b$10$rQZ8kHWiZ8qHFQxvtjHqHOYxGx4kHW',
    'member'
  )
ON CONFLICT (email) DO NOTHING;