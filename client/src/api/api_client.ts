import axios from 'axios';

/**
 * Client to interface with API.
 */
class ApiClient {
  // Retrieve geo ids for API.
  getGeoIdsFromLatLong = async (lat: string, long: string): Promise<ApiResponse> => {
    const apiResponse: ApiResponse = {};
    try {
      const data = await axios.get<any>(
        `https://ei2tz84crb.execute-api.us-east-2.amazonaws.com/dev/geolocate/${lat},${long}`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );
      apiResponse.data = {
        pws_id: data?.data?.water_system_pws_id,
        zip_code: data?.data?.zip_code,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        apiResponse.error = { status: status, error: error.message };
      }
    }
    return apiResponse;
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
