-- Add birth_month and birth_day columns (1-12 and 1-31 respectively)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS birth_month integer,
ADD COLUMN IF NOT EXISTS birth_day integer;

-- Add constraints to ensure valid values
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_birth_month CHECK (birth_month IS NULL OR (birth_month >= 1 AND birth_month <= 12)),
ADD CONSTRAINT valid_birth_day CHECK (birth_day IS NULL OR (birth_day >= 1 AND birth_day <= 31));

-- Migrate any existing birthdate data to the new columns
UPDATE public.profiles 
SET 
  birth_month = EXTRACT(MONTH FROM birthdate)::integer,
  birth_day = EXTRACT(DAY FROM birthdate)::integer
WHERE birthdate IS NOT NULL;

-- Drop the birthdate column (removes sensitive birth year data)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS birthdate;