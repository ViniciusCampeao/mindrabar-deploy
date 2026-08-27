ALTER TABLE tables
ADD COLUMN qr_token VARCHAR(64);

UPDATE tables
SET qr_token = md5(random()::text || clock_timestamp()::text || id::text)
WHERE qr_token IS NULL;

ALTER TABLE tables
ALTER COLUMN qr_token SET NOT NULL;

ALTER TABLE tables
ADD CONSTRAINT uq_tables_qr_token UNIQUE (qr_token);
