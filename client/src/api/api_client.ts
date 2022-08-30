import axios, { AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { GeographicLevel } from '@/model/data_layer';
import prefixes from '../../../cdk/src/open-data-platform/frontend/url-prefixes';

/**
 * Client to interface with API.
 */
class ApiClient {
  // A URL path prefix shared by all API routes.
  static API_URL = `${process.env.VUE_APP_API_ENDPOINT ?? ''}/api`;

  constructor() {
    console.log('Using API:', ApiClient.API_URL);
  }

  request = async (endpoint: string, callback: (data: any) => any): Promise<ApiResponse> => {
    axiosRetry(axios, {
      retries: 3,
      retryDelay: (retryCount) => {
        return retryCount * 2000; // Time between retries
      },
      retryCondition: (error: AxiosError) => {
        // Retry on internal errors.
        return error.response?.status === 502;
      },
    });

    const apiResponse: ApiResponse = {};
    try {
      const data = await axios.get<any>(endpoint, {
        headers: {
          Accept: 'application/json',
        },
        // By default, the baseURL is the current view's URL including path. Remove that path.
        baseURL: '/',
      });
      apiResponse.data = callback(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        apiResponse.error = { status: status, error: error.message };
      }
    }
    return apiResponse;
  };

  /**
   *   Retrieve geo ids of the geographic entities which intersect with the
   *   lat, long pair.
   */
  getGeoIds = async (lat: string, long: string): Promise<ApiResponse> => {
    return this.request(`${ApiClient.API_URL}/geolocate/${lat},${long}`, (data) => {
      return {
        address: {
          id: data?.data?.address.id,
          boundingBox: data?.data?.address.bounding_box,
        },
        pwsId: {
          id: data?.data?.water_system_pws_id?.id,
          boundingBox: data?.data?.water_system_pws_id?.bounding_box,
        },
        zipCode: {
          id: data?.data?.zip_code?.id,
          boundingBox: data?.data?.zip_code?.bounding_box,
        },
      };
    });
  };

  /**
   *   Retrieve demographic data based on geoid and geo leve.
   */
  getDemographicData = async (geoLevel: GeographicLevel, geoId: string): Promise<ApiResponse> => {
    return this.request(
      `${ApiClient.API_URL}/${GeographicLevel[geoLevel].toLowerCase()}/scorecard/${geoId}`,
      (data) => {
        return {
          geoId: data?.data?.pws_id,
          averageHomeAge: data?.data?.average_home_age,
          averageSocialVulnerabilityIndex: data?.data?.average_social_vulnerability,
          averageIncome: data?.data?.income_index,
        };
      },
    );
  };

  /**
   *   Retrieve water system information based on its pwsId.
   */
  getWaterSystem = async (pwsId: string): Promise<ApiResponse> => {
    return this.request(`${ApiClient.API_URL}/watersystem/${pwsId}`, (data) => {
      return {
        pwsId: data?.data?.pws_id,
        leadServiceLines: data?.data?.lead_service_lines,
        serviceLines: data?.data?.service_lines,
      };
    });
  };

  /**
   *   Retrieve parcel info based on lat,long.
   */
  getParcel = async (lat: string, long: string): Promise<ApiResponse> => {
    return this.request(`${ApiClient.API_URL}/parcel/${lat},${long}`, (data) => {
      return {
        address: data?.data?.address,
        city: data?.data?.city,
        publicLeadLowPrediction: data?.data?.public_lead_low_prediction,
        publicLeadHighPrediction: data?.data?.public_lead_high_prediction,
        privateLeadLowPrediction: data?.data?.private_lead_low_prediction,
        privateLeadHighPrediction: data?.data?.private_lead_high_prediction,
      };
    });
  };
}

/**
 * Response from ApiClient with data and error, if they occurred.
 */
interface ApiResponse {
  data?: any;
  error?: ApiError;
}

/**
 * Error message and error status.
 */
interface ApiError {
  status: string;
  error: string;
}

export { ApiClient, ApiError };
