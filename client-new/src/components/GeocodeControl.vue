<template>
	<div class="search">
		<div class="geocode-container field has-addons">
			<div class="control is-expanded">
				<input id="geocode-input" class="input" type="text" placeholder="Search a location" v-model="searchQuery" />
			</div>
			<div class="control">
				<button id="geocode-button" class="button">
					<span class="icon">
						<img src="@/assets/icons/magnifying-glass.svg">
					</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { geocode } from '@esri/arcgis-rest-geocoding';
import { ApiKeyManager } from '@esri/arcgis-rest-request';
const apiKey = "AAPK11d5429da31346419f8c1f632a62e3b6FS92k0O7YmRmdBscOOcYMe1f5Ea8kkxzLbxO9aZWtDCL6FtHAtHKeBup3Bj0aCS_";
const authentication = ApiKeyManager.fromKey(apiKey);
export default {
	name: 'GeocodeControl',
	data() {
		return {
			searchQuery: ''
		}
	},
	methods: {
		search() {
			geocode({
				// outfields: this.searchQuery,
				authentication,
				params: {
					outFields: [ '*' ],
					f: 'geojson'
				}
			})
				.then((response) => {
					console.log(response);
				})
				.catch((error) => {
					console.log(error);
				});
		}
	}

}

</script>

<style lang="scss" scoped>
.search {
	display: flex;
	margin-bottom: 2rem;
}

.field {
	flex-grow: 1;
}

.button {
	border-left-color: transparent;

	.icon {
		width: 1rem;
		height: 1rem;
	}
}
</style>
