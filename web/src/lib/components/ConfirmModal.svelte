<script lang="ts">
	import { closeModal } from 'svelte-modals';

	export let message = 'Sei sicuro di voler eseguire questa azione?';
	export let isOpen: boolean;
	export let callback: () => unknown = () => null;
</script>

{#if isOpen}
	<div role="dialog" class="modal-content">
		<p class="message">
			{message}
		</p>
		<div class="buttons">
			<div class="btn btn-primary" on:click={closeModal} on:keypress={closeModal}>No</div>
			<div
				class="btn btn-error"
				on:click={async () => {
					await callback();
					closeModal();
				}}
				on:keypress={async () => {
					await callback();
					closeModal();
				}}
			>
				Si
			</div>
		</div>
	</div>
{/if}

<style lang="postcss">
	.modal-content {
		@apply max-w-[300px];

		.message {
			@apply text-center w-full font-light text-lg;
		}

		.buttons {
			@apply flex justify-between mt-5 gap-2;

			.btn {
				@apply flex-1 text-center cursor-pointer;
			}
		}
	}
</style>
