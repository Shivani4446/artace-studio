-- Create rental_inquiries table for Art Rentals

CREATE TABLE IF NOT EXISTS rental_inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  space_type TEXT,
  duration TEXT NOT NULL,
  pieces INTEGER NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE rental_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (API will handle auth)
CREATE POLICY "Allow anonymous inserts" ON rental_inquiries
  FOR INSERT WITH CHECK (true);

-- Allow public reads for admin (or keep restricted)
CREATE POLICY "Allow public read" ON rental_inquiries
  FOR SELECT USING (true);