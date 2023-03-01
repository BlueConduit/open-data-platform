<template>
	<div class="map-wrapper">
		<div id="map" class="map-container" ref="map"></div>
		<HelpModal />
		<MapLegend />
		<InfoCard v-show="infoCardActive" @queryResults="searchQuery" />
		<MapPanel v-show="panelActive" :panelData="panelData" @close="closeMapPanel" @queryResults="searchQuery" />
	</div>
</template>

<script	lang="ts">
import MapPanel from './MapPanel.vue';
import HelpModal from './HelpModal.vue';
import MapLegend from './MapLegend.vue';
import maplibregl, { GeoJSONSource, LngLatBounds, MapMouseEvent, type LngLatLike } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { queryFeatures } from '@esri/arcgis-rest-feature-service';
import { defineComponent, ref } from 'vue';
import InfoCard from './InfoCard.vue';

const apiKey = "AAPK11d5429da31346419f8c1f632a62e3b6FS92k0O7YmRmdBscOOcYMe1f5Ea8kkxzLbxO9aZWtDCL6FtHAtHKeBup3Bj0aCS_";
const basemapEnum = "OSM:Standard";
const mapStyle = `https://basemaps-api.arcgis.com/arcgis/rest/services/styles/${basemapEnum}?type=style&token=${apiKey}`;
const PWS_LAYER_PATH = "https://services6.arcgis.com/hR19wnqEg78ptZn4/arcgis/rest/services/View_of_Leadout_PWS_Predictions/FeatureServer/1/";
const STATE_LAYER_PATH = "https://services6.arcgis.com/hR19wnqEg78ptZn4/arcgis/rest/services/View_of_LeadOut_State-level_Predictions/FeatureServer/0/";
let map: maplibregl.Map;

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
		}
	},

	mounted() {
		if (map == null) this.mapCreate();
	},

	methods: {

		closeMapPanel(): void {
			this.panelActive = false;
			this.infoCardActive = true;
		},

		toggleMapPanel(): void {

		},

		searchQuery(data: any): void {
			// const lngLat = data.lngLat;
			const stateCode = data.stateAbbr;
			// const locationType = data.locationType;
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
				});

			map?.fitBounds(bounds, {
				padding: 25,
				linear: true,
				maxZoom: 8,
			});

			this.pwsQuery(stateCode);
			map?.setFilter('state-fills', [ '!=', 'state_code', stateCode ]);

		},

		pwsQuery(state_code: string): void {

			queryFeatures({
				url: PWS_LAYER_PATH,
				where: `state_code = '${state_code}'`,
				outFields: [ '*' ],
				f: 'geojson',
			})
				.then((response: any) => {
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
							[ 'get', 'PRE1960PCT' ],
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
					// minzoom: 5,
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
					layout: {},
					paint: {
						'fill-color': [
							'let',
							'ratio',
							[ '/', [ 'get', 'reported_lsl' ], [ 'get', 'service_connections_count' ] ],
							[
								'interpolate',
								[ 'linear' ],
								[ 'var', 'ratio' ],
								0, '#ffedb3',
								0.02, '#ffd74f',
								0.04, '#ffa200',
								0.06, '#ff6e4a',
								0.08, '#d9401f',
								0.1, '#bf3417',
							]
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
						'line-width': 1,
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

				if (activeStateId) {
					map?.setFeatureState(
						{ source: 'states', id: activeStateId },
						{ active: false },
					);

					// TODO: Change this to fitBounds, get bounds from state layer
					if (activeStateId === e.features![ 0 ].id) {
						console.log(lngLat)
						map?.flyTo({
							center: e.lngLat,
							zoom: 6,
							speed: 1,
							curve: 1,
							easing: (t: number) => t,
						});

						this.pwsQuery(state);

						map?.setFilter('state-fills', [ '!=', 'state_code', state ]);
					} else {
						map?.panTo(lngLat);
					}
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
						state_code: e.features![ 0 ].properties.state_code ?? '',
						dataType: 'PWS',
					}
				];
				this.infoCardActive = false;
				this.panelActive = true;

			});

		},

		async mapCreate(): Promise<void> {
			// TODO: Use fitBounds to show all states on load regardless of screen size - will need the bounds of the continental US

			map = new maplibregl.Map({
				container: 'map',
				style: mapStyle,
				center: [ -98.5556199, 39.8097343 ],
				zoom: 4,
				dragRotate: false,
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
</style>
