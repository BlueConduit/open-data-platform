-- Schema definition for the main DB.

-- Aurora with Postgres v10.18 has PostGIS already installed [1], so just enable it.
-- [1] https://aws.amazon.com/about-aws/whats-new/2021/10/amazon-aurora-postgresql-supports-postgis/
CREATE EXTENSION IF NOT EXISTS postgis;

-- Function for object creates without existence safety

-- Note on SRIDs.
-- We use two SRID: 4326 and 3857
--
-- 4326 is a 3D coordinate system. Lat/Longs are implicitly converted to 3D space for the
-- purposes of any calculations, including distances and areas. There is no way to display
-- 4326 coordinates in 2D without projecting it into 2D in some way or another.
--
-- 3857 is a 2D projected coordinate system. When doing anything with tiles, we need them to
-- be projected into two dimensions (because tiles are shown as squares), so all tile-related
-- methods either implicitly cast coordinates to 3857 (e.g. ST_TileEnvelope, ST_AsMVT) or
-- *should* cast them to 3857 for comparison. E.g., to compare a bounding box or other geometry
--  with a tile from ST_TileEnvelope or ST_AsMVT, we should use ST_Transform to translate it
-- from 4326 to 3857.

CREATE OR REPLACE FUNCTION safe_create(command TEXT)
    RETURNS void
AS
$$
BEGIN
    EXECUTE command;
EXCEPTION
    WHEN duplicate_object THEN null;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_last_update_timestamp()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.last_updated = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Some of our spatial indexes are ignored because we have few rows relative to the volume of
