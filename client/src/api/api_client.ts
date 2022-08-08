import axios from 'axios';
import { GeographicLevel } from '@/model/data_layer';

/**
 * Client to interface with API.
 */
class ApiClient {
  static API_URL = 'https://ei2tz84crb.execute-api.us-east-2.amazonaws.com/dev';

  request = async (endpoint: string, callback: (data: any) => any): Promise<ApiResponse> => {
    const apiResponse: ApiResponse = {};
    try {
      const data = await axios.get<any>(endpoint, {
        headers: {
          Accept: 'application/json',
        },
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
        pwsId: data?.data?.water_system_pws_id,
        zipCode: data?.data?.zip_code,
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
        // TODO(breuch): Update these values with new aggregated table columns
        return {
          geoId: data?.data?.pws_id,
          averageHomeAge: data?.data?.average_home_age,
          averageSocialVulnerabilityIndex: data?.data?.average_social_vulnerability,
          averageIncome: data?.data?.average_social_vulnerability,
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
        pwsId: data?.data?.pws_id,
        leadServiceLines: data?.data?.lead_service_lines,
        serviceLines: data?.data?.service_lines,
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
