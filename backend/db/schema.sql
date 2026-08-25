CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar TEXT,
  location TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  rating NUMERIC(3,2) DEFAULT 5,
  total_sales INTEGER DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES users(id) ON DELETE SET NULL,
  referral_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS phones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  price NUMERIC(14,2) NOT NULL CHECK (price >= 0),
  condition TEXT NOT NULL,
  description TEXT DEFAULT '',
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  location TEXT DEFAULT '',
  state TEXT DEFAULT '',
  seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
  seller_name TEXT NOT NULL,
  seller_phone TEXT NOT NULL,
  seller_rating NUMERIC(3,2) DEFAULT 5,
  commission_type TEXT NOT NULL DEFAULT 'fixed' CHECK (commission_type IN ('fixed','percent')),
  commission_value NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (commission_value >= 0),
  views INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phone_id UUID REFERENCES phones(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, phone_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','completed','cancelled')),
  total NUMERIC(14,2) NOT NULL DEFAULT 0,
  delivery_address TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','pending','paid','failed')),
  tx_ref TEXT UNIQUE,
  payment_link TEXT,
  paid_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  phone_id UUID REFERENCES phones(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  unit_price NUMERIC(14,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS referral_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  phone_id UUID REFERENCES phones(id) ON DELETE SET NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','credited','reversed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  credited_at TIMESTAMPTZ,
  UNIQUE(order_item_id, referrer_id)
);

CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_id UUID REFERENCES phones(id) ON DELETE SET NULL,
  phone_title TEXT NOT NULL,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
  last_message TEXT DEFAULT '',
  unread_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- Safe upgrades for databases created by older versions.
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_balance NUMERIC(14,2) NOT NULL DEFAULT 0;
ALTER TABLE phones ADD COLUMN IF NOT EXISTS commission_type TEXT NOT NULL DEFAULT 'fixed';
ALTER TABLE phones ADD COLUMN IF NOT EXISTS commission_value NUMERIC(14,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tx_ref TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_link TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS orders_tx_ref_idx ON orders(tx_ref) WHERE tx_ref IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_phone_unique_idx ON users(phone);
CREATE UNIQUE INDEX IF NOT EXISTS users_referral_code_idx ON users(referral_code) WHERE referral_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS phones_brand_idx ON phones(brand);
CREATE INDEX IF NOT EXISTS phones_created_idx ON phones(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_buyer_idx ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS orders_created_idx ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_chat_idx ON messages(chat_id, created_at);
CREATE INDEX IF NOT EXISTS referral_referrer_idx ON referral_commissions(referrer_id, created_at DESC);


CREATE TABLE IF NOT EXISTS registration_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  referral_code TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('email','sms')),
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS registration_verifications_email_idx ON registration_verifications(lower(email));
CREATE INDEX IF NOT EXISTS registration_verifications_phone_idx ON registration_verifications(phone);
CREATE INDEX IF NOT EXISTS registration_verifications_expires_idx ON registration_verifications(expires_at);

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_state TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_lga TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_landmark TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method TEXT NOT NULL DEFAULT 'delivery';

-- Existing production accounts are preserved as verified; all new registrations require OTP verification.
UPDATE users SET is_verified=TRUE WHERE is_verified=FALSE;
UPDATE users SET referral_balance=0 WHERE referral_balance IS NULL;
-- Normalize Nigerian phone numbers so 080... and +234... cannot create duplicate accounts.
UPDATE users SET phone='234'||substring(phone from 2) WHERE phone ~ '^0[0-9]{10}$';
UPDATE orders SET phone_number='234'||substring(phone_number from 2) WHERE phone_number ~ '^0[0-9]{10}$';

