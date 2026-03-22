-- ============================================================
-- VibeHome — Initial Schema Migration
-- Run: supabase db push
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;  -- pgvector for partner matching
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS ───────────────────────────────────────────────────
CREATE TABLE public.users (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  email         text        UNIQUE NOT NULL,
  full_name     text,
  avatar_url    text,
  role          text        CHECK (role IN ('host', 'renter', 'co_owner')),
  stripe_id     text,
  sub_tier      text        NOT NULL DEFAULT 'free' CHECK (sub_tier IN ('free', 'pro')),
  budget_min    integer,
  budget_max    integer,
  location      geography(Point, 4326),
  embedding     vector(1536),     -- for pgvector partner matching
  kyc_status    text        NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'failed')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── PROPERTIES ──────────────────────────────────────────────
CREATE TABLE public.properties (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id       uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title         text        NOT NULL,
  description   text,
  city          text,
  neighborhood  text,
  location      geography(Point, 4326),
  price_month   integer     NOT NULL CHECK (price_month > 0),  -- cents
  type          text        CHECK (type IN ('apartment', 'house', 'room', 'co-living')),
  co_own_ok     boolean     NOT NULL DEFAULT false,
  total_shares  integer,
  share_price   integer,    -- cents per share
  images        text[]      NOT NULL DEFAULT '{}',
  verified      boolean     NOT NULL DEFAULT false,
  status        text        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER properties_updated_at BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_properties_host_id ON public.properties(host_id);
CREATE INDEX idx_properties_city ON public.properties(city);
CREATE INDEX idx_properties_location ON public.properties USING GIST(location);

-- ─── VIBE REVIEWS ────────────────────────────────────────────
CREATE TABLE public.vibe_reviews (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  neighborhood    text        NOT NULL,
  city            text        NOT NULL,
  location        geography(Point, 4326),
  noise_score     integer     NOT NULL CHECK (noise_score BETWEEN 1 AND 10),
  light_score     integer     NOT NULL CHECK (light_score BETWEEN 1 AND 10),
  wifi_score      integer     NOT NULL CHECK (wifi_score BETWEEN 1 AND 10),
  community_score integer     NOT NULL CHECK (community_score BETWEEN 1 AND 10),
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_vibe_reviews_location ON public.vibe_reviews USING GIST(location);
CREATE INDEX idx_vibe_reviews_city ON public.vibe_reviews(city, neighborhood);

-- Stored function: get neighbourhood vibes within radius
CREATE OR REPLACE FUNCTION get_vibes_near(
  user_lat  double precision,
  user_lng  double precision,
  radius_meters integer DEFAULT 5000
)
RETURNS TABLE (
  neighborhood    text,
  city            text,
  lat             double precision,
  lng             double precision,
  review_count    bigint,
  avg_noise       numeric,
  avg_light       numeric,
  avg_wifi        numeric,
  avg_community   numeric,
  overall_score   numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.neighborhood,
    v.city,
    AVG(ST_Y(v.location::geometry))::double precision AS lat,
    AVG(ST_X(v.location::geometry))::double precision AS lng,
    COUNT(*) AS review_count,
    ROUND(AVG(v.noise_score), 1)     AS avg_noise,
    ROUND(AVG(v.light_score), 1)     AS avg_light,
    ROUND(AVG(v.wifi_score), 1)      AS avg_wifi,
    ROUND(AVG(v.community_score), 1) AS avg_community,
    ROUND((AVG(v.noise_score) + AVG(v.light_score) + AVG(v.wifi_score) + AVG(v.community_score)) / 4, 1) AS overall_score
  FROM public.vibe_reviews v
  WHERE ST_DWithin(
    v.location,
    ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
    radius_meters
  )
  GROUP BY v.neighborhood, v.city
  ORDER BY review_count DESC;
END;
$$ LANGUAGE plpgsql;

-- ─── CO-POOL GROUPS ──────────────────────────────────────────
CREATE TABLE public.copool_groups (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id      uuid        NOT NULL REFERENCES public.users(id),
  name            text        NOT NULL,
  target_city     text,
  target_budget   integer,    -- total pool budget in cents
  max_members     integer     NOT NULL DEFAULT 6 CHECK (max_members BETWEEN 2 AND 10),
  property_id     uuid        REFERENCES public.properties(id),
  legal_status    text        NOT NULL DEFAULT 'forming'
                              CHECK (legal_status IN ('forming', 'funded', 'signed', 'active', 'dissolved')),
  invite_code     text        NOT NULL UNIQUE,
  stripe_acct     text,       -- Stripe Connect Express account ID
  agreement_url   text,       -- Supabase Storage URL for signed PDF
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER copool_groups_updated_at BEFORE UPDATE ON public.copool_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_copool_invite_code ON public.copool_groups(invite_code);

CREATE TABLE public.copool_members (
  pool_id       uuid        NOT NULL REFERENCES public.copool_groups(id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  share_pct     numeric(5,2) NOT NULL CHECK (share_pct > 0 AND share_pct <= 100),
  contribution  integer     NOT NULL,  -- monthly in cents
  kyc_cleared   boolean     NOT NULL DEFAULT false,
  joined_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (pool_id, user_id)
);

-- ─── BOOKINGS ────────────────────────────────────────────────
CREATE TABLE public.bookings (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id         uuid        NOT NULL REFERENCES public.properties(id),
  renter_id           uuid        NOT NULL REFERENCES public.users(id),
  payment_intent_id   text        UNIQUE,
  amount_cents        integer     NOT NULL,
  fee_cents           integer     NOT NULL,  -- VibeHome 2.5% cut
  status              text        NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  start_date          date        NOT NULL,
  end_date            date        NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

CREATE INDEX idx_bookings_property_id ON public.bookings(property_id);
CREATE INDEX idx_bookings_renter_id ON public.bookings(renter_id);
CREATE INDEX idx_bookings_payment_intent ON public.bookings(payment_intent_id);

-- ─── SUBSCRIPTIONS ───────────────────────────────────────────
CREATE TABLE public.subscriptions (
  id                      uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                 uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_subscription_id  text        UNIQUE,
  stripe_customer_id      text,
  tier                    text        NOT NULL CHECK (tier IN ('host_pro', 'renter_pro', 'pool_premium')),
  status                  text        NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_end      timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now()
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────

ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vibe_reviews  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copool_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users: anyone can read, only self can update
CREATE POLICY "Users are viewable by all" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Properties: anyone can read active; only host can write
CREATE POLICY "Active properties are public" ON public.properties FOR SELECT USING (status = 'active');
CREATE POLICY "Hosts manage own properties" ON public.properties FOR ALL USING (auth.uid() = host_id);

-- Vibe reviews: anyone can read; auth users can insert
CREATE POLICY "Vibe reviews are public" ON public.vibe_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can review" ON public.vibe_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Copool groups: public read; creator manages; members can read own pools
CREATE POLICY "Pools are public" ON public.copool_groups FOR SELECT USING (true);
CREATE POLICY "Creator manages pool" ON public.copool_groups FOR ALL USING (auth.uid() = creator_id);

-- Copool members
CREATE POLICY "Members can read own pool memberships" ON public.copool_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Members can join pools" ON public.copool_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bookings: renters see own; hosts see their property bookings
CREATE POLICY "Renters see own bookings" ON public.bookings FOR SELECT USING (auth.uid() = renter_id);
CREATE POLICY "Renters create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = renter_id);

-- Subscriptions: users see own
CREATE POLICY "Users see own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
