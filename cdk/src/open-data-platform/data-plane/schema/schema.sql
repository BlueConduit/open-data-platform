-- Schema definition for the main DB.

-- Aurora with Postgres v10.18 has PostGIS already installed [1], so just enable it.
-- [1] https://aws.amazon.com/about-aws/whats-new/2021/10/amazon-aurora-postgresql-supports-postgis/
CREATE EXTENSION IF NOT EXISTS postgis;

-- Function for object creates without existence safety

CREATE OR REPLACE FUNCTION safe_create(command TEXT)
    RETURNS void
AS $$
BEGIN
    EXECUTE command;
EXCEPTION
    WHEN duplicate_object THEN null;
END;
$$ LANGUAGE plpgsql;

-- Tables

CREATE TABLE IF NOT EXISTS demographics(
    census_geo_id varchar(255) NOT NULL,
    total_population real,
    black_percentage real,
    white_percentage real,
    geom GEOMETRY(Polygon),
    PRIMARY KEY(census_geo_id)
);

ALTER TABLE demographics
    ADD COLUMN IF NOT EXISTS geom GEOMETRY(Polygon);

CREATE INDEX IF NOT EXISTS geom_index
    ON demographics
    USING GIST (geom);

-- Roles and Grants

-- The "readgeo" role can read data from all tables in the default DB and schema.
SELECT safe_create($$CREATE ROLE readgeo$$);
GRANT CONNECT ON DATABASE postgres TO readgeo;
GRANT USAGE ON SCHEMA public TO readgeo;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readgeo;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readgeo;

GRANT readgeo TO tileserver;

-------------------
-- EXAMPLE BELOW --
-------------------

-- Upsert a table
CREATE TABLE IF NOT EXISTS dummy (
   id serial PRIMARY KEY
);

-- Add new columns and index using a new query, so they can use the `IF NOT EXISTS` keywords.
-- using example PostGIS data: https://postgis.net/install/#binary-installers#spatial-sql
ALTER TABLE dummy
ADD COLUMN IF NOT EXISTS geom GEOMETRY(Point, 26910),
ADD COLUMN IF NOT EXISTS name VARCHAR(128) unique;
CREATE INDEX IF NOT EXISTS dummy_gix
  ON dummy
  USING GIST (geom);

-- Upsert a few test points.
INSERT INTO dummy (geom, name)
VALUES (ST_MakePoint(0,0), 'test_point'),
(ST_MakePoint(1,0), 'test_point_2'),
(ST_MakePoint(0,1), 'test_point_3')
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
