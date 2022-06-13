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

------------
-- Tables --
------------

-- Census-block-level data. TODO: consider renaming the table.

CREATE TABLE IF NOT EXISTS demographics(
    census_geo_id varchar(255) NOT NULL,
    total_population real,
    black_percentage real,
    white_percentage real,
    geom TYPE GEOMETRY(Geometry, 4326)
    PRIMARY KEY(census_geo_id)
);

CREATE INDEX IF NOT EXISTS geom_index
    ON demographics
    USING GIST (geom);

-- Water-system-level data

CREATE TABLE IF NOT EXISTS water_systems(
    pws_id varchar(255) NOT NULL,
    lead_connections_count real,
    geom GEOMETRY(Geometry, 4326),
    PRIMARY KEY(pws_id)
    );

CREATE INDEX IF NOT EXISTS geom_index
    ON water_systems
    USING GIST (geom);

-- EPA violations data

CREATE TABLE IF NOT EXISTS epa_violations(
    violation_id varchar(255) NOT NULL,
    violation_code varchar(255) NOT NULL,
    compliance_status varchar(255) NOT NULL,
    start_date DATE NOT NULL,
    pws_id varchar(255) NOT NULL REFERENCES water_systems(pws_id),
    PRIMARY KEY(violation_id)
    );

-- Parcel-level data

CREATE TABLE IF NOT EXISTS parcels (
    id serial PRIMARY KEY,
    -- TODO: consider standardizing addresses into a PostGIS type once we have data.
    -- https://postgis.net/docs/manual-2.5/Address_Standardizer.html
    address text,
    sl_path geometry(Geometry, 4326),
    lead_prediction float
);
-- Either of these might be used for searching.
CREATE INDEX IF NOT EXISTS sl_geometry_index ON parcels USING GIST (sl_path);
CREATE INDEX IF NOT EXISTS addres_index ON parcels(address);

----------------------
-- Roles and Grants --
----------------------

-- The "readgeo" role can read data from all tables in the default DB and schema.
SELECT safe_create($$CREATE ROLE readgeo$$);
GRANT CONNECT ON DATABASE postgres TO readgeo;
GRANT USAGE ON SCHEMA public TO readgeo;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readgeo;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readgeo;

GRANT readgeo TO tileserver;
