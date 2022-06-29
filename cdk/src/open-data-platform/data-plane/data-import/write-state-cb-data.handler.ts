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
class StateRow {
  // Field formatting conforms to rows in the db. Requires less transformations.

  statefp: string;
  statens: string;
  aff_geoid: string;
  geoid: string;
  st_usps: string;
  name: string;
  lsad: string;
  aland: number;
  awater: number;
  geom: string;

  constructor(
    statefp: string,
    statens: string,
    aff_geoid: string,
    geoid: string,
    st_usps: string,
    name: string,
    lsad: string,
    aland: number,
    awater: number,
    geom: string,
  ) {
    this.statefp = statefp;
    this.statens = statens;
    this.aff_geoid = aff_geoid;
    this.geoid = geoid;
    this.st_usps = st_usps;
    this.name = name;
    this.lsad = lsad;
    this.aland = aland;
    this.awater = awater;
    this.geom = geom;
  }
}

/**
 * Builder utility for rows of the states table.
 */
class StateRowBuilder {
  private readonly _row: StateRow;

  constructor() {
    this._row = new StateRow('', '', '', '', '', '', '', 0, 0, '');
  }

  statefp(statefp: string): StateRowBuilder {
    this._row.statefp = statefp;
    return this;
  }

  statens(statens: string): StateRowBuilder {
    this._row.statens = statens;
    return this;
  }

  affGeoid(aff_geoid: string): StateRowBuilder {
    this._row.aff_geoid = aff_geoid;
    return this;
  }

  geoid(geoid: string): StateRowBuilder {
    this._row.geoid = geoid;
    return this;
  }

  stUsps(st_usps: string): StateRowBuilder {
    this._row.st_usps = st_usps;
    return this;
  }

  name(name: string): StateRowBuilder {
    this._row.name = name;
    return this;
  }

  lsad(lsad: string): StateRowBuilder {
    this._row.lsad = lsad;
    return this;
  }

  aland(aland: number): StateRowBuilder {
    this._row.aland = aland;
    return this;
  }

  awater(awater: number): StateRowBuilder {
    this._row.awater = awater;
    return this;
  }

  geom(geom: string): StateRowBuilder {
    this._row.geom = geom;
    return this;
  }

  build(): SqlParametersList {
    return [
      {
        name: 'statefp',
        value: { stringValue: this._row.statefp },
      },
      {
        name: 'statens',
        value: { stringValue: this._row.statens },
      },
      {
        name: 'aff_geoid',
        value: { stringValue: this._row.aff_geoid },
      },
      {
        name: 'geoid',
        value: { stringValue: this._row.geoid },
      },
      {
        name: 'st_usps',
        value: { stringValue: this._row.st_usps },
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
        name: 'aland',
        value: { doubleValue: this._row.aland },
      },
      {
        name: 'awater',
        value: { doubleValue: this._row.awater },
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
                              aff_geo_id,
                              name,
                              state_fips,
                              state_ansi,
                              st_usps,
                              lsad,
                              aland,
                              awater,
                              geom)
          VALUES (:geoid,
                  :aff_geoid,
                  :name,
                  :statefp,
                  :statens,
                  :st_usps,
                  :lsad,
                  :aland,
                  :awater,
                  ST_AsText(ST_GeomFromGeoJSON(:geom))) ON CONFLICT (census_geo_id) DO NOTHING`,
  };
  return rdsService.batchExecuteStatement(batchExecuteParams).promise();
}

/**
 * Sometimes these fields are negative because they are based on a regression.
 */
function getValueOrDefault(field: string): number {
  return Math.max(parseFloat(field == 'NaN' || field == null ? '0' : field), 0);
}

/**
 * Maps a data row to a table row ready to write to the db.
 * @param row: row with all data needed to build a [StateRow].
 */
function getTableRowFromRow(row: any): SqlParametersList {
  const value = row.value;
  const properties = value.properties;
  return (
    new StateRowBuilder()
      .statefp(properties.STATEFP)
      .statens(properties.STATENS)
      .affGeoid(properties.AFFGEOID)
      .geoid(properties.GEOID)
      .stUsps(properties.STUSPS)
      .name(properties.NAME)
      .lsad(properties.LSAD)
      .aland(getValueOrDefault(properties.ALAND))
      .awater(getValueOrDefault(properties.AWATER))
      // Keep JSON formatting. Post-GIS helpers depend on this.
      .geom(JSON.stringify(value.geometry))
      .build()
  );
}

/**
 * Parses S3 'pwsid_lead_connections_even_smaller.geojson' file and writes rows
 * to states table in the MainCluster postgres db.
 */
export const handler = geoJsonHandlerFactory(
  s3Params,
  async (rows: any[], rdsDataService: RDSDataService) => {
    await insertBatch(rdsDataService, rows.map(getTableRowFromRow));
  },
);