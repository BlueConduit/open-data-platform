<template>
	<section class="info__card">
		<div class="card">
			<h1><span>Click on a state</span> to see lead service line data</h1>
			<p>or</p>
			<GeocodeControl />
			<div class="card__content">
				<p><strong>The goal of the map</strong> is to provide a singular place for</p>
				<ul>
					<li>reported lead service line inventories</li>
					<li>predictions of lead service line counts</li>
				</ul>
				<p>Longer term, our goal is to track progress toward replacing all of the lead.</p>
				<p>This map is based on open source machine learning software that predicts where the X-X million lead service
					lines are the country are located. The map is based on publicly-available data that BlueConduit has collected
					from 9,809 lead service line inventories, across all 50 states and Washington, D.C.</p>
			</div>
		</div>
	</section>
</template>

<script lang="ts">
import GeocodeControl from './GeocodeControl.vue';

export default {
	name: "InfoCard",
	methods: {
		toggle() {
			this.$emit("toggle");
		}
	},
	components: { GeocodeControl }
};
</script>

<style lang="scss" scoped>
.info__card {
	position: absolute;
	top: 10px;
	left: 10px;
	width: 30%;
	z-index: 1;
}

.card {
	padding: 1rem;

	&__content {
		p:first-of-type {
			margin-bottom: 0;
		}
	}
}

ul {
	margin: 0;
}

h1 {
	margin-bottom: 0;
	font-weight: 400;
	line-height: 1.2;

	span {
		font-weight: 700;
	}

	+ p {
		margin-top: 0.5rem;
	}

}
</style>
