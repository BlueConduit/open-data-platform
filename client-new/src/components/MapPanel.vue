<template>
	<section class="info__panel" :class="{ 'is-active': isToggled || toggleActive }" v-if="panelData[ 0 ]!">
		<div class="inner box" :class="{ 'is-expanded': isExpanded }" v-show="isToggled || toggleActive">
			<div class="search__form is-hidden-touch">
				<GeocodeControl />
				<div class="toggle toggle--top">
					<button class="button" @click="close" title="Close Panel" aria-label="Close panel">
						<span class="icon">
							<img src="@/assets/icons/xmark.svg">
						</span>
					</button>
				</div>
			</div>

			<h1 :class="{ 'is-expanded': isExpanded }" @click="expandMobile">{{ panelTitle }}</h1>

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

			<div class="info__lower my-6 has-text-centered">
				<div class="button__group is-hidden-touch">
					<a href="#" class="button is-secondary" target="_blank" rel="noopener">See Address-Level Map</a>
					<a href="#" class="button is-primary" target="_blank" rel="noopener">Learn more about
						BlueConduit</a>
				</div>
				<p class="has-text-weight-bold">Have a question about your water system boundary or predictions?
					<a href="#" target="_blank" rel="noopener">Contact
						us.</a>
				</p>
			</div>
		</div>
		<div class="button__group button--lower is-hidden-desktop" :class="{ 'is-expanded': isExpanded }">
			<a href="#" class="button is-secondary is-outline" target="_blank" rel="noopener">See Address-Level Map</a>
			<a href="#" class="button is-outline" target="_blank" rel="noopener">About BlueConduit</a>
			<button class="button is-outline" title="Help" aria-label="Help">
				FAQs
			</button>
		</div>
		<div class="toggle toggle--side	is-hidden-touch">
			<button class="button" @click="togglePanel" :class="{ 'is-active': isToggled || toggleActive }" :title="toggleTitle"
				aria-label="Toggle Panel">
				<span class="icon">
					<img src="@/assets/icons/chevron-left.svg">
				</span>
			</button>
		</div>
	</section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import GeocodeControl from './GeocodeControl.vue';

export default defineComponent({
	name: "MapPanel",
	data() {
		return {
			isToggled: this.toggleActive,
			toggleTitle: "Collapse Panel",
			isExpanded: false,
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
		isMobile: {
			type: Boolean,
			required: true,
		},
	},
	components: { GeocodeControl },
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
			const lslLow = this.panelData[ 0 ]?.lslLow * 100;
			const lslHigh = this.panelData[ 0 ]?.lslHigh * 100;

			let lslRange = `${lslLow.toFixed(0)}-${lslHigh.toFixed(0)}`;

			// If the lslLow and lslHigh are the same, don't display a range
			if (lslLow.toFixed(0) == lslHigh.toFixed(0)) {
				lslRange = lslLow.toFixed(0);
			}

			return lslRange;
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
				this.isToggled = false;
			} else {
				this.isToggled = !this.isToggled;
			}

			this.toggleTitle = this.isToggled ? "Collapse Panel" : "Expand Panel";

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
		expandMobile() {
			if (this.isMobile) {
				this.isExpanded = !this.isExpanded;
			}
		}
	},
});
</script>

<style lang="scss" scoped>
@use '@/assets/styles/main.scss' as u;

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

		@include u.touch {
			height: auto;
		}

		&.is-active {
			width: 400px;

			@include u.touch {
				width: 100vw;
			}
		}

		.inner {
			height: 100vh;
			overflow-y: scroll;
			border-radius: 0;
			box-shadow: none;
			filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.25));

			@include u.touch {
				position: absolute;
				top: 76vh;
				left: 0;
				border-radius: 24px 24px 0 0;

				&.is-expanded {
					top: 3rem;
					bottom: 0;
				}
			}
		}
	}

	&__lower {
		> * {
			@include u.block(1rem);
		}

		p {
			margin-top: 0;
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

			@include u.tooltip('right');

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

.button {
	&__group:not(.button--lower) {
		> * {
			@include u.block(1rem);
		}
	}

	&--lower {
		position: fixed;
		bottom: 0;
		left: 0;
		display: none;
		gap: 6px;
		padding: 10px;
		width: 100%;
		background: #fff;
		border-top: 1px solid #f6f6f6;
		box-shadow: 0 -2px 3px rgba(0, 0, 0, 0.1);

		&.is-expanded {
			display: flex;
		}
	}
}
</style>
