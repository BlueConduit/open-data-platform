-- Schema definition for the main DB.

-- Aurora with Postgres v10.18 has PostGIS already installed [1], so just enable it.
-- [1] https://aws.amazon.com/about-aws/whats-new/2021/10/amazon-aurora-postgresql-supports-postgis/
CREATE EXTENSION IF NOT EXISTS postgis;

-- Function for object creates without existence safety

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

CREATE INDEX IF NOT EXISTS geom_index ON states USING GIST (geom);

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
CREATE INDEX IF NOT EXISTS geom_index ON counties USING GIST (geom);

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

CREATE INDEX IF NOT EXISTS geom_index ON counties USING GIST (geom);
CREATE UNIQUE INDEX IF NOT EXISTS zipcode_index ON zipcodes (zipcode);

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
CREATE INDEX IF NOT EXISTS census_state_geo_id_index ON demographics (state_census_geo_id);
CREATE INDEX IF NOT EXISTS census_county_geo_id_index ON demographics (county_census_geo_id);
CREATE INDEX IF NOT EXISTS geom_index ON demographics USING GIST (geom);

-- Water-system-level data

CREATE TABLE IF NOT EXISTS water_systems
(
    pws_id                    varchar(255) NOT NULL,
    lead_connections_count    real,
    pws_name                  varchar(255),
    service_connections_count real,
    population_served         real,
    state_census_geo_id       varchar(255) references states (census_geo_id),
    county_census_geo_id      varchar(255) references counties (census_geo_id),
    geom                      GEOMETRY(Geometry, 4326),
    PRIMARY KEY (pws_id)
);
CREATE INDEX IF NOT EXISTS census_state_geo_id_index ON water_systems (state_census_geo_id);
CREATE INDEX IF NOT EXISTS census_county_geo_id_index ON water_systems (county_census_geo_id);
CREATE INDEX IF NOT EXISTS geom_index ON water_systems USING GIST (geom);

-- EPA violations data

CREATE TABLE IF NOT EXISTS epa_violations
(
    violation_id         varchar(255) NOT NULL,
    violation_code       varchar(255) NOT NULL,
    compliance_status    varchar(255) NOT NULL,
    start_date           DATE         NOT NULL,
    end_date             DATE,
    pws_id               varchar(255) NOT NULL,
    state_census_geo_id  varchar(255) references states (census_geo_id),
    county_census_geo_id varchar(255) references counties (census_geo_id),
    PRIMARY KEY (violation_id)
);
CREATE INDEX IF NOT EXISTS census_state_geo_id_index ON epa_violations (state_census_geo_id);
CREATE INDEX IF NOT EXISTS census_county_geo_id_index ON epa_violations (county_census_geo_id);

-- Violation counts per water system --

CREATE OR REPLACE VIEW violation_counts AS
SELECT pws_id,
       epa_violations.state_census_geo_id,
       geom,
       COUNT(violation_id) AS violation_count
FROM epa_violations
         JOIN water_systems USING (pws_id)
GROUP BY pws_id, geom, epa_violations.state_census_geo_id;

-- Parcel-level data

CREATE TABLE IF NOT EXISTS parcels
(
    -- TODO: consider standardizing addresses into a PostGIS type once we have data.
    -- https://postgis.net/docs/manual-2.5/Address_Standardizer.html
    address                 text,
    public_lead_prediction  float,
    -- Private-side predictive data don't exist for all parcels, but store it anyway.
    private_lead_prediction float,
    -- Can be used to determine if the row needs updating with a new dataset.
    last_updated            timestamp default current_timestamp,
    geom                    geometry(Geometry, 4326),
    PRIMARY KEY (address)
);

-- Either of these might be used for searching.
CREATE INDEX IF NOT EXISTS geom_index ON parcels USING GIST (geom);

CREATE TRIGGER update_last_update_timestamp
    BEFORE UPDATE
    ON parcels
    FOR EACH ROW
EXECUTE PROCEDURE update_last_update_timestamp();

--- Create pre-computed tables.
--- These are required to ensure acceptable latency for the tileserver.

-- Demographic aggregation tables.

