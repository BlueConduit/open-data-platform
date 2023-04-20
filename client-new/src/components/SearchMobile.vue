<template>
	<section class="search__container">
		<div class="inner">
			<GeocodeControl />
		</div>
	</section>
</template>

<script lang="ts">
import GeocodeControl from './GeocodeControl.vue';

export default {
	name: "SearchMobile",
	emits: [ "queryResults" ],
	components: { GeocodeControl },
};
</script>

<style lang="scss" scoped>
.inner {
	padding: 0.75rem;
	background-color: #fff;
}

.search {
	margin-bottom: 0;

	&__container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 10;
	}
}
</style>
