// asset-input/src/open-data-platform/lambda/write-demographic-data-handler.js
import {Context, APIGatewayProxyCallback, APIGatewayEvent, Callback} from 'aws-lambda';

const AWS = require("aws-sdk");
const parse = require("csv-parser");
const { Readable } = require('stream');
const S3 = new AWS.S3();
const rdsDataService = new AWS.RDSDataService();

/// Reads the S3 bucket object and returns its body.
const readFile = (params: Object) : Promise<any> => {
  return new Promise(function(resolve, reject) {
    S3.getObject(params, function(err: Error, data: Object) {
      if (err) {
        reject(err.message);
      } else {
        resolve(data.Body);
      }
    });
  });
}

/// Executes SQL statement passed in against the MainCluster db.
const executeSqlStatement = (secretArn: String, resourceArn: String, statement: String, callback: APIGatewayProxyCallback) => {
  const db = 'postgres'; // Default db
  let sqlParams = {
    secretArn: secretArn,
    resourceArn: resourceArn,
    sql: statement,
    database: db,
    includeResultMetadata: true
  };

  rdsDataService.executeStatement(sqlParams, function(err: Error, data: Object) {
    if (err) {
      console.log(err);
      callback("Error: RDS statement failed to execute");
    } else {
      let rows: any[] = [];
      let cols: String[] = [];
      data.columnMetadata.map((value, _) => {
        cols.push(value.name);
      });
      data.records.map((record) => {
        let row = {};
        record.map((value, index) => {
          if (value.stringValue !== "undefined") {
            row[cols[index]] = value.stringValue;
          } else if (value.blobValue !== "undefined") {
            row[cols[index]] = value.blobValue;
          } else if (value.doubleValue !== "undefined") {
            row[cols[index]] = value.doubleValue;
          } else if (value.longValue !== "undefined") {
            row[cols[index]] = value.longValue;
          } else if (value.booleanValue !== "undefined") {
            row[cols[index]] = value.booleanValue;
          } else if (value.isNull) {
            row[cols[index]] = null;
          }
        });
        rows.push(row);
      });

      console.log("Found rows: " + rows.length);
      callback(/* error=*/ null, rows);
    }
  });
}

/// Write demographic data handler.
exports.handler = (event: APIGatewayEvent, context: Context, callback: APIGatewayProxyCallback) : void  => {
  const s3Params = {
    Bucket: "opendataplatformapistaticdata",
    Key: "alabama_acs_data.csv"
  };

  let results: string[] = [];

  readFile(s3Params).then(function(buffer) {
    console.log(buffer);
    let file = Readable.from(buffer.Body.toString());
    console.log(file);
    file.pipe(parse()).on("data", function(parsed) {
      console.log("Data parsed: " + parsed);
      results.push(parsed);
    }).on("end", () => {
      console.log("end" + results);
    });
  }).catch(function(err) {
    console.log("Error:" + err);
  });

  //executeSqlStatement("arn:aws:secretsmanager:us-east-2:036999211278:secret:MainClusterSecretD2D17D33-Het1wBB6i4O7-kHd82A",
  // "arn:aws:rds:us-east-2:036999211278:cluster:breuch-opendataplatformdatapl-maincluster834123e8-vsco0l3vde9y",
  // "select * from information_schema.tables"
  // callback);

  callback(null,
      {
        statusCode: 200,
        body: JSON.stringify(results)
      });
};
