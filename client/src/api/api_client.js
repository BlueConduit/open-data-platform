import axios from 'axios';
/**
 * Client to interface with API.
 */
class ApiClient {
    static API_URL = 'https://ei2tz84crb.execute-api.us-east-2.amazonaws.com/dev/geolocate/';
    /**
     *   Retrieve geo ids of the geographic entities which intersect with the
     *   lat, long pair.
     */
    getGeoIdsFromLatLong = async (lat, long) => {
        const apiResponse = {};
        try {
            const data = await axios.get(`${ApiClient.API_URL}${lat},${long}`, {
                headers: {
                    Accept: 'application/json',
                },
            });
            apiResponse.data = {
                pws_id: data?.data?.water_system_pws_id,
                zip_code: data?.data?.zip_code,
            };
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                apiResponse.error = { status: status, error: error.message };
            }
        }
        return apiResponse;
    };
}
export { ApiClient };
//# sourceMappingURL=api_client.js.map