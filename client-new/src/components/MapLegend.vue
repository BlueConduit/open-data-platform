<template>
	<section class="legend">
		<div class="card">
			<img src="@/assets/images/gradient-legend.png" alt="Legend from 0 to 100 percent">
			<div class="heading">Percent Lead Service Lines</div>
			<p class="is-italic">current estimate</p>
			<div class="toggle">
				<div class="toggle__heading" @click="toggleContent">{{ heading }}</div>
				<div class="toggle__content" v-show="isToggled">
					This metric is the percentage of water service connections estimated to contain lead. BlueConduit estimates
					the number of lead services lines in each water system based on reported inventories from around the country
					as well as the demographics within the <a href="#" target="_blank">known or estimated service area boundary</a>
					of the
					utility.
				</div>
			</div>
		</div>
	</section>
</template>
<script lang="ts">

export default {
	name: 'MapLegend',
	data() {
		return {
			isToggled: false,
			heading: 'More Information',
		};
	},
	methods: {
		toggleContent() {
			this.isToggled = !this.isToggled;

			if (this.isToggled) {
				this.heading = 'Less Information';
			} else {
				this.heading = 'More Information';
			}
			return this.heading;
		},
	},
};
</script>
<style lang="scss" scoped>
.legend {
	position: absolute;
	right: 10px;
	bottom: 2rem;
	width: 360px;
}

.heading {
	margin-bottom: 0;
	font-size: 1.25rem;
	font-weight: 700;
	text-transform: none;
}

p {
	margin-top: 0;
}

.card {
	padding: 1rem;
}

.toggle {
	&__heading {
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;

	}

	&__content {
		font-weight: 1rem;
	}
}
</style>
