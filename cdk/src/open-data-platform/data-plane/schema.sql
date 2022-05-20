-- Schema definition for the main DB.

CREATE TABLE IF NOT EXISTS demographics(
    census_geo_id varchar(255) NOT NULL,
    total_population real,
    black_percentage real,
    white_percentage real,
    PRIMARY KEY(census_geo_id)
);