<template>
	<section class="info__panel" :class="{ 'is-active': isToggled }" v-if="panelData[ 0 ]!">
		<div class="inner box" v-show="isToggled">
			<div class="search__form">
				<GeocodeControl />
				<div class="toggle toggle--top">
					<button class="button" @click="close">
						<span class="icon">
							<img src="@/assets/icons/xmark.svg">
						</span>
					</button>
				</div>
			</div>

			<h1>{{ panelTitle }}</h1>

			<ul class="info__lines">
				<li>Predicted Lead Service Lines: <span class="has-text-blue has-text-weight-bold">{{ predictedLsl }}</span></li>
				<li>Reported Lead Service Lines: <span class="has-text-blue has-text-weight-bold">{{ reportedLsl }}</span></li>
				<li>Total Service Lines: <span
						class="has-text-blue has-text-weight-bold">{{ (panelData[ 0 ]?.serviceConnections).toLocaleString() }}</span>
				</li>
			</ul>
			<h2 class="has-text-dark-blue">Percent Lead Service Lines</h2>
			<div class="flex">
				<div class="flex-numeric">
					<span class="has-text-blue is-size-2">{{ percentLsl }}</span>
					<span class="sup is-size-3">%</span>
				</div>
				<div class="flex-content">
					This is the estimated percent of service connections in {{ panelTitle }} that contain lead.
				</div>
			</div>

			<div class="info__pws" v-if="dataType == 'PWS'">
				<h2 class="has-text-dark-blue">Environmental Justice Index</h2>
				<div class="flex">
					<div class="flex-numeric">
						<span class="has-text-blue is-size-2">{{ (panelData[ 0 ]?.eji).toFixed(1) }}</span><span
							class="sub">/12</span>
					</div>
					<div class="flex-content">
						Higher scores indicate more vulnerable locations, such as lower income or proximity to environmental hazards
						such as superfund sites. <a href="#" target="_blank">More on how this is calculated.</a>
					</div>
				</div>
			</div>

			<div class="info__state" v-if="dataType == 'State'">
				<h2 class="has-text-dark-blue">Regulations, Funding & Impact</h2>
				<ul>
					<li>LSLR Funding from Infrastructure Bill: <span
							class="has-text-weight-bold">{{ currencyFormat(panelData[ 0 ]?.iijaFunding) }} million</span>
					</li>
					<li>Dollars per lead service line: <span
							class="has-text-weight-bold">{{ currencyFormat(panelData[ 0 ]?.iijaPerLsl) }}</span>
					</li>
					<li v-if="stateProgramUrl" v-html="stateProgramUrl"></li>
					<li v-if="inventoryUrl" v-html="inventoryUrl"></li>
				</ul>
			</div>

			<h2 class="has-text-dark-blue">More Information</h2>
			<p class="mb-0" v-if="dataType == 'PWS'">Utilities do not have complete or even accurate service
				line materials
				records. In the absence of comprehensive
				records, some have turned to data science to predict unknown service line materials. The lead service line
				predictions are made by BlueConduit's model based on reported inventories as well as the demographics within the
				[estimated/known] service boundary of {{ formattedPwsTitle }}.
				<!-- TODO: replace estimated/known based on tier data -->
			</p>
			<p class="mb-0" v-if="dataType == 'State'">
				States do not have complete or even accurrate service line materials records. In the absence of comprehensive
				records, some have turned to data science to predict unkown service line materials. These state-level lead service
				line totals are the cumulative sums of the water system level predictions within a state.
			</p>
			<p class="mt-0">
				BlueConduit colleced lead service line data from a combination of state environmental agency websites and Freedom
				of Information Act request data shared by the National Resources Defense Council. We use an open source machine
				learning software program to combine the inventory data with Water Utility Service Area Boundaries and EJ Indices
				and predict how many LSLs are in every water system.
			</p>

			<div class="my-6 has-text-centered">
				<a href="#" class="button is-primary has-text-weight-bold" target="_blank">Learn more about BlueConduit</a>
				<p class="has-text-weight-bold">Have a question about your water system boundary or predictions?
					<a href="#" target="_blank">Contact
						us.</a>
				</p>
			</div>

		</div>
		<div class="toggle toggle--side">
			<button class="button" @click="togglePanel" :class="{ 'is-active': isToggled }">
				<span class="icon">
					<img src="@/assets/icons/chevron-left.svg">
				</span>
			</button>
		</div>
	</section>
