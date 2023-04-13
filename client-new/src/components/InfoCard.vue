<template>
	<section class="info__card" :class="{ 'lower-active': !isActive }">
		<div class="card card__main" :class="{ 'is-active': isActive }">
			<div class="is-hidden-touch">
				<h1><span>Click on a state</span> to see lead service line data</h1>
				<p>or</p>
				<GeocodeControl />
			</div>
			<h1 class="is-hidden-desktop">Welcome to the lead service line data map</h1>
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
				<div class="card__footer is-hidden-desktop">
					<button class="button is-primary" @click="close" title="Go to the Map">Go to the Map</button>
				</div>
			</div>
		</div>
		<div class="card card__lower" :class="{ 'is-active': !isActive }">
			<h1><span>Tap on a state</span> to see lead service line data</h1>
		</div>
	</section>
</template>

<script lang="ts">
import GeocodeControl from './GeocodeControl.vue';

export default {
	name: "InfoCard",
	emits: [ "queryResults" ],
	components: { GeocodeControl },
	data() {
		return {
			isActive: true,
		}
	},
	methods: {
		close() {
			this.isActive = false;
		}
	}
};
</script>

<style lang="scss" scoped>
@use '@/assets/styles/main.scss' as u;

.info__card {
	position: absolute;
	z-index: 15;

	@include u.touch {
		&.lower-active {
			bottom: 0;
		}
	}

	@include u.desktop {
		top: 10px;
		left: 10px;
		width: 400px;
		z-index: 1;
	}
}

.card {
	padding: 1rem;

	&__main {

		@include u.touch {
			padding: 2rem;
			height: 95vh;
			background-image: url('@/assets/images/background-mobile.png');
			background-size: cover;
			background-position: center;
			background-repeat: no-repeat;
			border-radius: 0;

			&:not(.is-active) {
				display: none;
			}
		}

		&,
		strong {
			@include u.touch {
				color: #fff;
			}
		}

		&__content {
			h1 {
				margin-bottom: 0;

				@include u.touch {
					font-size: 2.5rem;
					font-weight: 500;
					color: #fff;
				}
			}

			p {
				&:first-of-type {
					margin-bottom: 0;
				}
			}
		}

	}

	&__footer {
		display: flex;
		justify-content: center;
		margin: 2.5rem 0 1rem;
	}

	&__lower {

		border-radius: 10px 10px 0 0;

		&:not(.is-active) {
			display: none;
		}
	}

}

ul {
	margin: 0;
}

h1 {
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
