<template>
	<section class="info__panel is-hidden-touch" :class="{ 'is-active': isToggled || toggleActive }" v-if="panelData[ 0 ]!">
		<div class="inner box" v-show="isToggled || toggleActive">
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
				<li v-html="predictedLsl"></li>
				<li v-html="reportedLsl"></li>
				<li>Total Service Lines: <span
						class="has-text-blue has-text-weight-bold">{{ (panelData[ 0 ]?.serviceConnections).toLocaleString() }}</span>
				</li>
			</ul>
			<h2 class="has-text-dark-blue">Percent Lead Service Lines</h2>
			<div class="flex">
				<div class="flex-numeric">
					<span class="has-text-blue">{{ percentLsl }}</span>
					<span class="sup">%</span>
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
						such as superfund sites. <a href="#" target="_blank" rel="noopener">More on how this is calculated.</a>
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
				{{ tier }} service boundary of {{ formattedPwsTitle }}.
			</p>
			<p class="mb-0" v-if="dataType == 'State'">
				States do not have complete or even accurrate service line materials records. In the absence of comprehensive
				records, some have turned to data science to predict unkown service line materials. These state-level lead service
				line totals are the cumulative sums of the water system level predictions within a state. More information on the
				<a href="#" target="_blank" rel="noopener">predictions and underlying data</a>.
			</p>
			<p class="mt-0">
				BlueConduit colleced lead service line data from a combination of state environmental agency websites and Freedom
				of Information Act request data shared by the National Resources Defense Council. We use an open source machine
				learning software program to combine the inventory data with Water Utility Service Area Boundaries and EJ Indices
				and predict how many LSLs are in every water system.
			</p>

			<div class="my-6 has-text-centered">
				<a href="#" class="button is-primary has-text-weight-bold" target="_blank" rel="noopener">Learn more about
					BlueConduit</a>
				<p class="has-text-weight-bold">Have a question about your water system boundary or predictions?
					<a href="#" target="_blank" rel="noopener">Contact
						us.</a>
				</p>
			</div>

		</div>
		<div class="toggle toggle--side">
			<button class="button" @click="togglePanel" :class="{ 'is-active': isToggled || toggleActive }">
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
			isToggled: this.toggleActive,
		};
	},
	props: {
		panelData: {
			type: Object,
			required: true,
		},
		toggleActive: {
			type: Boolean,
			required: true,
		},
	},
	emits: [ "queryResults", "close", "togglePanel" ],
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
				const amount = new Intl.NumberFormat("en-US", {
					style: "decimal",
					maximumFractionDigits: 0,
				}).format(lsl);
				return `Predicted Lead Service Lines: <span class="has-text-blue has-text-weight-bold">${amount}</span>`;
			}
			else {
				return `Predicted Lead Service Lines: <span class="is-italic has-text-warm-grey">We could not make a prediction for this location.</span>`;
			}
		},
		reportedLsl() {
			if (this.panelData[ 0 ]?.reportedLsl) {
				return `Reported Lead Service Lines: <span class="has-text-blue has-text-weight-bold">${this.panelData[ 0 ]?.reportedLsl.toLocaleString()}</span>`;
			}
			else {
				return `Reported Lead Service Lines: <span class="is-italic has-text-warm-grey">No data available</span>`;
			}
		},
		percentLsl() {
			return `${(this.panelData[ 0 ]?.lslLow * 100).toFixed(0)}-${(this.panelData[ 0 ]?.lslHigh * 100).toFixed(0)}`;
		},
		inventoryUrl() {
			if (this.panelData[ 0 ]?.inventoryUrl.length > 2) {
				return `<a href="${this.panelData[ 0 ]?.inventoryUrl}" target="_blank" rel="noopener">Public Facing Inventory</a>`;
			}
			else {
				return false;
			}
		},
		stateProgramUrl() {
			if (this.panelData[ 0 ]?.stateReplacementProgram.length > 2) {
				return `<a href="${this.panelData[ 0 ]?.stateReplacementProgram}" target="_blank" rel="noopener">State Replacement Program</a>`;
			}
			else {
				return false;
			}
		},
		tier() {
			if (this.panelData[ 0 ]?.tier == 1) {
				return "known";
			} else if (this.panelData[ 0 ]?.tier == 2) {
				return "estimated";
			}
		},
	},
	methods: {
		togglePanel() {
			if (this.toggleActive && !this.isToggled) {
				console.log('toggleActive panel click', this.toggleActive);
				console.log('isToggled panel click', this.isToggled);
				this.isToggled = false;
			} else {
				this.isToggled = !this.isToggled;
			}
			this.$emit("togglePanel", this.isToggled);
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

		> span:first-child {
			font-size: 3rem;
		}
	}

	&-content {
		flex-basis: 58%;
	}
}

.info {
	&__panel {
		position: relative;
		width: 0;
		height: 100vh;
		transition: transform 0.3s ease-in-out;
		z-index: 1;

		&.is-active {
			width: 400px;
		}

		.inner {
			height: 100vh;
			overflow-y: scroll;
			border-radius: 0;
			box-shadow: none;
			filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.25));
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

.sup {
	display: inline-block;
	font-size: 1.5rem;
	transform: translateY(-1rem);
}

.toggle {

	&--side {
		position: absolute;
		top: calc(50vh - 1rem);
		right: -1rem;
		left: 0;
		z-index: -1;

		.is-active & {
			left: 100%;
		}

		.button {
			margin-left: -0.375rem;
			padding-right: 0.75rem;
			width: 2rem;
			height: 2rem;

			.icon {
				width: .75rem;
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
