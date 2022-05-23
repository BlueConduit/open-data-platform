-- Schema definition for the main DB.

-- Aurora with Postgres v10.18 has PostGIS already installed [1], so just enable it.
-- [1] https://aws.amazon.com/about-aws/whats-new/2021/10/amazon-aurora-postgresql-supports-postgis/
CREATE EXTENSION IF NOT EXISTS postgis;

-------------------
-- EXAMPLE BELOW --
-------------------

-- Upsert a table
CREATE TABLE IF NOT EXISTS dummy (
   id serial PRIMARY KEY
);

-- Add new columns and index, using example PostGIS data: https://postgis.net/install/#binary-installers#spatial-sql
ALTER TABLE dummy
ADD COLUMN geom GEOMETRY(Point, 26910),
ADD COLUMN name VARCHAR(128) unique;
CREATE INDEX IF NOT EXISTS dummy_gix
  ON dummy
  USING GIST (geom);

-- Upsert a test point.
INSERT INTO dummy (geom, name)
VALUES (ST_MakePoint(0,0), 'test_point')
ON CONFLICT (name) 
DO NOTHING;

-- Then run the following query to test. It should return the "test_point".
-- SELECT id, name
-- FROM dummy
-- WHERE ST_DWithin(
--   geom,
--   ST_GeomFromText('POINT(0 0)', 26910),
--   1000
-- );