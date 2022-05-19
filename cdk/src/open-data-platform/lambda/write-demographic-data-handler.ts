// asset-input/src/open-data-platform/lambda/write-demographic-data-handler.js
import {Context, APIGatewayProxyCallback, APIGatewayEvent} from 'aws-lambda';

const AWS = require('aws-sdk');
const parse = require('csv-parser');
const S3 = new AWS.S3();
const rdsDataService = new AWS.RDSDataService();

const GEO_ID = 'GEOID';
const RACE_TOTAL = 'RaceTotal';
const WHITE_POPULATION = 'Estimate!!Total:!!White alone';
const BLACK_POPULATION = 'Estimate!!Total:!!Black or African American alone';

/// Prepared SQL statements.
const CREATE_DEMOGRAPHICS_TABLE =
		'CREATE TABLE IF NOT EXISTS demographics( \n' +
		'   census_geo_id varchar(255) NOT NULL, \n' +
		'   total_population real, \n' +
		'   black_percentage real,\n' +
		'   white_percentage real, \n' +
		'   PRIMARY KEY(census_geo_id) \n' +
		');';

const DELETE_DEMOGRAPHICS_TABLE = 'DELETE FROM demographics WHERE census_geo_id IS NOT NULL';

/// Reads the S3 CSV file and returns [DemographicsTableRow]s.
const parseS3IntoDemographicsTableRow = (s3Params: Object): Promise<Array<DemographicsTableRow>> => {
	let results: DemographicsTableRow[] = [];
	return new Promise(function (resolve, reject) {
		let count = 0;
		let fileStream = S3.getObject(s3Params).createReadStream();
		fileStream.pipe(parse()).on('data', (chunk) => {
			fileStream.pause();
			// Only process 10 rows for now.
			if (count < 10) {
				let row = new DemographicsTableRowBuilder()
						.censusGeoId(chunk[GEO_ID])
						.totalPopulation(parseInt(chunk[RACE_TOTAL]))
						.blackPopulation(parseInt(chunk[BLACK_POPULATION]))
						.whitePopulation(parseInt(chunk[WHITE_POPULATION]))
						.build();
				count += 1;
				console.log(row);
				results.push(row);
			}
			fileStream.resume();
		}).on('error', (error) => {
			reject(error);
		}).on('end', () => {
			console.log('Parsed ' + results.length + ' rows.');
			resolve(results);
		});
	});
}

/// Parses rows and columns of SQL query into [SqlData].
const parseSqlQuery = (data: Object): SqlData => {
	let rows: any[] = [];
	let cols: string[] = [];

	if (data.columnMetadata != undefined) {
		data.columnMetadata.map((value, _) => {
			cols.push(value.name);
		});
	}

	if (data.records != undefined) {
		data.records.map((record: Array<Object>) => {
			let row = {};
			record.map((value, index) => {
				if (value.stringValue !== 'undefined') {
					row[cols[index]] = value.stringValue;
				} else if (value.blobValue !== 'undefined') {
					row[cols[index]] = value.blobValue;
				} else if (value.doubleValue !== 'undefined') {
					row[cols[index]] = value.doubleValue;
				} else if (value.longValue !== 'undefined') {
					row[cols[index]] = value.longValue;
				} else if (value.booleanValue !== 'undefined') {
					row[cols[index]] = value.booleanValue;
				} else if (value.isNull) {
					row[cols[index]] = null;
				}
			});
			rows.push(row);
		});
		console.log('Found rows: ' + rows.length);
	}
	return {columns: cols, rows: rows};
}

/// Executes SQL statement argument against the MainCluster db.
const executeSqlStatement = (secretArn: string, resourceArn: string,
														 statement: string,
														 db: String | undefined,
														 callback: APIGatewayProxyCallback): void => {
	let sqlParams = {
		secretArn: secretArn,
		resourceArn: resourceArn,
		sql: statement,
		database: db ?? 'postgres', // Default db
		includeResultMetadata: true
	};

	rdsDataService.executeStatement(sqlParams,
			function (err: Error, data: Object) {
				if (err) {
					console.log(err);
					callback('Error: RDS statement failed to execute');
				} else {
					console.log('Data is: ' + data);
					callback(null, {
						statusCode: 200,
						body: JSON.stringify(data)
					});
				}
			});
}
/// Format [DemographicsTableRow] as SQL row.
const formatPopulationTableRowAsSql = (row: DemographicsTableRow): string => {
	let singleValue = [
		row.censusGeoId,
		row.totalPopulation,
		row.percentageBlackPopulation(),
		row.percentageWhitePopulation()];
	return '(' + singleValue.join(',') + ')';
}

/// Write demographic data handler.
exports.handler = (event: APIGatewayEvent, context: Context,
									 callback: APIGatewayProxyCallback): void => {
	const secretArn = event['secretArn'];
	const mainClusterArn = event['mainClusterArn'];

	const s3Params = {
		Bucket: 'opendataplatformapistaticdata',
		Key: 'alabama_acs_data.csv'
	};
	// Read CSV file and write to demographics table.
	parseS3IntoDemographicsTableRow(s3Params)
			.then(function (rows: Array<DemographicsTableRow>) {
				let valuesForSql = rows.map(formatPopulationTableRowAsSql);

				let insertRowsIntoDemographicsTableStatement =
						'INSERT INTO demographics  \n' +
						'(census_geo_id, total_population, black_percentage, white_percentage) \n' +
						'VALUES \n' +
						valuesForSql.join(', ') + '; \n';

				console.log(
						'Running statement: ' + insertRowsIntoDemographicsTableStatement);
				executeSqlStatement(secretArn, mainClusterArn,
						insertRowsIntoDemographicsTableStatement, 'postgres', callback);

			}).catch(function (err) {
		console.log('Error:' + err);
		callback(null, {
			statusCode: 500,
			body: JSON.stringify(err.message)
		});
	});
};

/// Single row for demographics table.
class DemographicsTableRow {
	censusGeoId: string;
	totalPopulation: number;
	blackPopulation: number;
	whitePopulation: number;

	constructor(censusGeoId: string, totalPopulation: number,
							blackPopulation: number, whitePopulation: number) {
		this.censusGeoId = censusGeoId;
		this.totalPopulation = totalPopulation;
		this.blackPopulation = blackPopulation;
		this.whitePopulation = whitePopulation;
	}

	/// Returns black population : total population.
	percentageBlackPopulation(): number {
		return this.blackPopulation / this.totalPopulation;
	}

	/// Returns white population : total population.
	percentageWhitePopulation(): number {
		return this.whitePopulation / this.totalPopulation;
	}
}

/// Builder utility for rows of the Demographics table.
class DemographicsTableRowBuilder {
	private readonly _row: DemographicsTableRow;

	constructor() {
		this._row = new DemographicsTableRow(
				'',
				0,
				0, 0);
	}

	censusGeoId(censusGeoId: string): DemographicsTableRowBuilder {
		this._row.censusGeoId = censusGeoId;
		return this;
	}

	totalPopulation(totalPopulation: number): DemographicsTableRowBuilder {
		this._row.totalPopulation = totalPopulation;
		return this;
	}

	blackPopulation(blackPopulation: number): DemographicsTableRowBuilder {
		this._row.blackPopulation = blackPopulation;
		return this;
	}

	whitePopulation(whitePopulation: number): DemographicsTableRowBuilder {
		this._row.whitePopulation = whitePopulation;
		return this;
	}

	build(): DemographicsTableRow {
		return this._row;
	}
}

/// Retrieved data from a SQL query.
interface SqlData {
	rows: any[],
	columns: string[]
}
