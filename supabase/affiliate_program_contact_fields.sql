-- Affiliate Program: required contact fields on application
-- Run this in Supabase SQL Editor (after affiliate_program.sql)

ALTER TABLE affiliates
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT;