CREATE TABLE IF NOT EXISTS state_demographics
(
    census_geo_id         varchar(255) NOT NULL,
    name                  varchar(255) NOT NULL,
    black_population      float,
    white_population      float,
    total_population      real,
    under_five_population real,
    poverty_population    real,
    geom                  geometry(Geometry, 3857),
    PRIMARY KEY (census_geo_id)
);
CREATE INDEX IF NOT EXISTS geom_index ON state_demographics USING GIST (geom);

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
CREATE INDEX IF NOT EXISTS geom_index ON county_demographics USING GIST (geom);

-- TODO(breuch): Add insert statement once the zipcode -> demographics
-- connection established.
CREATE TABLE IF NOT EXISTS zipcode_demographics
(
    census_geo_id         varchar(255) NOT NULL,
    zipcode               varchar(255) NOT NULL,
    black_population      real,
    white_population      real,
    total_population      real,
    under_five_population real,
    poverty_population    real,
    geom                  geometry(Geometry, 3857),
    PRIMARY KEY (census_geo_id)
);
CREATE INDEX IF NOT EXISTS geom_index ON zipcode_demographics USING GIST (geom);

-- Lead connections aggregation tables.

CREATE TABLE IF NOT EXISTS state_lead_connections
(
    census_geo_id             varchar(255) NOT NULL,
    name                      varchar(255) NOT NULL,
    lead_connections_count    float,
    service_connections_count float,
    population_served         real,
    geom                      geometry(Geometry, 3857),
    PRIMARY KEY (census_geo_id)
);
CREATE INDEX IF NOT EXISTS geom_index ON state_lead_connections USING GIST (geom);

CREATE TABLE IF NOT EXISTS county_lead_connections
(
    census_geo_id             varchar(255) NOT NULL,
    name                      varchar(255) NOT NULL,
    lead_connections_count    float,
    service_connections_count float,
    population_served         real,
    geom                      geometry(Geometry, 3857),
    PRIMARY KEY (census_geo_id)
);
CREATE INDEX IF NOT EXISTS geom_index ON county_lead_connections USING GIST (geom);

-- TODO(kailamjeter): Add insert statement once the zipcode -> lead_connections
-- connection established.
CREATE TABLE IF NOT EXISTS zipcode_lead_connections
(
    census_geo_id             varchar(255) NOT NULL,
    zipcode                   varchar(255) NOT NULL,
    lead_connections_count    float,
    service_connections_count float,
    population_served         real,
    geom                      geometry(Geometry, 3857),
    PRIMARY KEY (census_geo_id)
);
CREATE INDEX IF NOT EXISTS geom_index ON zipcode_lead_connections USING GIST (geom);

-- Populate pre-computed tables. These are only to be used by the functions
-- defined below.

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

CREATE INDEX IF NOT EXISTS geom_index ON state_demographics USING GIST (geom);

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

CREATE INDEX IF NOT EXISTS geom_index ON county_demographics USING GIST (geom);

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

INSERT INTO county_lead_connections(census_geo_id, name, geom,
                                    lead_connections_count,
                                    service_connections_count,
                                    population_served)
SELECT counties.census_geo_id            as census_geo_id,
       counties.name                     AS name,
       ST_Transform(counties.geom, 3857) AS geom,
       SUM(lead_connections_count)       AS lead_connections_count,
       SUM(service_connections_count)    AS service_connections_count,
       SUM(population_served)            AS population_served
FROM counties
         LEFT JOIN water_systems
                   ON water_systems.state_census_geo_id = counties.census_geo_id
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
                        name,
                        black_population,
                        white_population,
                        total_population,
                        under_five_population,
                        poverty_population
                 FROM county_demographics
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
                 WHERE ST_Transform(w.geom, 3857) && ST_TileEnvelope(z, x, y)
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
                 SELECT ST_AsMVTGeom(ST_Transform(s.geom, 3857),
                                     ST_TileEnvelope(z, x, y)) AS geom,
                        s.name                                 AS state_name,
                        CAST(SUM(v.violation_count) AS int)    AS violation_count
                 FROM violation_counts v
                          RIGHT JOIN states s
                                     ON v.state_census_geo_id = s.census_geo_id
                 WHERE ST_Transform(s.geom, 3857) && ST_TileEnvelope(z, x, y)
                 GROUP BY s.geom,
                          s.name
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
