CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  stripe_customer_id TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'inactive',
  subscription_plan TEXT,
  subscription_current_period_end INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_users_stripe_customer_id ON users (stripe_customer_id);

CREATE TABLE pets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id),
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  age_years REAL,
  weight_kg REAL,
  notes TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_pets_user_id ON pets (user_id);

CREATE TABLE chat_messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id),
  pet_id TEXT NOT NULL REFERENCES pets (id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_chat_messages_pet_id ON chat_messages (pet_id, created_at);
