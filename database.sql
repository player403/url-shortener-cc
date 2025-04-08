CREATE DATABASE "url_shortener_db"
    WITH
    ENCODING = 'UTF8';

CREATE TABLE url_references(
    short_url text PRIMARY KEY UNIQUE NOT NULL DEFAULT generate_short_url,
    url text UNIQUE NOT NULL,
    expire_date date
);

CREATE OR REPLACE FUNCTION
generate_short_url(length INT DEFAULT 6)
RETURNS TEXT AS $$
DECLARE
	chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	result TEXT := '';
	i INT;
	try_id TEXT;
BEGIN 
	--LOOP
		result := '';
		FOR i IN 1..length LOOP
			result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
		END LOOP;
		--BEGIN
			
		--	IF (
		--	SELECT count(short_url)
		--	FROM url_references
		--	WHERE short_url = result) > 0 AS bo THEN
		--	CONTINUE; 
		--	END IF;
			
		--END;
		RETURN result;
	--END LOOP;
END;
$$ LANGUAGE plpgsql;