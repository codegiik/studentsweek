<script lang="ts">
	let clazz = '';

	export let close: any;
	export { clazz as class };
</script>

<div class="modal-wrapper" on:click|self={close}>
	<div class="modal-content {clazz}">
		<div class="modal-close" on:click={close}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-5 h-5"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</div>
		<slot />
	</div>
</div>

<style lang="scss">
	.modal-wrapper {
		top: 0;
		left: 0;
		z-index: 99;
		@apply flex items-center justify-center fixed w-screen h-screen bg-gray-300 bg-opacity-[0.7];

		.modal-content {
			@apply relative bg-white w-[600px] h-[calc(100%-3rem)];
		}

		.modal-close {
			top: 10px;
			right: 10px;
			@apply absolute cursor-pointer;
		}
	}

	@media screen and (max-width: 800px) {
		.modal-content {
			width: 350px !important;
		}
	}
</style>
