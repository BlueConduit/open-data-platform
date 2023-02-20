<template>
	<section class="info__panel" :class="{ active: isToggled }" v-if="panelData[ 0 ]!">
		<div class="inner box" v-if="isToggled">
			<!-- TODO: add search input -->
			<h1>{{ panelData[ 0 ]?.title }}</h1>

			<ul class="info__lines">
				<li>Predicted Lead Service Lines: <span class="has-text-blue has-text-weight-bold"></span></li>
				<li>Reported Lead Service Lines: <span
						class="has-text-blue has-text-weight-bold">{{ (panelData[ 0 ]?.reportedLsl).toLocaleString() }}</span></li>
				<li>Total Service Lines: <span
						class="has-text-blue has-text-weight-bold">{{ (panelData[ 0 ]?.serviceConnections).toLocaleString() }}</span>
				</li>
			</ul>
			<h2 class="has-text-dark-blue">Percent Lead Service Lines</h2>
			<div class="flex">
				<div class="flex-numeric">
					<span class="has-text-blue is-size-2">{{ (panelData[ 0 ]?.lslLow * 100).toFixed(1) }} -
						{{ (panelData[ 0 ]?.lslHigh * 100).toFixed(1) }}</span>
					<span class="sup is-size-3">%</span>
				</div>
				<div class="flex-content">
					This is the estimated percent of service connections in {{ panelData[ 0 ]?.title }} that contain lead.
				</div>
			</div>

			<div class="info__pws" v-if="panelData[ 0 ]?.dataType == 'PWS'">
				<h2 class="has-text-dark-blue">Environmental Justice Index</h2>
				<div class="flex">
					<div class="flex-numeric">
						<span class="has-text-blue is-size-2">{{ (panelData[ 0 ]?.eji).toFixed(1) }}</span><span
							class="sub">/12</span>
					</div>
					<div class="flex-content">
						Higher scores indicate more vulnerable locations, such as lower income or proximity to environmental hazards
						such as superfund sites. <a href="#">More on how this is calculated.</a>
					</div>
				</div>
			</div>

			<div class="info__state" v-if="panelData[ 0 ]?.dataType == 'State'">
				<h2 class="has-text-dark-blue">Regulations, Funding & Impact</h2>
				<ul>
					<li>LSLR Funding from Infrastructure Bill: <span
							class="has-text-weight-bold">{{ (panelData[ 0 ]?.iijaFunding).toLocaleString() }}</span></li>
					<li>Dollars per lead service line: <span
							class="has-text-weight-bold">${{ (panelData[ 0 ]?.iijaPerLsl).toLocaleString() }}</span>
					</li>
					<li v-if="panelData[ 0 ]?.stateReplacementProgram!">
						<a href="#">State Replacement Program</a>
					</li>
					<li>
						<a href="#">Public Facing Inventory</a>
					</li>
				</ul>
			</div>

			<h2 class="has-text-dark-blue">More Information</h2>
			<p class="mb-0" v-if="panelData[ 0 ]?.dataType == 'PWS'">Utilities do not have complete or even accurate service
				line materials
				records. In the absence of comprehensive
				records, some have turned to data science to predict unknown service line materials. The lead service line
				predictions are made by BlueConduit's model based on reported inventories as well as the demographics within the
				[estimated/known] service boundary of {{ panelData[ 0 ]?.title }}.
			</p>
			<p class="mb-0" v-if="panelData[ 0 ]?.dataType == 'State'">
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
				<a href="#" class="button is-primary has-text-weight-bold">Learn more about BlueConduit</a>
				<p class="has-text-weight-bold">Have a question about your water system boundary or predictions?
					<a href="#">Contact
						us.</a>
				</p>
			</div>

		</div>
		<!-- Add toggle functionality -->
		<div class="toggle">
			<button class="button" @click="togglePanel">
				<span class="icon">
					<img src="@/assets/icons/chevron-left.svg">
				</span>
			</button>
		</div>
	</section>
</template>

<script lang="ts">
export default {
	name: 'MapPanel',
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
	methods: {
		togglePanel() {
			this.isToggled = !this.isToggled;
		},
	},
};
</script>

<style lang="scss">
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
		overflow: scroll;
		transform: translate(-96%, 0);
		transition: transform 0.3s ease-in-out;
		z-index: 1;

		&.active {
			transform: translateX(0);
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
	text-decoration: underline !important;
}

.toggle {
	position: absolute;
	top: calc(50vh - 1rem);
	right: -1rem;
	z-index: 2;

	.button {
		width: 2rem;
		height: 2rem;
	}
}
</style>
