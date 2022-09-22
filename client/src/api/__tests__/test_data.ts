import { ApiResponse } from '@/api/api_client';

const ADDRESS = '319 Troy Street';
const AVERAGE_INCOME = 87589;
const CALIFORNIA = 'CA';
const COUNTY_ZTA = '06037';
const HOME_AGE = 56;
const HOME_AGE_INDEX = 1.9848244;
const LEAD_SERVICE_LINES_COUNT = 37654.684;
const INCOME_INDEX = 2.9640052;
const PWS_ID = 'CA1910067';
const SERVICE_LINES_COUNT = 337907;
const SOCIAL_VULNERABILITY_INDEX = 3.664414;
const TOLEDO = 'Toledo';
const TOLEDO_LEAD_PREDICTION = 0.9998503;
const ZIP_CODE = '90066';
const WATER_SYSTEM_NAME = 'Water system name';
const WATER_SYSTEM_BOUNDING_BOX = {
  minLat: 33.70649999921758,
  minLon: -118.66816000022715,
  maxLat: 34.33737000036709,
  maxLon: -118.16050000019223,
};
const ZIP_CODE_BOUNDING_BOX = {
  minLat: 33.973642,
  minLon: -118.455995,
  maxLat: 34.026861,
  maxLon: -118.408598,
};

const getGeoIdsAxiosResponse = {
  county: { id: COUNTY_ZTA, bounding_box: {} },
  state: { id: CALIFORNIA, bounding_box: {} },
  water_system_pws_id: {
    id: PWS_ID,
    bounding_box: WATER_SYSTEM_BOUNDING_BOX,
  },
  zip_code: {
    id: ZIP_CODE,
    bounding_box: ZIP_CODE_BOUNDING_BOX,
  },
};

const getScorecardAxiosResponse = {
  geoid: ZIP_CODE,
  home_age_index: HOME_AGE_INDEX,
  average_home_age: HOME_AGE,
  average_social_vulnerability: SOCIAL_VULNERABILITY_INDEX,
  income_index: INCOME_INDEX,
  average_income: AVERAGE_INCOME,
};

const getParcelAxiosResponse = {
  address: ADDRESS,
  city: TOLEDO,
  public_lead_low_prediction: TOLEDO_LEAD_PREDICTION,
  public_lead_high_prediction: TOLEDO_LEAD_PREDICTION,
  private_lead_low_prediction: 0.0,
  private_lead_high_prediction: 0.0,
};

const getWaterSystemAxiosResponse = {
  pws_id: PWS_ID,
  pws_name: WATER_SYSTEM_NAME,
  lead_service_lines: LEAD_SERVICE_LINES_COUNT,
  service_lines: SERVICE_LINES_COUNT,
};

const internalError = {
  error: {
    status: '500',
    error: 'Request failed with status code 500',
  },
};

// Results for geolocate/34.001557,-118.430297
const getGeoIdsApiResponse: ApiResponse = {
  data: {
    address: {
      id: undefined,
      boundingBox: undefined,
    },
    pwsId: {
      id: PWS_ID,
      boundingBox: WATER_SYSTEM_BOUNDING_BOX,
    },
    zipCode: {
      id: ZIP_CODE,
      boundingBox: ZIP_CODE_BOUNDING_BOX,
    },
  },
};

// Results for /zipcode/scorecard/90066
const getDemographicDataApiResponse: ApiResponse = {
  data: {
    geoId: ZIP_CODE,
    averageHomeAge: HOME_AGE,
    averageSocialVulnerabilityIndex: SOCIAL_VULNERABILITY_INDEX,
    averageIncome: INCOME_INDEX,
  },
};

// Results for /watersystem/CA1910067
const getWaterSystemApiResponse: ApiResponse = {
  data: {
    pwsId: PWS_ID,
    pwsName: WATER_SYSTEM_NAME,
    leadServiceLines: LEAD_SERVICE_LINES_COUNT,
    serviceLines: SERVICE_LINES_COUNT,
  },
};

// Results for /parcel/41.677485,-83.499345
const getParcelApiResponse: ApiResponse = {
  data: {
    address: ADDRESS,
    city: TOLEDO,
    publicLeadLowPrediction: TOLEDO_LEAD_PREDICTION,
    publicLeadHighPrediction: TOLEDO_LEAD_PREDICTION,
    privateLeadLowPrediction: 0.0,
    privateLeadHighPrediction: 0.0,
  },
};

export {
  getGeoIdsAxiosResponse,
  getParcelAxiosResponse,
  getScorecardAxiosResponse,
  getWaterSystemAxiosResponse,
  getGeoIdsApiResponse,
  getDemographicDataApiResponse,
  getWaterSystemApiResponse,
  getParcelApiResponse,
  internalError,
};
