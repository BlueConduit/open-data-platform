<template>
	<div class="toggle">
		<button class="button" @click="toggleModal" title="Help" aria-label="Help">
			<span class="icon">
				<img src="@/assets/icons/question.svg">
			</span>
		</button>
	</div>
	<div class="modal" :class="{ 'is-active': isToggled }">
		<div class="modal-background" @click="toggleModal"></div>
		<div class="modal__content">
			<div class="box">
				<h1 class="has-text-blue">Frequently Asked Questions</h1>
				<h2>Where does the data come from?</h2>
				<p>The predictions were created using publicly-available data. The map bounderies were created using the national
					dataset of water system bounderies prepared by the Environmental Policy Innovation Center (EPIC), the Internet
					of Water Coalition, SimpleLab, and many other partners. <a href="#" target="_blank">More information here.</a>
				</p>
				<h2>My water systems's data is incorrect. How can I fix it?</h2>
				<p>Additional information</p>
				<h2>About this map</h2>
				<p>Support for this project comes from Google.org and the Rockefeller Foundation through the BlueConduit
					Charitable Fund.</p>
			</div>
			<button class="modal-close" @click="toggleModal" aria-label="close"></button>
		</div>
	</div>
</template>

<script lang="ts">

export default {
	name: 'HelpModal',
	data() {
		return {
			isToggled: false,
		};
	},
	methods: {
		toggleModal() {
			this.isToggled = !this.isToggled;
		},
	},

};
</script>

<style lang="scss" scoped>
.modal__content {
	position: relative;
	margin: 0 3rem;

	.box {
		display: flex;
		flex-direction: column;
		padding: 2rem;
		min-height: 60vh;
	}
}

.modal-close {
	position: absolute;
	max-width: unset;
	max-height: unset;

	&::before,
	&::after {
		background-color: #000;
	}
}

.modal-background {
	background-color: rgba(22, 78, 135, .2);
}

h1,
h2 {
	margin-top: 0;
}

h2 {
	margin-bottom: 0;
}

.toggle {
	position: absolute;
	top: 5rem;
	right: 10px;
	z-index: 10;

	.button {
		width: 29px;
		height: 29px;
		padding: 0;

		.icon {
			width: .75rem;
			height: .75rem;
		}
	}
}
</style>
