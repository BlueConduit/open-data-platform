/// <reference types="vitest" />
import { ApiClient } from '@/api/api_client';
import MockAdapter from 'axios-mock-adapter';
import { beforeEach, expect, it, TestFunction } from 'vitest';
import {
  getDemographicDataApiResponse,
  getGeoIdsApiResponse,
  internalError,
  getGeoIdsAxiosResponse,
  getScorecardAxiosResponse,
  getWaterSystemApiResponse,
  getWaterSystemAxiosResponse,
  getParcelApiResponse,
  getParcelAxiosResponse,
} from '@/api/__tests__/test_data';
import { GeographicLevel } from '@/model/data_layer';

const apiClient = new ApiClient();
let mockAxios: MockAdapter;

/**
 * Return internal error for given endpoint.
 */
const mockError = (endpoint: string) => {
  mockAxios.onGet(endpoint).reply(500);
};

/**
 * Return 200 code for geolocate/{lat},{long} endpoint for given lat, long.
 */
const mockGetGeoIdsResponse = (lat: string, long: string) => {
  mockAxios
    .onGet(`${ApiClient.API_URL}/geolocate/${lat},${long}`)
    .reply(200, getGeoIdsAxiosResponse);
};

/**
 * Return 200 code for zipcode/scorecard'{zipCode} endpoint for given zip code.
 */
const mockGetScorecardResponse = (zipCode: string) => {
  mockAxios
    .onGet(`${ApiClient.API_URL}/zipcode/scorecard/${zipCode}`)
    .reply(200, getScorecardAxiosResponse);
};

/**
 * Return 200 code for watersystem/{pwsId} endpoint for given pwsId.
 */
const mockGetWaterSystemResponse = (pwsId: string) => {
  mockAxios
    .onGet(`${ApiClient.API_URL}/watersystem/${pwsId}`)
    .reply(200, getWaterSystemAxiosResponse);
};

/**
 * Return 200 code for parcel/{pwsId} endpoint for given lat, long.
 */
const mockGetParcelResponse = (lat: string, long: string) => {
  mockAxios.onGet(`${ApiClient.API_URL}/parcel/${lat},${long}`).reply(200, getParcelAxiosResponse);
};

describe('axios mocking test', () => {
  beforeEach(() => {
    mockAxios = new MockAdapter(apiClient.getClient(), { onNoMatch: 'throwException' });
  });

  afterEach(() => {
    mockAxios.reset();
  });

  describe('on success should return data from', () => {
    it('getGeoIds', async () => {
      const lat = '34.001557';
      const long = '-118.430297';
      mockGetGeoIdsResponse(lat, long);

      expect(await apiClient.getGeoIds(lat, long)).toStrictEqual(getGeoIdsApiResponse);
    });

    it('getDemographicData', async () => {
      const zipCode = '90066';
      mockGetScorecardResponse(zipCode);

      expect(await apiClient.getDemographicData(GeographicLevel.ZipCode, zipCode)).toStrictEqual(
        getDemographicDataApiResponse,
      );
    });

    it('getWaterSystem', async () => {
      const pwsId = 'CA1910067';
      mockGetWaterSystemResponse(pwsId);

      expect(await apiClient.getWaterSystem(pwsId)).toStrictEqual(getWaterSystemApiResponse);
    });

    it('getParcel', async () => {
      const lat = '41.677485';
      const long = '-83.499345';
      mockGetParcelResponse(lat, long);

      expect(await apiClient.getParcel(lat, long)).toStrictEqual(getParcelApiResponse);
    });
  });

  describe('on error should return a status and message for', () => {
    it('getGeoIds', async () => {
      const lat = '0';
      const long = '0';

      mockError(`${ApiClient.API_URL}/geolocate/${lat},${long}`);
      expect(await apiClient.getGeoIds(lat, long)).toStrictEqual(internalError);
    });

    it('getDemographicData', async () => {
      const zipCode = '90066';

      mockError(`${ApiClient.API_URL}/zipcode/scorecard/${zipCode}`);
      expect(await apiClient.getDemographicData(GeographicLevel.ZipCode, zipCode)).toStrictEqual(
        internalError,
      );
    });

    it('getWaterSystem', async () => {
      const pwsId = '000000';

      mockError(`${ApiClient.API_URL}/watersystem/${pwsId}`);
      expect(await apiClient.getWaterSystem(pwsId)).toStrictEqual(internalError);
    });

    it('getParcel', async () => {
      const lat = '0';
      const long = '0';

      mockError(`${ApiClient.API_URL}/parcel/${lat},${long}`);
      expect(await apiClient.getParcel(lat, long)).toStrictEqual(internalError);
    });
  });
});
