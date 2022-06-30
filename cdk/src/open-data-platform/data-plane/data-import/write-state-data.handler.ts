import { RDSDataService } from 'aws-sdk';
import { BatchExecuteStatementRequest, SqlParametersList } from 'aws-sdk/clients/rdsdataservice';
import { geoJsonHandlerFactory } from './handler-factory';

// As of 2022-06-27, this should have 56 rows.
const s3Params = {
  Bucket: 'opendataplatformapistaticdata',
  Key: 'cb_2021_us_state_500k.geojson',
};

const SCHEMA = 'public';

/**
 * Single row for states table.
 */
class StateTableRow {
  // Field formatting conforms to rows in the db. Requires less transformations.

  // Federal geo-identifier.
  census_geo_id: string;
  // State FIPS code.
  fips: string;
  // State ANSI code.
  ansi: string;
  // American FactFinder summary level code + geovariant code + '00US' + GEOID.
  aff_geo_id: string;
  // USPS State abbreviation.
  usps: string;
  // Name of the state.
  name: string;
  // Current legal/statistical area description code for state.
  lsad: string;
  // GeoJSON representation of the state boundaries.
  geom: string;

  constructor(
    census_geo_id: string,
    fips: string,
    ansi: string,
    aff_geo_id: string,
    usps: string,
    name: string,
    lsad: string,
    geom: string,
  ) {
    this.census_geo_id = census_geo_id;
    this.fips = fips;
    this.ansi = ansi;
    this.aff_geo_id = aff_geo_id;
    this.usps = usps;
    this.name = name;
    this.lsad = lsad;
    this.geom = geom;
  }
}

/**
 * Builder utility for rows of the states table.
 */
class StateTableRowBuilder {
  private readonly _row: StateTableRow;

  constructor() {
    this._row = new StateTableRow('', '', '', '', '', '', '', '');
  }

  censusGeoId(censusGeoId: string): StateTableRowBuilder {
    this._row.census_geo_id = censusGeoId;
    return this;
  }

  fips(fips: string): StateTableRowBuilder {
    this._row.fips = fips;
    return this;
  }

  ansi(ansi: string): StateTableRowBuilder {
    this._row.ansi = ansi;
    return this;
  }

  affGeoId(affGeoId: string): StateTableRowBuilder {
    this._row.aff_geo_id = affGeoId;
    return this;
  }

  usps(usps: string): StateTableRowBuilder {
    this._row.usps = usps;
    return this;
  }

  name(name: string): StateTableRowBuilder {
    this._row.name = name;
    return this;
  }

  lsad(lsad: string): StateTableRowBuilder {
    this._row.lsad = lsad;
    return this;
  }

  geom(geom: string): StateTableRowBuilder {
    this._row.geom = geom;
    return this;
  }

  build(): SqlParametersList {
    return [
      {
        name: 'census_geo_id',
        value: { stringValue: this._row.census_geo_id },
      },
      {
        name: 'fips',
        value: { stringValue: this._row.fips },
      },
      {
        name: 'ansi',
        value: { stringValue: this._row.ansi },
      },
      {
        name: 'aff_geo_id',
        value: { stringValue: this._row.aff_geo_id },
      },
      {
        name: 'usps',
        value: { stringValue: this._row.usps },
      },
      {
        name: 'name',
        value: { stringValue: this._row.name },
      },
      {
        name: 'lsad',
        value: { stringValue: this._row.lsad },
      },
      {
        name: 'geom',
        value: { stringValue: this._row.geom.toString() },
      },
    ];
  }
}

/**
 *  Writes rows into the states table.
 * @param rdsService: RDS service to connect to the db.
 * @param rows: Rows to write to the db.
 */
async function insertBatch(
  rdsService: RDSDataService,
  rows: SqlParametersList[],
): Promise<RDSDataService.BatchExecuteStatementResponse> {
  const batchExecuteParams: BatchExecuteStatementRequest = {
    database: process.env.DATABASE_NAME ?? 'postgres',
    parameterSets: rows,
    resourceArn: process.env.RESOURCE_ARN ?? '',
    schema: SCHEMA,
    secretArn: process.env.CREDENTIALS_SECRET ?? '',
    sql: `INSERT INTO states (census_geo_id,
                              fips,
                              ansi,
                              aff_geo_id,
                              usps,
                              name,
                              lsad,
                              geom)
          VALUES (:census_geo_id,
                  :fips,
                  :ansi,
                  :aff_geo_id,
                  :usps,
                  :name,
                  :lsad,
                  ST_AsText(ST_GeomFromGeoJSON(:geom))) ON CONFLICT (census_geo_id) DO NOTHING`,
  };
  return rdsService.batchExecuteStatement(batchExecuteParams).promise();
}

/**
 * Maps a data row to a table row ready to write to the db.
 * @param row: row with all data needed to build a [StateTableRow].
 */
function getTableRowFromRow(row: any): SqlParametersList {
  const value = row.value;
  const properties = value.properties;
  return (
    new StateTableRowBuilder()
      .censusGeoId(properties.GEOID)
      .fips(properties.STATEFP)
      .ansi(properties.STATENS)
      .affGeoId(properties.AFFGEOID ?? '')
      .usps(properties.STUSPS)
      .name(properties.NAME)
      .lsad(properties.LSAD)
      // Keep JSON formatting. Post-GIS helpers depend on this.
      .geom(JSON.stringify(value.geometry))
      .build()
  );
}

/**
 * Parses S3 'cb_2021_us_state_500k.geojson' file and writes rows
 * to states table in the MainCluster postgres db.
 */
export const handler = geoJsonHandlerFactory(
  s3Params,
  async (rows: any[], rdsDataService: RDSDataService) => {
    await insertBatch(rdsDataService, rows.map(getTableRowFromRow));
  },
);