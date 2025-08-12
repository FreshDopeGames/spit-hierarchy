-- Add death date fields to rappers table
ALTER TABLE public.rappers 
ADD COLUMN death_year integer,
ADD COLUMN death_month integer,
ADD COLUMN death_day integer;