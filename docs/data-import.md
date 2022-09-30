# Importing Data to LeadOut

The data that powers [LeadOut](https://leadout.blueconduit.com/) is stored in a
[serverless Aurora PostgreSQL](https://www.postgresql.org/) database. The
original data sources are stored in
the [opendataplatformapistaticdata S3 bucket](https://s3.console.aws.amazon.com/s3/buckets/opendataplatformapistaticdata?region=us-east-2&tab=objects)
in json, geojson, and csv files. To get this data into the database, we chose to
write import logic in AWS Lambda functions, which need to be run manually. The
purpose of this document is to provide instructions for creating the necessary
tables and running the lambdas to import the data.

## Helpful links

* [AWS accounts page](https://blueconduit.awsapps.com/start#/)
    * Development account management console is where you can access the lambdas
      and query editor
* [Lambda functions](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions)
* [Query editor](https://us-east-2.console.aws.amazon.com/rds/home?region=us-east-2#query-editor)
* [Secrets manager for accessing db credentials secret](https://us-east-2.console.aws.amazon.com/secretsmanager/listsecrets?region=us-east-2)
    * Search for your username and find the MainCluser associated with it, e.g.
      MainClusterSecretD2D17D33-msBN0ykXL2Os

## Creating tables

* [Schema.sql](../cdk/src/open-data-platform/data-plane/schema/schema.sql)
  file contains all SQL to create necessary tables and some insert statements
  for tables for which insertion is not as straightforward as importing from an
  S3 file via lambda
* Schema.sql is run when you deploy the DataPlane stack
* This will successfully create all tables and functions
* This will also run the special insert statements however these will not add
  any data to the tables if data has not been imported to the other tables via
  lambda import
    * Instructions for these inserts are covered in next section

## Populating tables with data

* This requires running the lambdas associated with each table
* Do this by going to the Development account > management console > Lambda and
  find the function associated with the table you’d like to populate
    * For prod do this in the Production account
    * For example if I want to insert to the water_systems table, I will find
      the write-water-systems-data.handler.ts, which when deployed is under the
      function name
      kailajeter-OpenDataPlatfo-DataImportStackwritewate-5lp1t53eJfwy in my
      account
        * To populate the dev DB instance, functions will be prefixed with
          Dev- (
          example:
          Dev-OpenDataPlatformAppPl-ApiStackwatersystemhandler)
        * To populate the prod DB instance, functions will be prefixed with
          Prod- (
          example: Prod-OpenDataPlatformAppPl-ApiStackwatersystemhandler)
        * To find the function to populate a sandbox DB, filter by the
          username (e.g. ‘kailajeter’) and then ctrl+f for the beginning of the
          function name like ‘writewat’ since the full name gets cut off
* Once in the function page, click ‘Test’ to test the function, which just means
  running the lambda
    * If you haven’t done this before, it will prompt you to create a test
      event. What this event is named and the json passed to the test event does
      not matter since we don’t use these params in the lambdas
    * You can use a test event to set a row limit and number of rows to skip (
      offset):
        * Use rowOffset and rowLimit
* If your function times out, or runs out of memory, modify the Configuration
  time to have a timeout of 15 minutes and a memory max of 10240 MB
* Note sometimes these lambdas have intermittent errors which can be related to
  db connection, large payload size, etc. If your table does not have the right
  number of rows (should be listed in the handler) after running the lambda due
  to errors, rerun the lambda

## Prod data

We have a prod database separate from the dev database. The prod database lives
in
the [Production account](https://us-east-2.console.aws.amazon.com/console/home?region=us-east-2#)
, but includes the same tables and data as the dev db.

Since the Production account does not have access to the Development account and
[S3 bucket names are globally unique](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingBucket.html)
, the bucket name is suffixed with '-prod'. When running any of the data import
lambdas in hte Production account, append this string to the S3 bucket name.

## Specific table instructions + mappings

**Note:** If any **foreign keys** are listed, the table that contains that
foreign key must be imported before the table that depends on it. Otherwise, you
will see an error because the dependent table is trying to insert a row that has
a value that is not in the foreign key table.

### Tables

#### states

* Holds official census.gov U.S. state data
    * 56 rows
* Import lambda:
  [write-state-data.handler.ts](../cdk/src/open-data-platform/data-plane/data-import/write-state-data.handler.ts)
* Lambda instructions: run as stated above
* Note that this does not contain lead data related to states yet – this is
  probably going to be end state but for now we have a few other state tables
  which have state related lead / epa violations data

#### counties

* Holds official census.gov U.S. county data
    * 3234 rows
* Foreign keys
    * states fips
* Import lambda:
  [write-county-data.handler.ts](../cdk/src/open-data-platform/data-plane/data-import/write-county-data.handler.ts)
* Lambda instructions: run as stated above

#### zipcodes

* Holds official census.gov U.S. zip code data
    * 33,791 rows
* Import lambda:
  [write-zipcode-data.handler.ts](../cdk/src/open-data-platform/data-plane/data-import/write-zipcode-data.handler.ts)
* Lambda instructions: run as stated above

#### demographics

* Holds census demographic data for census blocks
    * 231,270 rows
* Foreign keys
    * states census_geo_id
    * counties census_geo_id
* Import lambda:
  [write-demographic-data.handler.ts](../cdk/src/open-data-platform/data-plane/data-import/write-demographic-data.handler.ts)
* Lambda instructions: there is a lot of this data, so it is broken into 5 files
  named block_acs_data_<index>
  .geojson. You will need to replace the index with numbers 0-4 and run the
  lambda for each file to get all data. These instructions are in the handler as
  well.
* Note that this data was displayed on the old map and is currently not visible
  in the UI. We may or may not use this in the future, but this is low priority
  for now.

#### aggregate_us_demographics

* Holds aggregate census demographic data for states, counties, and zipcodes
    * 33,823 rows
* Import lambdas
    * [write-aggregate-state-demographic-data.handler.ts](../cdk/src/open-data-platform/data-plane/data-import/write-aggregate-state-demographic-data.handler.ts)
    * [write-aggregate-county-demographic-data.handler.ts](../cdk/src/open-data-platform/data-plane/data-import/write-aggregate-county-demographic-data.handler.ts)
    * [write-aggregate-zip-demographic-data.handler.ts](../cdk/src/open-data-platform/data-plane/data-import/write-aggregate-zip-demographic-data.handler.ts)
* Lambda instructions: run as stated above
* **Note** that this contains entirely separate information from the
  demographics table. The demographics table data is displayed in the Population
  tab on the map, while this is used for the ‘Understanding your score’ section
  of the scorecard, which is queried by the zipcodes/ api.
    * **Future AI**: Either merge the aggregated tables or to use the
      aggregate_us_demographics data in the map view.

#### water_systems

* Holds water system properties and the estimated number of lead connections in
  each water system
    * 26,010 rows
* Foreign keys
    * states census_geo_id
* Import lambda:
  [write-water-systems-data.handler.ts](../cdk/src/open-data-platform/data-plane/data-import/write-water-systems-data.handler.ts)
* Lambda instructions: run as stated above

#### epa_violations

* Contains EPA violation data for each water system
    * 2005 rows
* Foreign keys
    * states census_geo_id
* Import lambda:
  [write-violations-data.handler.ts](../cdk/src/open-data-platform/data-plane/data-import/write-violations-data.handler.ts)
* Lambda instructions: run as stated above

#### parcels

* This contains parcel data, including estimated lead likelihood
    * 145k rows
* Lambda handlers: for now
  just [write-parcels-data.handler.ts](../cdk/src/open-data-platform/data-plane/data-import/write-parcels-data.handler.ts)
  but this may change when we receive more parcel data
* Lambda instructions: run as stated above

### Aggregated views and tables

The following tables contain data from previous tables aggregated at the state
level. While getting these views is possible in the API layer, we've found that
storing the data in separate tables decreases the query latency.

#### state_lead_connections

* This contains water_systems data aggregated by the containing state
* Insert with insert statement contained in schema.sql via query editor
* Prerequisites for inserting
    * water_systems and states tables populated
    * water_systems state_census_geo_id is populated

#### state_epa_violations

* This contains epa_violations data aggregated by containing state
* Insert with insert statement contained in schema.sql via query editor
* Prerequisites for inserting
    * epa_violations and states tables populated
    * epa_violations state_census_geo_id is populated

#### state_demographics

* This contains demographics data aggregated by containing state
* Insert with insert statement contained in schema.sql via query editor
* Prerequisites for inserting
    * demographics and states tables populated
    * demographics state_census_geo_id is populated

#### violation_counts

* This is not a table but a view on the water systems table
* Contains epa_violations grouped by pws_id (water system ID)
* You do not need to insert here because it is a view
