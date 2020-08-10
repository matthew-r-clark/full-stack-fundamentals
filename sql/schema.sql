-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password text NOT NULL
);

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id serial PRIMARY KEY,
  user_id int REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  day text,
  month text,
  year text,
  completed boolean DEFAULT false NOT NULL,
  description text
);