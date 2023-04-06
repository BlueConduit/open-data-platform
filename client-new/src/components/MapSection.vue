<template>
	<div class="map-wrapper">
		<div id="map" class="map-container" ref="map"></div>
		<HelpModal />
		<MapLegend />
		<InfoCard v-show="infoCardActive" @queryResults="searchQuery" />
		<MapPanel v-show="panelActive" :panelData="panelData" :toggleActive="toggleActive" @close="closeMapPanel"
			@queryResults="searchQuery" @togglePanel="setToggleState" />
		<img src="@/assets/images/google.logo.png" class="image-support" alt="Supported by Google.com">
	</div>
</template>

<script	lang="ts">
import MapPanel from './MapPanel.vue';
import HelpModal from './HelpModal.vue';
import MapLegend from './MapLegend.vue';
import maplibregl, { GeoJSONSource, LngLatBounds, MapMouseEvent, type LngLatLike } from 'maplibre-gl';
import type { Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import 'maplibre-gl/dist/maplibre-gl.css';
import { queryFeatures } from '@esri/arcgis-rest-feature-service';
import { defineComponent, ref, type Prop } from 'vue';
import InfoCard from './InfoCard.vue';

const apiKey = "AAPK11d5429da31346419f8c1f632a62e3b6FS92k0O7YmRmdBscOOcYMe1f5Ea8kkxzLbxO9aZWtDCL6FtHAtHKeBup3Bj0aCS_";
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
		InfoCard
	},

	data: () => {
		return {
			map: maplibregl.Map,
			panelData: {},
			infoCardActive: true,
			panelActive: false,
			toggleActive: true,
			pwsLayerActive: false,
			activeStateCode: null,
		}
	},

	mounted() {
		if (map == null) this.mapCreate();
	},

	methods: {

		getInitialZoom(): number {
			return map?.getZoom();
		},

		closeMapPanel(): void {
			this.panelActive = false;
			this.infoCardActive = true;
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

		boundsQuery(bounds: LngLatBounds): void {
			const envelope = {
				xmin: bounds.getWest(),
				ymin: bounds.getSouth(),
				xmax: bounds.getEast(),
				ymax: bounds.getNorth(),
				spatialReference: {
					wkid: 4326
				}
			};

			queryFeatures({
				url: PWS_LAYER_PATH,
				geometry: envelope,
				geometryType: 'esriGeometryEnvelope',
				outFields: [ '*' ],
				f: 'geojson',
			})
				.then((response: any) => {
					const exceededTransferLimit = response.properties?.exceededTransferLimit ?? false;
					if (exceededTransferLimit) {
						console.log('exceededTransferLimit');
					}

					(map?.getSource('pws') as GeoJSONSource)?.setData(response);
				});
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

			// const whereClause = `state_code = '${state_code}'`;

			// this.queryAllFeatures(PWS_LAYER_PATH, whereClause)
			// 	.then((features: Feature<Geometry, GeoJsonProperties>[]) => {
			// 		console.log(`Total features found: ${features.length}`);
			// 		// Do something with the features...
			// 		(map?.getSource('pws') as GeoJSONSource)?.setData({
			// 			type: 'FeatureCollection',
			// 			features: features
			// 		});
			// 	})
			// 	.catch((error) => {
			// 		console.error(error);
			// 	});




			// let features: Feature[] = [];

			// while (true) {
			// 	const response = await queryFeatures({
			// 		url: PWS_LAYER_PATH,
			// 		where: `state_code = '${state_code}'`,
			// 		outFields: [ '*' ],
			// 		f: 'geojson',
			// 		resultOffset: offset,
			// 		resultRecordCount: maxFeatures,
			// 	}) as IQueryFeaturesResponse;

			// 	console.log(response);

			// 	features = features.concat(response.features);

			// 	console.log('length', response.features.length, 'state', state_code, 'offset', offset);

			// 	if (response.features.length < maxFeatures) {
			// 		break;
			// 	}

			// 	offset += maxFeatures;
			// }

			// const geoJsonFeatures: FeatureCollection<Geometry, GeoJsonProperties> = {
			// 	type: 'FeatureCollection',
			// 	features: features
			// };

			// (map?.getSource('pws') as GeoJSONSource).setData(geoJsonFeatures);


			queryFeatures({
				url: PWS_LAYER_PATH,
				where: `state_code = '${state_code}'`,
				outFields: [ '*' ],
				f: 'geojson',
			})
				.then((response: any) => {
					const exceededTransferLimit = response.properties?.exceededTransferLimit ?? false;

					// console.log('excceededTransferLimit', exceededTransferLimit);

					(map?.getSource('pws') as GeoJSONSource)?.setData(response);
				});
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

			map?.addControl(new maplibregl.NavigationControl({
				showCompass: false,
			}));

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
			let clickCount = 0;

			map?.on('click', 'state-fills', async (e: MapMouseEvent & { features?: string | any[]; lngLat: LngLatLike; }) => {

				let state = e.features![ 0 ].properties.state_code;
				let lngLat = e.lngLat;

				clickCount++;

				if (activeStateId) {
					map?.setFeatureState(
						{ source: 'states', id: activeStateId },
						{ active: false },
					);

					if (activeStateId === e.features![ 0 ].id && clickCount === 2) {
						map?.flyTo({
							center: e.lngLat,
							zoom: 5.5,
							speed: 1,
							curve: 1,
							easing: (t: number) => t,
						});

						this.pwsQuery(state);

						this.activeStateCode = state;

						map?.setFilter('state-fills', [ '!=', 'state_code', state ]);

					} else {
						map?.panTo(lngLat);
					}
				} else {
					map?.panTo(lngLat);
				}

				activeStateId = e.features![ 0 ].id;
				map?.setFeatureState(
					{ source: 'states', id: activeStateId },
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

				setTimeout(() => {
					if (clickCount > 0) {
						clickCount = 0;
					}
				}, 500);
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
			// TODO: refactor this to be more DRY
			map?.on('zoomend', () => {
				let currentZoom = map?.getZoom();
				let zoomDifference = currentZoom! - initialZoom;
				this.setPwsLayerState(false);

				if (currentZoom && zoomDifference >= 3) {
					let currentBounds = map?.getBounds();
					this.boundsQuery(currentBounds);
					this.setPwsLayerState(true);
				} else if (this.activeStateCode) {
					this.setPwsLayerState(true);
					this.pwsQuery(this.activeStateCode);
				}

			});

			map?.on('dragend', () => {
				let currentZoom = map?.getZoom();
				let zoomDifference = currentZoom! - initialZoom;

				this.setPwsLayerState(false);

				if (currentZoom && zoomDifference >= 3) {
					let currentBounds = map?.getBounds();
					this.boundsQuery(currentBounds);
					this.setPwsLayerState(true);
				} else if (this.activeStateCode) {
					this.setPwsLayerState(true);
					this.pwsQuery(this.activeStateCode);
				}
			});

		},

		async mapCreate(): Promise<void> {

			map = new maplibregl.Map({
				container: 'map',
				style: mapStyle,
				dragRotate: false,
				doubleClickZoom: false,
				bounds: [ [ -124.7844079, 24.7433195 ], [ -66.9513812, 49.3457868 ] ],
				fitBoundsOptions: {
					padding: 50,
				},
			});

			map?.on('load', this.configureMap);

			map?.on('error', (e: any) => {
				console.log(e);
			});
		}
	},
});

</script>

<style scoped>
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
