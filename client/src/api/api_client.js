import axios from 'axios';
/**
 * Client to interface with API.
 */
class ApiClient {
    // Retrieve geo ids for API.
    getGeoIdsFromLatLong = async (lat, long) => {
        const apiResponse = {};
        try {
            const data = await axios.get(`https://ei2tz84crb.execute-api.us-east-2.amazonaws.com/dev/geolocate/${lat},${long}`, {
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