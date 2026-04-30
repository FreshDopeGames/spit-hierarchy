CREATE OR REPLACE FUNCTION public.set_user_top_rapper(_position integer, _rapper_id uuid)
RETURNS public.user_top_rappers
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _result public.user_top_rappers;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF _position < 1 OR _position > 5 THEN
    RAISE EXCEPTION 'Position must be between 1 and 5';
  END IF;

  -- Remove the rapper from any other slot (handles unique_user_rapper)
  DELETE FROM public.user_top_rappers
  WHERE user_id = _user_id
    AND rapper_id = _rapper_id
    AND position <> _position;

  -- Upsert into the target slot (handles unique_user_position)
  INSERT INTO public.user_top_rappers (user_id, position, rapper_id)
  VALUES (_user_id, _position, _rapper_id)
  ON CONFLICT (user_id, position)
  DO UPDATE SET rapper_id = EXCLUDED.rapper_id
  RETURNING * INTO _result;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_user_top_rapper(integer, uuid) TO authenticated;