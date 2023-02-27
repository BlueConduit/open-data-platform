<template>
	<div class="map-wrapper">
		<div id="map" class="map-container" ref="map"></div>
		<HelpModal />
		<MapLegend />
		<InfoCard v-show="infoCardActive" />
		<MapPanel v-show="panelActive" :panelData="panelData" @close="closeMapPanel" />
	</div>
</template>

<script	lang="ts">
import MapPanel from './MapPanel.vue';
import HelpModal from './HelpModal.vue';
import MapLegend from './MapLegend.vue';
import maplibregl, { GeoJSONSource, MapMouseEvent, type LngLatLike } from 'maplibre-gl';
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
			this.infoCardActive = true;
			this.panelActive = false;
		},

		pwsQuery(state_code: string): void {
			// fetch(PWS_LAYER_PATH + 'query?where=1%3D1&outFields=*&f=pgeojson')
			// 	.then((response) => response.json())
			// 	.then((data) => {
			// 		map?.getSource('pws')?.setData(data);
			// 	});

			// let whereClause = `state_code='${state}'`;

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
			map?.addSource('pws', {
				type: 'geojson',
				data: {
					type: 'FeatureCollection',
					features: [],
				},
			});

			map?.addLayer({
				id: 'pws-fill',
				type: 'fill',
				source: 'pws',
				paint: {
					'fill-color': [
						'interpolate',
						[ 'linear' ],
						[ 'get', 'PRE1960PCT' ],
						0, '#fdecae',
						0.01, '#f9d071',
						0.02, '#f6ad36',
						0.03, '#e58724',
						0.05, '#c0531e',
					],
					'fill-opacity': 0.5,
				},
				// minzoom: 5,
			});

			map?.addLayer({
				id: 'pws-line',
				type: 'line',
				source: 'pws',
				paint: {
					'line-color': '#000',
					'line-width': 1,
				},
				// minzoom: 5,
			});
		},

		configureMap(): void {

			this.addQueryLayer();

			map?.addControl(new maplibregl.NavigationControl({
				showCompass: false,
			}));

			map?.addSource('states', {
				type: 'geojson',
				data: STATE_LAYER_PATH + 'query?where=1%3D1&outFields=*&f=pgeojson',
			});

			map?.addLayer({
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
							0, '#fdecae',
							0.01, '#f9d071',
							0.02, '#f6ad36',
							0.03, '#e58724',
							0.05, '#c0531e',
						]
					],
					'fill-opacity': 0.5,
				},
			});

			map?.addLayer({
				id: 'state-lines',
				type: 'line',
				source: 'states',
				layout: {},
				paint: {
					'line-color': '#000',
					'line-width': 1,
					'line-opacity': [
						'case',
						[ 'boolean', [ 'feature-state', 'hover' ], false ],
						1,
						0,
					],
				},
			});

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

			map?.on('click', 'state-fills', async (e: MapMouseEvent & { features?: string | any[]; lngLat: LngLatLike }) => {

				let state = e.features![ 0 ].properties.state_code;

				if (activeStateId) {
					map?.setFeatureState(
						{ source: 'states', id: activeStateId },
						{ active: false },
					);

					if (activeStateId === e.features![ 0 ].id) {
						map?.flyTo({
							center: e.lngLat,
							zoom: 6,
							speed: 1,
							curve: 1,
							easing: (t: number) => t,
						});

						this.pwsQuery(state);

						map?.setFilter('state-fills', [ '!=', 'state_code', state ]);
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
