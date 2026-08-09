-- Affiliate Program Phase 3: payout fields on affiliates
-- Run this in Supabase SQL Editor (after affiliate_program.sql)

ALTER TABLE affiliates
  ADD COLUMN IF NOT EXISTS payout_method TEXT, -- 'bank' | 'upi'
  ADD COLUMN IF NOT EXISTS bank_account_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_ifsc TEXT,
  ADD COLUMN IF NOT EXISTS upi_id TEXT;
