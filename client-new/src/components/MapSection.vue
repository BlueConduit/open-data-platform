<template>
	<div class="map-wrapper">
		<div id="map" class="map-container" ref="map"></div>
		<MapLegend />
		<SearchMobile v-if="isMobile()" @queryResults="searchQuery" @close="closeMapPanel" :infoCardActive="infoCardActive" />
		<InfoCard v-show="infoCardActive" @queryResults="searchQuery" />
		<MapPanel v-show="panelActive" :isMobile="isMobile()" :panelData="panelData" :toggleActive="toggleActive"
			@close="closeMapPanel" @queryResults="searchQuery" @togglePanel="setToggleState" />
		<img src="@/assets/images/google.logo.png" class="image-support" alt="Supported by Google.com">
		<HelpModal />
		<Loading v-show="loading" />
	</div>
</template>

<script	lang="ts">
import { defineComponent, ref, type Prop } from 'vue';
import maplibregl, { GeoJSONSource, LngLatBounds, MapMouseEvent, type LngLatLike, type LngLatBoundsLike } from 'maplibre-gl';
import type { GeoJSON, Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import { queryFeatures } from '@esri/arcgis-rest-feature-service';
import { geocode } from '@esri/arcgis-rest-geocoding';
import { ApiKeyManager } from '@esri/arcgis-rest-request';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapPanel from './MapPanel.vue';
import HelpModal from './HelpModal.vue';
import MapLegend from './MapLegend.vue';
import InfoCard from './InfoCard.vue';
import Loading from './Loading.vue';
import SearchMobile from './SearchMobile.vue';

const apiKey = "AAPK11d5429da31346419f8c1f632a62e3b6FS92k0O7YmRmdBscOOcYMe1f5Ea8kkxzLbxO9aZWtDCL6FtHAtHKeBup3Bj0aCS_";
const authentication = ApiKeyManager.fromKey(apiKey);
const basemapEnum = "OSM:LightGray";
const mapStyle = `https://basemaps-api.arcgis.com/arcgis/rest/services/styles/${basemapEnum}?type=style&token=${apiKey}`;
const PWS_LAYER_PATH = "https://services6.arcgis.com/hR19wnqEg78ptZn4/ArcGIS/rest/services/leadout_public_water_systems_dataset_20230303/FeatureServer/0";
const STATE_LAYER_PATH = "https://services6.arcgis.com/hR19wnqEg78ptZn4/arcgis/rest/services/View_of_LeadOut_State-level_Predictions/FeatureServer/0/";
let map: maplibregl.Map;

interface IQueryFeaturesResponse {
	features: GeoJSON.Feature[];
	exceededTransferLimit?: boolean;
}

export default defineComponent({
	name: 'MapSection',
	components: {
		MapPanel,
		HelpModal,
		MapLegend,
		InfoCard,
		Loading,
		SearchMobile
	},

	data: () => {
		return {
			map: maplibregl.Map,
			panelData: {},
			infoCardActive: true,
			panelActive: false,
			toggleActive: true,
			pwsLayerActive: false,
			activeStateCode: '',
			activeStateId: '',
			loading: false,
			zoomAction: false,
		}
	},

	mounted() {
		if (map == null) this.mapCreate();
	},

	methods: {

		isMobile(): boolean {
			return window.matchMedia('(max-width: 768px)').matches;
		},

		getInitialZoom(): number {
			return map?.getZoom();
		},

		closeMapPanel(): void {
			this.panelActive = false;
			this.infoCardActive = true;

			if (this.activeStateId) {
				this.setPwsLayerState(false);

				map?.setFeatureState({ source: 'states', id: this.activeStateId }, { hover: false, active: false });
				map?.setFilter('state-fills', null);
				this.activeStateId = '';
				this.activeStateCode = '';
			}
		},

		setToggleState(state: boolean): void {
			this.toggleActive = state;
		},

		setPwsLayerState(state: boolean): void {
			this.pwsLayerActive = state;

			if (state) {
				map?.setLayoutProperty('pws-fill', 'visibility', 'visible');
				map?.setLayoutProperty('pws-line', 'visibility', 'visible');
			} else {
				map?.setLayoutProperty('pws-fill', 'visibility', 'none');
				map?.setLayoutProperty('pws-line', 'visibility', 'none');
			}
		},

		setZoomBounds(initialZoom: number): void {

			let currentZoom = map?.getZoom();
			let zoomDifference = currentZoom! - initialZoom;

			if (currentZoom && zoomDifference < 3 && !this.pwsLayerActive) return;

			if (currentZoom && zoomDifference >= 3) {
				let currentBounds = map?.getBounds();
				this.boundsQuery(currentBounds);
				map?.setFeatureState({ source: 'states', id: this.activeStateId }, { hover: false, active: false });
				this.zoomAction = true;
			} else if (this.activeStateCode) {
				this.pwsQuery(this.activeStateCode);
			} else {
				this.setPwsLayerState(false);
			}
		},

		async boundsQuery(bounds: LngLatBounds): Promise<void> {
			const envelope = {
				xmin: bounds.getWest(),
				ymin: bounds.getSouth(),
				xmax: bounds.getEast(),
				ymax: bounds.getNorth(),
				spatialReference: {
					wkid: 4326
				}
			};

			let response;
			let loadingTimeout;

			try {
				loadingTimeout = setTimeout(() => {
					this.loading = true;
				}, 1000);

				response = await queryFeatures({
					url: PWS_LAYER_PATH,
					geometry: envelope,
					geometryType: 'esriGeometryEnvelope',
					outFields: [ '*' ],
					f: 'geojson',
				});

				clearTimeout(loadingTimeout);
			} catch (error) {
				console.log(error);
			} finally {
				(map?.getSource('pws') as GeoJSONSource)?.setData(response as GeoJSON);

				this.loading = false;
				this.setPwsLayerState(true);
			}
		},

		searchQuery(data: any): void {
			const stateCode = data.stateAbbr;
			const bounds = data.boundingBox;

			queryFeatures({
				url: STATE_LAYER_PATH,
				where: `state_code = '${stateCode}'`,
				outFields: [ '*' ],
				f: 'geojson',
			})
				.then((response: any) => {
					const stateData = response.features[ 0 ].properties;
					this.panelData = [
						{
							title: stateData.state_name ?? '',
							reportedLsl: stateData.reported_lsl ?? '',
							serviceConnections: stateData.service_connections_count ?? '',
							estLslRate: stateData.est_lsl_rate ?? '',
							lslLow: stateData.est_lsl_rate_low ?? '',
							lslHigh: stateData.est_lsl_rate_high ?? '',
							iijaFunding: stateData.iija_funding ?? '',
							iijaPerLsl: stateData.iija_per_lsl ?? '',
							stateReplacementProgram: stateData.state_replacement_program ?? '',
							inventoryUrl: stateData.inventory_url ?? '',
							dataType: 'State',
						}
					];

					this.infoCardActive = false;
					this.panelActive = true;
					this.activeStateCode = stateCode;
					this.activeStateId = response.features[ 0 ].id;
				});

			map?.fitBounds(bounds, {
				padding: { top: 25, bottom: 25, left: 450, right: 25 },
				linear: true,
				maxZoom: 9,
			});

			this.pwsQuery(stateCode);
			map?.setFilter('state-fills', [ '!=', 'state_code', stateCode ]);
		},

		async queryAllFeatures(url: string, whereClause: string): Promise<Feature[]> {
			const resultRecordCount = 1000;
			let resultOffset = 0;
			let totalCount = 0;
			let allFeatures: Feature[] = [];

			let response = await queryFeatures({
				url: url,
				where: whereClause,
				outFields: [ '*' ],
				resultRecordCount: resultRecordCount,
				resultOffset: resultOffset,
				returnGeometry: true,
				f: 'geojson',
			});

			allFeatures = (response as IQueryFeaturesResponse)?.features ?? [];

			while ((response as IQueryFeaturesResponse)?.exceededTransferLimit) {
				resultOffset += resultRecordCount;

				response = await queryFeatures({
					url: url,
					where: whereClause,
					outFields: [ '*' ],
					resultRecordCount: resultRecordCount,
					resultOffset: resultOffset,
					returnGeometry: true,
					f: 'geojson',
				});

				allFeatures = allFeatures.concat((response as IQueryFeaturesResponse)?.features ?? []);
			}

			console.log(`Total features: ${allFeatures.length}`);

			return allFeatures;
		},

		async pwsQuery(state_code: string): Promise<void> {

			let response;
			let loadingTimeout;

			try {
				if (this.zoomAction) {
					this.zoomAction = false;
					this.setPwsLayerState(false);
				}

				loadingTimeout = setTimeout(() => {
					this.loading = true;
				}, 750);

				response = await
					queryFeatures({
						url: PWS_LAYER_PATH,
						where: `state_code = '${state_code}'`,
						outFields: [ '*' ],
						f: 'geojson',
					});

				clearTimeout(loadingTimeout);

			} catch (error) {
				console.log('error', error);
			} finally {

				(map?.getSource('pws') as GeoJSONSource)?.setData(response as GeoJSON);
				this.loading = false;
				this.setPwsLayerState(true);
			}
		},

		addQueryLayer(): void {
			// TODO: move this to a separate function - used twice
			let layers = map?.getStyle()?.layers;
			let labelLayerId;

			if (layers) {
				for (let i = 0; i < layers.length; i++) {
					if (layers[ i ].type === 'symbol') {
						labelLayerId = layers[ i ].id;
						break;
					}
				}
			}

			map?.addSource('pws', {
				type: 'geojson',
				data: {
					type: 'FeatureCollection',
					features: [],
				},
			});

			// TODO: add layer hover effect
			map?.addLayer(
				{
					id: 'pws-fill',
					type: 'fill',
					source: 'pws',
					paint: {
						'fill-color': [
							'interpolate',
							[ 'linear' ],
							[ 'get', 'est_rate' ],
							0, '#ffedb3',
							0.02, '#ffd74f',
							0.04, '#ffa200',
							0.06, '#ff6e4a',
							0.08, '#d9401f',
							0.1, '#bf3417',
						],
						'fill-opacity': 0.75,
						// 'fill-opacity': [
						// 	'case',
						// 	[ 'boolean', [ 'feature-state', 'hover' ], false ],
						// 	1, 0.5
						// ],
					},
					// minzoom: 6,
				},
				labelLayerId
			);

			// TODO: add layer hover effect
			map?.addLayer(
				{
					id: 'pws-line',
					type: 'line',
					source: 'pws',
					paint: {
						'line-color': '#000',
						'line-width': 1,
					},
					// minzoom: 5,
				},
				labelLayerId
			);
		},

		configureMap(): void {

			let layers = map?.getStyle()?.layers;
			let labelLayerId;
			const maxzoom = this.getInitialZoom() + 3;

			if (layers) {
				for (let i = 0; i < layers.length; i++) {
					if (layers[ i ].type === 'symbol') {
						labelLayerId = layers[ i ].id;
						break;
					}
				}
			}

			this.addQueryLayer();

			map?.addSource('states', {
				type: 'geojson',
				data: STATE_LAYER_PATH + 'query?where=1%3D1&outFields=*&f=pgeojson',
			});

			map?.addLayer(
				{
					id: 'state-fills',
					type: 'fill',
					source: 'states',
					maxzoom: maxzoom,
					layout: {},
					paint: {
						'fill-color': [
							'interpolate',
							[ 'linear' ],
							[ 'get', 'est_lsl_rate' ],
							0, '#ffedb3',
							0.02, '#ffd74f',
							0.04, '#ffa200',
							0.06, '#ff6e4a',
							0.08, '#d9401f',
							0.1, '#bf3417',
						],
						'fill-opacity': 0.6,
					},
				},
				labelLayerId,
			);

			map?.addLayer(
				{
					id: 'state-lines',
					type: 'line',
					source: 'states',
					layout: {},
					paint: {
						'line-color': '#000',
						'line-width': 2,
						'line-opacity': [
							'case',
							[ 'boolean', [ 'feature-state', 'hover' ], false ], 1,
							[ 'boolean', [ 'feature-state', 'active' ], false ], 1, 0,
						],
					},
				},
				labelLayerId,
			);

			let hoveredStateId: string | number | undefined = '';
			let popup = new maplibregl.Popup({
				closeButton: false,
				closeOnClick: false,
				className: 'popup'
			});

			map?.on('mousemove', 'state-fills', (e: MapMouseEvent & { features?: string | any[]; lngLat: LngLatLike }) => {
				map!.getCanvas().style.cursor = 'pointer';
				if (e.features!.length > 0) {
					if (hoveredStateId) {
						map?.setFeatureState(
							{ source: 'states', id: hoveredStateId },
							{ hover: false },
						);
					}
					hoveredStateId = e.features![ 0 ].id;
					map?.setFeatureState(
						{ source: 'states', id: hoveredStateId },
						{ hover: true },
					);
					popup
						.setLngLat(e.lngLat)
						.setHTML(`<span>${e.features![ 0 ].properties.state_name}</span>`)
						.addTo(map);
				}
			});

			map?.on('mouseleave', 'state-fills', () => {
				map!.getCanvas().style.cursor = '';
				if (hoveredStateId) {
					map?.setFeatureState(
						{ source: 'states', id: hoveredStateId },
						{ hover: false },
					);
				}
				hoveredStateId = '';
				popup.remove();
			});

			let activeStateId: string | number | undefined = '';

			map?.on('click', 'state-fills', async (e: MapMouseEvent & { features?: string | any[]; lngLat: LngLatLike; }) => {

				let state = e.features![ 0 ].properties.state_code;
				let lngLat = e.lngLat;


				if (this.activeStateId) {
					map?.setFeatureState(
						{ source: 'states', id: this.activeStateId },
						{ active: false },
					);

					if (this.activeStateId === e.features![ 0 ].id) {
						this.setPwsLayerState(false);

						geocode({
							region: state,
							authentication,
							params: {
								sourceCountry: 'USA',
								maxLocations: 1,
								f: 'json',
							},
						})
							.then((response: any) => {
								const bbox = response.candidates[ 0 ].extent;
								const bounds: LngLatBoundsLike = [
									[ bbox.xmin, bbox.ymin ],
									[ bbox.xmax, bbox.ymax ],
								];

								map?.fitBounds(bounds, {
									padding: { top: 25, bottom: 25, left: 450, right: 25 },
									linear: true,
									maxZoom: 7,
								});
							})
							.catch((error: any) => {
								console.log(error);
							});

						this.pwsQuery(state);

						this.activeStateCode = state;

						map?.setFilter('state-fills', [ '!=', 'state_code', state ]);
						map?.setFilter('state-lines', [ '!=', 'state_code', state ]);

					} else {
						map?.panTo(lngLat);
					}
				} else {
					map?.panTo(lngLat);
				}

				this.activeStateId = e.features![ 0 ].id;
				map?.setFeatureState(
					{ source: 'states', id: this.activeStateId },
					{ active: true },
				);

				this.panelData = [
					{
						title: e.features![ 0 ].properties.state_name ?? '',
						reportedLsl: e.features![ 0 ].properties.reported_lsl ?? '',
						serviceConnections: e.features![ 0 ].properties.service_connections_count ?? '',
						estLslRate: e.features![ 0 ].properties.est_lsl_rate ?? '',
						lslLow: e.features![ 0 ].properties.est_lsl_rate_low ?? '',
						lslHigh: e.features![ 0 ].properties.est_lsl_rate_high ?? '',
						iijaFunding: e.features![ 0 ].properties.iija_funding ?? '',
						iijaPerLsl: e.features![ 0 ].properties.iija_per_lsl ?? '',
						stateReplacementProgram: e.features![ 0 ].properties.state_replacement_program ?? '',
						inventoryUrl: e.features![ 0 ].properties.inventory_url ?? '',
						dataType: 'State',
					}
				];

				this.infoCardActive = false;
				this.panelActive = true;

				if (!this.toggleActive) {
					this.toggleActive = true;
				}
			});

			let hoveredId: string | number | undefined = '';

			map?.on('mousemove', 'pws-fill', (e: MapMouseEvent & { features?: string | any[]; lngLat: LngLatLike }) => {
				map!.getCanvas().style.cursor = 'pointer';
				if (e.features!.length > 0) {
					if (hoveredId) {
						map?.setFeatureState(
							{ source: 'pws', id: hoveredId },
							{ hover: false },
						);
					}
					hoveredId = e.features![ 0 ].id;
					map?.setFeatureState(
						{ source: 'pws', id: hoveredId },
						{ hover: true },
					);
					popup
						.setLngLat(e.lngLat)
						.setHTML(`<span>${e.features![ 0 ].properties.pws_name}</span>`)
						.addTo(map!);
				}
			});

			map?.on('mouseleave', 'pws-fill', () => {
				map!.getCanvas().style.cursor = '';
				if (hoveredId) {
					map?.setFeatureState(
						{ source: 'states', id: hoveredId },
						{ hover: false },
					);
				}
				hoveredId = '';
				popup.remove();
			});

			let activePwsId: string | number | undefined = '';

			map?.on('click', 'pws-fill', (e: MapMouseEvent & { features?: string | any[]; lngLat: LngLatLike }) => {

				if (activePwsId) {
					map?.setFeatureState(
						{ source: 'pws', id: activePwsId },
						{ active: false },
					);
				};

				activePwsId = e.features![ 0 ].id;
				map?.setFeatureState(
					{ source: 'pws', id: activePwsId },
					{ active: true },
				);

				this.panelData = [
					{
						title: e.features![ 0 ].properties.pws_name ?? '',
						reportedLsl: e.features![ 0 ].properties.reported_lsl ?? '',
						serviceConnections: e.features![ 0 ].properties.service_connections_count ?? '',
						lslLow: e.features![ 0 ].properties.est_lsl_rate_low ?? '',
						lslHigh: e.features![ 0 ].properties.est_lsl_rate_high ?? '',
						eji: e.features![ 0 ].properties.eji ?? '',
						tier: e.features![ 0 ].properties.tier ?? '',
						state_code: e.features![ 0 ].properties.state_code ?? '',
						dataType: 'PWS',
					}
				];
				this.infoCardActive = false;
				this.panelActive = true;

				if (!this.toggleActive) {
					this.toggleActive = true;
				}

			});

			const initialZoom = this.getInitialZoom();

			map?.on('zoomend', () => {
				this.setZoomBounds(initialZoom);
			});

			map?.on('dragend', () => {
				this.setZoomBounds(initialZoom);
			});

		},

		async mapCreate(): Promise<void> {

			const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;

			map = new maplibregl.Map({
				container: 'map',
				style: mapStyle,
				dragRotate: false,
				center: [ -95.7129, 37.0902 ],
				zoom: this.isMobile() ? 3.5 : 0,
				attributionControl: this.isMobile() ? false : true,
			});

			if (!this.isMobile()) {
				map?.fitBounds([ [ -124.7844079, 24.7433195 ], [ -66.9513812, 49.3457868 ] ], {
					padding: 50,
				});
				map?.addControl(new maplibregl.NavigationControl({
					showCompass: false,
				}));
				map?.addControl(new maplibregl.GeolocateControl({
					positionOptions: {
						enableHighAccuracy: true,
					},
					trackUserLocation: true,
				}));
			}

			map?.on('load', this.configureMap);

			map?.on('error', (e: any) => {
				console.log(e);
			});
		}
	},
});

</script>

<style scoped lang="scss">
.map-container {
	position: absolute;
	width: 100%;
	height: 100%;
}

.map-wrapper {
	position: relative;
	width: 100%;
	height: 100vh;
}

.image-support {
	display: block;
	position: absolute;
	left: 1rem;
	bottom: 1rem;
}
</style>
