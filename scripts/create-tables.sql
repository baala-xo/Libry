-- Create libraries table
CREATE TABLE IF NOT EXISTS libraries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  library_id UUID REFERENCES libraries(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS libraries_user_id_idx ON libraries(user_id);
CREATE INDEX IF NOT EXISTS libraries_is_public_idx ON libraries(is_public);
CREATE INDEX IF NOT EXISTS items_library_id_idx ON items(library_id);

-- Enable Row Level Security (RLS)
ALTER TABLE libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for libraries
CREATE POLICY "Users can view their own libraries" ON libraries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public libraries" ON libraries
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert their own libraries" ON libraries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own libraries" ON libraries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own libraries" ON libraries
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for items
CREATE POLICY "Users can view items in their libraries" ON items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM libraries 
      WHERE libraries.id = items.library_id 
      AND libraries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view items in public libraries" ON items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM libraries 
      WHERE libraries.id = items.library_id 
      AND libraries.is_public = true
    )
  );

CREATE POLICY "Users can insert items in their libraries" ON items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM libraries 
      WHERE libraries.id = items.library_id 
      AND libraries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in their libraries" ON items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM libraries 
      WHERE libraries.id = items.library_id 
      AND libraries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items in their libraries" ON items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM libraries 
      WHERE libraries.id = items.library_id 
      AND libraries.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_libraries_updated_at 
  BEFORE UPDATE ON libraries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at 
  BEFORE UPDATE ON items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
