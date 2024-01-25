<script lang="ts">
	export let checked: boolean;

	let clazz = '';
	export { clazz as class };
</script>

<div class="container">
	<input type="checkbox" bind:checked />
	<div class="checkmark {clazz}" />
</div>

<style lang="postcss">
	.container {
		@apply relative w-auto;

		input {
			@apply hidden opacity-0 cursor-pointer h-0 w-0;
		}
	}

	/* Create a custom checkbox */
	.checkmark {
		@apply bg-gray-200 w-[20px] h-[20px];
	}

	/* On mouse-over, add a grey background color */
	.container:hover input ~ .checkmark {
		@apply bg-gray-300;
	}

	/* When the checkbox is checked, add a blue background */
	.container input:checked ~ .checkmark {
		@apply bg-primary;
	}

	/* Create the checkmark/indicator (hidden when not checked) */
	.checkmark:after {
		@apply absolute hidden;
		content: '';
	}

	/* Show the checkmark when checked */
	.container input:checked ~ .checkmark:after {
		display: block;
	}

	/* Style the checkmark/indicator */
	.container .checkmark:after {
		left: 35%;
		top: 12%;
		width: 28%;
		height: 65%;
		border: solid white;
		border-width: 0 3px 3px 0;
		-webkit-transform: rotate(45deg);
		-ms-transform: rotate(45deg);
		transform: rotate(45deg);
	}
</style>