-- geometry data (see https://postgis.net/docs/manual-1.3/ch05.html). One solution is to cache
-- the bounding boxes of the geometries associated with each row, making an 'explicit' spatial
-- index. This function adds a bounding box (named bbox) to any row it is given that also
-- contains a column named named 'geom' of type geometry. It is used to ensure that water_systems
-- have a bbox column that can be used to speed up queries when the spatial index is ignored.
CREATE OR REPLACE FUNCTION set_bbox_to_envelope_of_geom()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.bbox = ST_Envelope(new.geom);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION set_approx_area_sqkm_to_area_of_geom()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.approx_area_sq_km = ST_Area(ST_Transform(new.geom, 4326)) / 1000000;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
------------
-- Tables --
------------

-- States
CREATE TABLE IF NOT EXISTS states
(
    census_geo_id varchar(255) NOT NULL,
    fips          varchar(255) UNIQUE,
    ansi          varchar(255),
    aff_geo_id    varchar(255),
    usps          varchar(255),
    name          varchar(255),
    lsad          varchar(255),
    geom          GEOMETRY(Geometry, 4326),
    PRIMARY KEY (census_geo_id)
);

CREATE INDEX IF NOT EXISTS states_geom_idx ON states USING GIST (geom);

-- Counties
CREATE TABLE IF NOT EXISTS counties
(
    census_geo_id varchar(255) NOT NULL,
    fips          varchar(255) NOT NULL,
    state_fips    varchar(255) NOT NULL references states (fips),
    ansi          varchar(255) NOT NULL,
    aff_geo_id    varchar(255),
    name          varchar(255),
    lsad          varchar(255),
    geom          geometry(Geometry, 4326),
    PRIMARY KEY (census_geo_id)
);
CREATE INDEX IF NOT EXISTS counties_geom_idx ON counties USING GIST (geom);

-- Zipcodes
CREATE TABLE IF NOT EXISTS zipcodes
(
    census_geo_id varchar(255) NOT NULL,
    zipcode       varchar(255) NOT NULL,
    lsad          varchar(255) NOT NULL,
    aff_geo_id    varchar(255),
    geom          geometry(Geometry, 4326),
    PRIMARY KEY (census_geo_id)
);

CREATE INDEX IF NOT EXISTS zipcodes_geom_idx ON zipcodes USING GIST (geom);
CREATE UNIQUE INDEX IF NOT EXISTS zipcodes_zipcode_unique_idx ON zipcodes (zipcode);

-- Census-block-level data. TODO: consider renaming the table.

CREATE TABLE IF NOT EXISTS demographics
(
    census_geo_id         varchar(255) NOT NULL,
    census_block_name     varchar(255),
    total_population      real,
    under_five_population real,
    poverty_population    real,
    black_population      real,
    white_population      real,
    state_census_geo_id   varchar(255) NOT NULL references states (census_geo_id),
    county_census_geo_id  varchar(255) NOT NULL references counties (census_geo_id),
    geom                  GEOMETRY(Geometry, 4326),
    PRIMARY KEY (census_geo_id)
);
CREATE INDEX IF NOT EXISTS demographics_state_census_geo_id_idx ON demographics (state_census_geo_id);
CREATE INDEX IF NOT EXISTS demographics_county_census_geo_id_idx ON demographics (county_census_geo_id);
CREATE INDEX IF NOT EXISTS demographics_geom_idx ON demographics USING GIST (geom);

--- Tables related to U.S. demographic information.

-- TODO(breuch): Add insert statement once the zipcode -> demographics

CREATE TABLE IF NOT EXISTS aggregate_us_demographics
(
    census_geo_id         varchar(255) NOT NULL,
    geo_type              varchar(255) NOT NULL,
    name                  varchar(255) NOT NULL,
    median_year_built     varchar(255),
    median_income         real,
    home_age_index        real,
    income_index          real,
    weighted_national_adi real,
    weighted_state_adi    real,
    population_count      real,
    geom                  GEOMETRY(Geometry, 3857),
    PRIMARY KEY (census_geo_id)
);
CREATE INDEX IF NOT EXISTS aggregate_us_demographics_geo_type_idx ON aggregate_us_demographics (geo_type);
CREATE INDEX IF NOT EXISTS aggregate_us_demographics_geom_idx ON aggregate_us_demographics USING GIST (geom);

-- Demographic aggregation tables.

CREATE TABLE IF NOT EXISTS state_demographics
(
    census_geo_id         varchar(255) NOT NULL,
    name                  varchar(255) NOT NULL,
    black_population      real,
    white_population      real,
    total_population      real,
    under_five_population real,
    poverty_population    real,
    geom                  geometry(Geometry, 3857),
    PRIMARY KEY (census_geo_id)
);
CREATE INDEX IF NOT EXISTS state_demographics_geom_idx ON state_demographics USING GIST (geom);

CREATE TABLE IF NOT EXISTS county_demographics
(
    census_geo_id         varchar(255) NOT NULL,
    name                  varchar(255) NOT NULL,
    black_population      real,
    white_population      real,
    total_population      real,
    under_five_population real,
    poverty_population    real,
    geom                  geometry(Geometry, 3857),
    PRIMARY KEY (census_geo_id)
);
CREATE INDEX IF NOT EXISTS county_demographics_geom_idx ON county_demographics USING GIST (geom);

-- Water-system-level data

CREATE TABLE IF NOT EXISTS water_systems
(
    pws_id                    varchar(255) NOT NULL,
    pws_name                  varchar(255),
    is_estimated              boolean,
    lead_connections_count    real,
    service_connections_count real,
    population_served         real,
    state_census_geo_id       varchar(255) references states (census_geo_id),
    bbox                      GEOMETRY(Geometry, 4326, 2),
    approx_area_sq_km         real,
    geom                      GEOMETRY(Geometry, 4326),
    PRIMARY KEY (pws_id)
);
CREATE INDEX IF NOT EXISTS water_systems_state_census_geo_id_idx ON water_systems (state_census_geo_id);
CREATE INDEX IF NOT EXISTS water_systems_geom_idx ON water_systems USING GIST (geom);
CREATE INDEX IF NOT EXISTS water_systems_bbox_idx ON public.water_systems USING gist (bbox);
CREATE INDEX IF NOT EXISTS water_systems_approx_area_idx ON water_systems USING BTREE (approx_area_sq_km);
SELECT safe_create($$CREATE TRIGGER set_bbox_to_envelope_of_geom_on_water_system_insertion
    BEFORE INSERT
    ON water_systems
    FOR EACH ROW
EXECUTE PROCEDURE set_bbox_to_envelope_of_geom()$$);
SELECT safe_create($$CREATE TRIGGER set_approx_area_sqkm_on_insertion
    BEFORE INSERT
    ON water_systems
    FOR EACH ROW
EXECUTE PROCEDURE set_approx_area_sqkm_to_area_of_geom()$$);

-- EPA violations data

CREATE TABLE IF NOT EXISTS epa_violations
(
    violation_id        varchar(255) NOT NULL,
    violation_code      varchar(255) NOT NULL,
    compliance_status   varchar(255) NOT NULL,
    start_date          DATE         NOT NULL,
    end_date            DATE,
    pws_id              varchar(255) NOT NULL,
    state_census_geo_id varchar(255) references states (census_geo_id),
    PRIMARY KEY (violation_id)
);
CREATE INDEX IF NOT EXISTS epa_violations_state_census_geo_id_idx ON epa_violations (state_census_geo_id);

-- Violation counts per water system --

CREATE OR REPLACE VIEW violation_counts AS
SELECT pws_id,
       epa_violations.state_census_geo_id,
       epa_violations.county_census_geo_id,
       geom,
       COUNT(violation_id) AS violation_count
FROM epa_violations
         JOIN water_systems USING (pws_id)
GROUP BY pws_id,
         geom,
         epa_violations.state_census_geo_id,
         epa_violations.county_census_geo_id;

-- Parcel-level data

CREATE TABLE IF NOT EXISTS parcels
(
    -- TODO: consider standardizing addresses into a PostGIS type once we have data.
    -- https://postgis.net/docs/manual-2.5/Address_Standardizer.html
    address                                text,
    city                                   varchar(255) NOT NULL,
    public_lead_connections_low_estimate   float,
    public_lead_connections_high_estimate  float,
    -- Private-side predictive data don't exist for all parcels, but store it anyway.
    private_lead_connections_low_estimate  float,
    private_lead_connections_high_estimate float,
    -- Can be used to determine if the row needs updating with a new dataset.
    last_updated                           timestamp default current_timestamp,
    geom                                   geometry(Geometry, 4326),
    PRIMARY KEY (address)
);
-- Either of these might be used for searching.
CREATE INDEX IF NOT EXISTS parcels_geom_idx ON parcels USING GIST (geom);

SELECT safe_create($$CREATE TRIGGER update_last_update_timestamp
    BEFORE UPDATE
    ON parcels
    FOR EACH ROW
EXECUTE PROCEDURE update_last_update_timestamp()$$);

--- Create pre-computed tables.
--- These are required to ensure acceptable latency for the tileserver.

-- Lead connections aggregation tables.

-- TODO: refactor into column on states table.
CREATE TABLE IF NOT EXISTS state_lead_connections
(
    census_geo_id             varchar(255) NOT NULL,
    name                      varchar(255) NOT NULL,
    lead_connections_count    real,
    service_connections_count real,
    population_served         real,
    geom                      geometry(Geometry, 3857),
    PRIMARY KEY (census_geo_id)
);
CREATE INDEX IF NOT EXISTS state_lead_connections_geom_idx ON state_lead_connections USING GIST (geom);

-- EPA Violations aggregation tables.

CREATE TABLE IF NOT EXISTS state_epa_violations
(
    census_geo_id   varchar(255) NOT NULL,
    name            varchar(255) NOT NULL,
    violation_count real,
    geom            geometry(Geometry, 3857),
    PRIMARY KEY (census_geo_id)
);
CREATE INDEX IF NOT EXISTS state_epa_violations_geom_idx ON state_epa_violations USING GIST (geom);

-- Populate pre-computed tables. These are only to be used by the functions
-- defined below.

INSERT INTO state_lead_connections(census_geo_id, name, geom,
                                   lead_connections_count,
                                   service_connections_count, population_served)
SELECT states.census_geo_id            as census_geo_id,
       states.name                     AS name,
       ST_Transform(states.geom, 3857) AS geom,
       SUM(lead_connections_count)     AS lead_connections_count,
       SUM(service_connections_count)  AS service_connections_count,
       SUM(population_served)          AS population_served
FROM states
         LEFT JOIN water_systems
                   ON water_systems.state_census_geo_id = states.census_geo_id
GROUP BY states.census_geo_id, states.name, states.geom
ON CONFLICT (census_geo_id) DO NOTHING;

INSERT INTO state_epa_violations(census_geo_id, name, geom, violation_count)
SELECT states.census_geo_id            as census_geo_id,
       states.name                     AS name,
       ST_Transform(states.geom, 3857) AS geom,
       SUM(violation_count)            AS violation_count
FROM states
         LEFT JOIN violation_counts
                   ON violation_counts.state_census_geo_id =
                      states.census_geo_id
GROUP BY states.census_geo_id, states.name, states.geom
ON CONFLICT (census_geo_id) DO NOTHING;

INSERT INTO state_demographics(census_geo_id, name, geom, black_population,
                               white_population, total_population,
                               under_five_population, poverty_population)
SELECT states.census_geo_id            as census_geo_id,
       states.name                     AS name,
       ST_Transform(states.geom, 3857) AS geom,
       SUM(black_population)           AS black_population,
       SUM(white_population)           AS white_population,
       SUM(total_population)           AS total_population,
       SUM(under_five_population)      AS under_five_population,
       SUM(poverty_population)         AS poverty_population
FROM states
         LEFT JOIN demographics
                   ON demographics.state_census_geo_id = states.census_geo_id
GROUP BY states.census_geo_id, states.name, states.geom
ON CONFLICT (census_geo_id) DO NOTHING;

INSERT INTO county_demographics(census_geo_id, name, geom, black_population,
                                white_population, total_population,
                                under_five_population, poverty_population)
SELECT counties.census_geo_id            as census_geo_id,
       counties.name                     AS name,
       ST_Transform(counties.geom, 3857) AS geom,
       SUM(black_population)             AS black_population,
       SUM(white_population)             AS white_population,
       SUM(total_population)             AS total_population,
       SUM(under_five_population)        AS under_five_population,
       SUM(poverty_population)           AS poverty_population
FROM counties
         LEFT JOIN demographics
                   ON demographics.county_census_geo_id = counties.census_geo_id
GROUP BY counties.census_geo_id, counties.name, counties.geom
ON CONFLICT (census_geo_id) DO NOTHING;

--- Tileserver function definitions.

CREATE OR REPLACE FUNCTION public.demographics_function_source(z integer,
                                                               x integer,
                                                               y integer,
                                                               query_params json) RETURNS bytea AS
$$
DECLARE
    mvt bytea;
BEGIN
    -- If the zoom is low (i.e. user is zoomed out), show state-level demographics.
    -- Otherwise, county-level.
    IF (z <= 4) THEN
        SELECT INTO mvt ST_AsMVT(tile, 'public.demographics_function_source',
                                 4096, 'geom')
        FROM (
                 SELECT ST_AsMVTGeom(geom, ST_TileEnvelope(z, x, y)) AS geom,
                        census_geo_id,
                        name,
                        black_population,
                        white_population,
                        total_population,
                        under_five_population,
                        poverty_population
                 FROM state_demographics
                 WHERE geom && ST_TileEnvelope(z, x, y)
             ) AS tile
        WHERE geom IS NOT NULL;
    ELSE
        SELECT INTO mvt ST_AsMVT(tile, 'public.demographics_function_source',
                                 4096, 'geom')
        FROM (
                 SELECT ST_AsMVTGeom(geom, ST_TileEnvelope(z, x, y)) AS geom,
                        census_geo_id,
                        black_population,
                        white_population,
                        total_population,
                        under_five_population,
                        poverty_population
                 FROM demographics
                 WHERE geom && ST_TileEnvelope(z, x, y)
             ) AS tile
        WHERE geom IS NOT NULL;
    END IF;
    RETURN mvt;
END
$$ LANGUAGE plpgsql IMMUTABLE
                    STRICT
                    PARALLEL SAFE;

--- Returns lead connections aggregated by either state or water system, depending on z (zoom level).

-- TODO(kailamjeter): Add county aggregation.
CREATE OR REPLACE FUNCTION public.lead_connections_function_source(z integer,
                                                                   x integer,
                                                                   y integer,
                                                                   query_params json) RETURNS bytea AS
$$
DECLARE
    mvt bytea;
BEGIN
    IF (z <= 4) THEN
        -- If the zoom is low (i.e. user is zoomed out), show state-level
        -- lead_connections. Otherwise, county-level.
        SELECT INTO mvt ST_AsMVT(tile,
                                 'public.lead_connections_function_source',
                                 4096, 'geom')
        FROM (
                 SELECT ST_AsMVTGeom(geom, ST_TileEnvelope(z, x, y)) AS geom,
                        name,
                        lead_connections_count,
                        service_connections_count,
                        population_served
                 FROM state_lead_connections
                 WHERE geom && ST_TileEnvelope(z, x, y)
             ) AS tile
        WHERE geom IS NOT NULL;
    ELSE
        -- Show lead connections data by water system at higher zoom levels (zoomed in).
        SELECT INTO mvt ST_AsMVT(tile,
                                 'public.lead_connections_function_source',
                                 4096, 'geom')
        FROM (
                 SELECT ST_AsMVTGeom(ST_Transform(w.geom, 3857),
                                     ST_TileEnvelope(z, x, y)) AS geom,
                        w.pws_id                               AS pws_id,
                        w.pws_name                             AS pws_name,
                        SUM(w.lead_connections_count)          AS lead_connections_count,
                        SUM(w.service_connections_count)       AS service_connections_count,
                        SUM(w.population_served)               AS population_served
                 FROM water_systems w
                 WHERE ST_Transform(w.bbox, 3857) && ST_TileEnvelope(z, x, y)
                   AND
                   -- Require nearer zoom levels to see smaller polygons. Cutoffs are arbitrary.
                   -- Necessary because some tiles failed to load because they return too much data.
                   -- Alternative is to simplify polygons, but that takes more work/tuning.
                         w.approx_area_sq_km >= (
                         CASE
                             WHEN z <= 5 THEN 100
                             WHEN z <= 7 THEN 10
                             WHEN z <= 8 THEN 5
                             ELSE 0
                             END
                         )
                 GROUP BY w.geom,
                          w.pws_id,
                          w.pws_name
             ) AS tile
        WHERE geom IS NOT NULL;
    END IF;
    RETURN mvt;
END
$$ LANGUAGE plpgsql IMMUTABLE
                    STRICT
                    PARALLEL SAFE;

--- Returns violations aggregated by either state or water system, depending on z (zoom level).

CREATE OR REPLACE FUNCTION public.violations_function_source(z integer,
                                                             x integer,
                                                             y integer,
                                                             query_params json) RETURNS bytea AS
$$
DECLARE
    mvt bytea;
BEGIN
    -- Show aggregated violations data by state at low zoom level (most zoomed out).
    IF (z <= 4) THEN
        SELECT INTO mvt ST_AsMVT(tile, 'public.violations_function_source',
                                 4096, 'geom')
        FROM (
                 SELECT ST_AsMVTGeom(geom, ST_TileEnvelope(z, x, y)) AS geom,
                        name,
                        violation_count
                 FROM state_epa_violations
                 WHERE geom && ST_TileEnvelope(z, x, y)
             ) AS tile
        WHERE geom IS NOT NULL;
    ELSE
        -- Show violations data by water system at higher zoom levels (zoomed in).
        SELECT INTO mvt ST_AsMVT(tile, 'public.violations_function_source',
                                 4096, 'geom')
        FROM (
                 SELECT ST_AsMVTGeom(ST_Transform(v.geom, 3857),
                                     ST_TileEnvelope(z, x, y)) AS geom,
                        v.pws_id                               AS pws_id,
                        CAST(SUM(v.violation_count) AS int)    AS violation_count
                 FROM violation_counts v
                 WHERE ST_Transform(v.geom, 3857) && ST_TileEnvelope(z, x, y)
                 GROUP BY v.geom,
                          v.pws_id
             ) AS tile
        WHERE geom IS NOT NULL;
    END IF;
    RETURN mvt;
END
$$ LANGUAGE plpgsql IMMUTABLE
                    STRICT
                    PARALLEL SAFE;

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