-- SQL SCHEMA FOR NEXORA SUPABASE INTEGRATION
-- Copy and paste this into your Supabase SQL Editor

-- 1. PROFILES TABLE (Core User Data)
CREATE TABLE IF NOT EXISTS public.profiles (
    "uid" UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    "email" TEXT,
    "displayName" TEXT,
    "photoURL" TEXT,
    "balances" JSONB DEFAULT '{"main": 0, "bonus": 1000, "referral": 0, "investment": 0}'::jsonb,
    "referralCode" TEXT UNIQUE,
    "referredBy" UUID REFERENCES auth.users(id),
    "isAdmin" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "transactions" JSONB DEFAULT '[]'::jsonb,
    "enrolledCourses" TEXT[] DEFAULT '{}',
    "profileUpdated" BOOLEAN DEFAULT FALSE,
    "username" TEXT
);

-- ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = "uid");

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = "uid");


-- 2. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" NUMERIC NOT NULL,
    "totalReward" NUMERIC NOT NULL,
    "category" TEXT,
    "thumbnail" TEXT,
    "status" TEXT DEFAULT 'Active',
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Courses are viewable by everyone" ON public.courses
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify courses" ON public.courses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.uid = auth.uid() AND profiles."isAdmin" = TRUE
        )
    );

-- 3. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
    "id" TEXT PRIMARY KEY,
    "withdrawalFee" NUMERIC DEFAULT 0,
    "minWithdrawal" NUMERIC DEFAULT 0,
    "referralBonus" NUMERIC DEFAULT 500,
    "signupBonus" NUMERIC DEFAULT 1000,
    "config" JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are viewable by everyone" ON public.settings
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify settings" ON public.settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.uid = auth.uid() AND profiles."isAdmin" = TRUE
        )
    );

-- 4. INSERT DEFAULT SYSTEM CONFIG
INSERT INTO public.settings (id, config) 
VALUES ('system', '{"withdrawalFee": 10, "minWithdrawal": 1000, "maintenance": false}')
ON CONFLICT (id) DO NOTHING;

-- 5. INITIAL ADMIN SETUP (Optional: Update <YOUR_USER_ID> with your actual Supabase User ID)
-- UPDATE public.profiles SET "isAdmin" = TRUE WHERE uid = '<YOUR_USER_ID>';
