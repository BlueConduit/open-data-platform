-- Schema definition for the main DB.

-- Aurora with Postgres v10.18 has PostGIS already installed [1], so just enable it.
-- [1] https://aws.amazon.com/about-aws/whats-new/2021/10/amazon-aurora-postgresql-supports-postgis/
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS demographics(
    census_geo_id varchar(255) NOT NULL,
    total_population real,
    black_percentage real,
    white_percentage real,
    PRIMARY KEY(census_geo_id)
);

ALTER TABLE demographics
    ADD COLUMN IF NOT EXISTS geom GEOMETRY(Polygon);

CREATE INDEX IF NOT EXISTS geom_index
    ON demographics
    USING GIST (geom);

CREATE TABLE IF NOT EXISTS lead_service_lines(
    pws_id varchar(255) NOT NULL,
    lead_connections_count real,
    PRIMARY KEY(pws_is)
    );

ALTER TABLE lead_service_lines
    ADD COLUMN IF NOT EXISTS geom GEOMETRY(Polygon);

CREATE INDEX IF NOT EXISTS geom_index
    ON lead_service_lines
    USING GIST (geom);

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
