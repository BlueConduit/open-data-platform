<template>
	<div class="loading">
		<div class="loading__inner">
			<img src="@/assets/images/pulse.gif" alt="Loading..." />
		</div>
	</div>
</template>

<style lang="scss" scoped>
.loading {
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
	z-index: 1;
}
</style>
