ALTER TABLE companies
ADD COLUMN cnpj VARCHAR(18);

UPDATE companies
SET cnpj = 
  CASE id
    WHEN 1 THEN '00.000.000/0000-01'
    WHEN 11 THEN '00.000.000/0000-02'
  END
WHERE cnpj IS NULL;

ALTER TABLE companies
ADD CONSTRAINT cnpj_format_check CHECK (
    cnpj ~ '^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$'
);

ALTER TABLE companies
ADD CONSTRAINT cnpj_unique UNIQUE (cnpj);
