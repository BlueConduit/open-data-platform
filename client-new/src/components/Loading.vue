<template>
	<div class="loading">
		<div class="loading__inner">
			<svg width="130" height="120">
				<rect width="30" height="66" x="0" y="15" fill="#5CA3EA">
				</rect>
				<rect width="30" height="66" x="50" y="15" fill="#0B2553">
				</rect>
				<rect width="30" height="66" x="100" y="15" fill="#EFF6FD">
				</rect>
			</svg>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	name: "Loading",
});
</script>

<style lang="scss" scoped>
.loading {
	position: fixed;
	display: flex;
	align-items: center;
	top: 0;
	left: calc(50% - 65px);
	width: 130px;
	height: 100%;
	z-index: 1;
}

rect {
	transform-origin: center;
	animation: grow 1s ease-out infinite;

	&:nth-child(2) {
		animation-delay: 0.1s;
	}

	&:nth-child(3) {
		animation-delay: 0.2s;
	}

}

@keyframes grow {
	0% {
		transform: scaleY(1);
	}

	33.3% {
		transform: scaleY(1.5);
	}

	66.6% {
		transform: scaleY(1);
	}

	100% {
		transform: scaleY(1);
	}

}
</style>
