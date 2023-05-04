<template>
	<section class="search__container">
		<div class="inner">
			<GeocodeControl />
			<div class="toggle" v-if="!infoCardActive">
				<button class="button" @click="close" title="Close Panel" aria-label="Close panel">
					<span class="icon">
						<img src="@/assets/icons/xmark.svg">
					</span>
				</button>
			</div>
		</div>
	</section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import GeocodeControl from './GeocodeControl.vue';

export default defineComponent({
	name: "SearchMobile",
	props: {
		infoCardActive: {
			type: Boolean,
			required: true,
		}
	},
	emits: [ "queryResults", "close" ],
	components: { GeocodeControl },
	methods: {
		close() {
			this.$emit("close");
		}
	},
});
</script>

<style lang="scss" scoped>
.inner {
	padding: 0.75rem;
	background-color: #fff;
}

.search {
	margin-bottom: 0;

	&__container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		box-shadow: 0 4px 4px rgba(70, 70, 70, .25);
		z-index: 10;
	}
}

.inner {
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

.toggle {
	.button {
		.icon {
			width: 0.75rem;
			height: 0.75rem;
		}
	}
}
</style>
