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
				<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
					magna aliqua. Ac tortor dignissim convallis aenean et tortor. Maecenas volutpat blandit aliquam etiam erat velit
					scelerisque in.</p>
				<h2>About this map</h2>
				<p>Support for this project comes from Google.org and the Rockefeller Foundation through the BlueConduit
					Charitable Fund.</p>
			</div>
			<button class="modal-close" @click="toggleModal" aria-label="close"></button>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
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

});
</script>

<style lang="scss" scoped>
@use '@/assets/styles/main.scss' as u;

.modal__content {
	position: relative;

	@include u.touch {
		overflow-y: scroll;
	}

	@include u.desktop {
		margin: 0 3rem;
		max-width: 1180px;
	}

	.box {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 1.25rem;
		min-height: 100vh;

		> *:not(h2) {
			@include u.block(1.5rem);
		}

		@include u.desktop {
			min-height: 60vh;
			padding: 2rem;
		}
	}
}

.modal-close {
	position: absolute;
	max-width: unset;
	max-height: unset;

	@include u.touch {
		top: 10px;
		right: 10px;
	}

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

h1 {
	@include u.touch {
		max-width: 70%;
		font-size: 1.5rem;
	}
}

h2 {
	margin-bottom: 0;
	font-size: 1.25rem;
}

p {
	margin-top: 0;
}

.toggle {
	position: absolute;
	right: 10px;
	z-index: 10;

	@include u.touch {
		bottom: 10px;
	}

	@include u.desktop {
		top: 5rem;
	}

	.button {
		width: 29px;
		height: 29px;
		padding: 0;

		.icon {
			width: .75rem;
			height: .75rem;
		}

		@include u.tooltip('left');

		&:hover {
			background-color: u.$icon-button-hover;
		}
	}
}
</style>
