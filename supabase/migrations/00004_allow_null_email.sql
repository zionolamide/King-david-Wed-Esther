-- Migration: Allow null email and remove UNIQUE constraint on email
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → your project → SQL Editor)

-- 1. Drop the UNIQUE constraint on email so multiple guests can have no email
ALTER TABLE rsvp_submissions DROP CONSTRAINT IF EXISTS rsvp_submissions_email_key;

-- 2. Make email nullable
ALTER TABLE rsvp_submissions ALTER COLUMN email DROP NOT NULL;