</template>

<script lang="ts">
import GeocodeControl from './GeocodeControl.vue';

export default {
	name: "MapPanel",
	data() {
		return {
			isToggled: true,
		};
	},
	props: {
		panelData: {
			type: Object,
			required: true,
		},
	},
	computed: {
		dataType() {
			return this.panelData[ 0 ]?.dataType;
		},
		panelTitle() {
			if (this.dataType == "PWS") {
				return `${this.formattedPwsTitle}, ${this.panelData[ 0 ]?.state_code}`;
			}
			else {
				return this.panelData[ 0 ]?.title;
			}
		},
		formattedPwsTitle() {
			return this.panelData[ 0 ]?.title.replace(/\w\S*/g, (txt: string) => {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		},
		predictedLsl() {
			const lsl = this.panelData[ 0 ]?.estLslRate * this.panelData[ 0 ]?.serviceConnections;
			if (lsl) {
				return new Intl.NumberFormat("en-US", {
					style: "decimal",
					maximumFractionDigits: 0,
				}).format(lsl);
			}
			else {
				return "We could not make a prediction for this location.";
			}
		},
		reportedLsl() {
			if (this.panelData[ 0 ]?.reportedLsl) {
				return this.panelData[ 0 ]?.reportedLsl.toLocaleString();
			}
			else {
				return "No data available";
			}
		},
		percentLsl() {
			return `${(this.panelData[ 0 ]?.lslLow * 100).toFixed(1)} -
						${(this.panelData[ 0 ]?.lslHigh * 100).toFixed(1)}`;
		},
		inventoryUrl() {
			if (this.panelData[ 0 ]?.inventoryUrl.length > 2) {
				return `<a href="${this.panelData[ 0 ]?.inventoryUrl}" target="_blank">Public Facing Inventory</a>`;
			}
			else {
				return false;
			}
		},
		stateProgramUrl() {
			if (this.panelData[ 0 ]?.stateReplacementProgram.length > 2) {
				return `<a href="${this.panelData[ 0 ]?.stateReplacementProgram}" target="_blank">State Replacement Program</a>`;
			}
			else {
				return false;
			}
		}
	},
	methods: {
		togglePanel() {
			this.isToggled = !this.isToggled;
		},
		close() {
			this.$emit("close");
		},
		currencyFormat(amount: number): any {
			const formatter = new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
				maximumFractionDigits: 0,
			});
			return formatter.format(amount);
		},
	},
	components: { GeocodeControl }
};
</script>

<style lang="scss" scoped>
.flex {
	display: flex;
	align-items: center;
	gap: 1rem;

	&-numeric {
		flex: 1;
	}

	&-content {
		flex: 3;
	}
}

.info {
	&__panel {
		position: relative;
		width: 30%;
		height: 100vh;
		transition: transform 0.3s ease-in-out;
		z-index: 1;

		.inner {
			height: 100vh;
			overflow-y: scroll;
		}
	}
}

h1 {
	padding-bottom: 0.5rem;
	border-bottom: 1px solid #d3d3d3;
}

ul {
	margin: 0;
	padding: 0;
	list-style: none;
}

a:not(.button) {
	box-shadow: inset 0 -1px 0 var(--bc--link-color);

	&:hover {
		box-shadow: inset 0 -1px 0 var(--bc--link-hover-color);
	}
}

.toggle {

	&--side {
		position: absolute;
		top: calc(50vh - 1rem);
		right: -1rem;
		left: 0;
		z-index: 2;

		.is-active & {
			left: 100%;
		}

		.button {
			width: 2rem;
			height: 2rem;

			.icon {
				width: 1rem;
				height: 1rem;
				transition: transform 0.3s ease-in-out;

			}

			&.is-active {
				border-color: #d3d3d3;
			}

			&:not(.is-active) {
				.icon {
					transform: rotate(180deg);
				}
			}
		}
	}
}

.toggle--top {
	.button {
		.icon {
			width: .75rem;
			height: .75rem;
		}
	}
}

.search__form {
	display: flex;

	.input,
	.button {
		border-color: transparent;
	}

	.search {
		flex: 1;
		margin: 0;
	}
}
</style>
