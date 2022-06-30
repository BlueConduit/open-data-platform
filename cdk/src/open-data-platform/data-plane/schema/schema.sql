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

CREATE OR REPLACE FUNCTION update_last_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
NEW.last_updated = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

------------
-- Tables --
------------

-- Census-block-level data. TODO: consider renaming the table.

CREATE TABLE IF NOT EXISTS demographics(
    census_geo_id varchar(255) NOT NULL,
    census_block_name varchar(255),
    total_population real,
    under_five_population real,
    poverty_population real,
    black_population real,
    white_population real,
    geom GEOMETRY(Geometry, 4326),
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

ALTER TABLE water_systems
    ADD COLUMN IF NOT EXISTS pws_name varchar(255),
    ADD COLUMN IF NOT EXISTS service_connections_count real,
    ADD COLUMN IF NOT EXISTS population_served real;

CREATE INDEX IF NOT EXISTS geom_index
    ON water_systems
    USING GIST (geom);

-- EPA violations data

CREATE TABLE IF NOT EXISTS epa_violations(
    violation_id varchar(255) NOT NULL,
    violation_code varchar(255) NOT NULL,
    compliance_status varchar(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    pws_id varchar(255) NOT NULL,
    PRIMARY KEY(violation_id)
    );

-- Violation counts per water system --

CREATE OR REPLACE VIEW violation_counts AS
SELECT
    pws_id,
    geom,
    COUNT(violation_id) AS violation_count
FROM epa_violations
JOIN water_systems USING (pws_id)
GROUP BY pws_id, geom;

-- Parcel-level data

CREATE TABLE IF NOT EXISTS parcels (
    -- TODO: consider standardizing addresses into a PostGIS type once we have data.
    -- https://postgis.net/docs/manual-2.5/Address_Standardizer.html
    address text,
    public_lead_prediction float,
    -- Private-side predictive data don't exist for all parcels, but store it anyway.
    private_lead_prediction float,
    -- Can be used to determine if the row needs updating with a new dataset.
    last_updated timestamp default current_timestamp,
    geom geometry(Geometry, 4326),
    PRIMARY KEY (address)
);

-- Either of these might be used for searching.
CREATE INDEX IF NOT EXISTS geom_index ON parcels USING GIST (geom);

CREATE TRIGGER update_last_update_timestamp BEFORE UPDATE ON parcels
    FOR EACH ROW EXECUTE PROCEDURE update_last_update_timestamp();

-- States
CREATE TABLE IF NOT EXISTS states(
    census_geo_id varchar(255) NOT NULL,
    fips varchar(255) UNIQUE,
    ansi varchar(255),
    aff_geo_id varchar(255),
    usps varchar(255),
    name varchar(255),
    lsad varchar(255),
    geom GEOMETRY(Geometry, 4326),
    PRIMARY KEY(census_geo_id)
    );

CREATE INDEX IF NOT EXISTS geom_index ON states USING GIST (geom);

-- Counties
CREATE TABLE IF NOT EXISTS counties (
    census_geo_id varchar(255) NOT NULL,
    fips varchar(255) NOT NULL,
    state_fips varchar(255) NOT NULL references states(fips),
    ansi varchar(255) NOT NULL,
    aff_geo_id varchar(255),
    name varchar(255),
    lsad varchar(255),
    geom geometry(Geometry, 4326),
    PRIMARY KEY (census_geo_id)
);

CREATE INDEX IF NOT EXISTS geom_index ON counties USING GIST (geom);

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
