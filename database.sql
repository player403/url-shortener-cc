CREATE TABLE urls(
    id text PRIMARY KEY UNIQUE NOT NULL,
    url text UNIQUE NOT NULL,
    expire_date date
);

CREATE OR REPLACE FUNCTION
generate_alphanumerical(length INT DEFAULT 6)
RETURNS TEXT AS $$
DECLARE
	chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	result TEXT := '';
	exists_count INT;
	i INT;
	try_id TEXT;
BEGIN 
	LOOP
		result := '';
		FOR i IN 1..length LOOP
			result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
		END LOOP;
		SELECT COUNT(*) INTO exists_count FROM urls WHERE id = result;
        IF exists_count = 0 THEN
            RETURN result;
        END IF;
	END LOOP;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE urls ALTER COLUMN id SET DEFAULT generate_alphanumerical();