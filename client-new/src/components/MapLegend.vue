<template>
	<section class="legend is-hidden-touch">
		<div class="card">
			<img src="@/assets/images/gradient-legend.png" alt="Legend from 0 to 100 percent">
			<div class="heading">Percent Lead Service Lines</div>
			<p class="is-italic">current estimate</p>
			<div class="toggle" :class="{ 'is-active': isToggled }">
				<div class="toggle__heading" @click="toggleContent">
					<span class="icon">
						<img src="@/assets/icons/chevron-right.svg">
					</span>
					<span>{{ heading }}</span>
				</div>
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
import { defineComponent } from 'vue';

export default defineComponent({
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
});
</script>

<style lang="scss" scoped>
.legend {
	position: absolute;
	right: 10px;
	bottom: 2rem;
	width: 360px;
}

.heading {
	margin-top: 0.375rem;
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
		transition: transform 0.3s ease-in-out;

		span:not(.icon) {
			padding-left: .75rem;
		}

		.icon {
			width: 0.625rem;
			height: 0.625rem;

			.is-active & {
				transform: rotate(90deg);
			}
		}
	}

	&__content {
		padding-left: 1.375rem;
		font-size: .875rem;
	}
}
</style>
