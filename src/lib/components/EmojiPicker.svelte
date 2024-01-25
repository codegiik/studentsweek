<script lang="ts">
	import { createPicker } from 'picmo';

	import { createEventDispatcher, onMount } from 'svelte';
	import { closeModal } from 'svelte-modals';

	export let isOpen: boolean;
	export let onEmojiSelected: ((emoji: string) => void) | null = null;
	let pickerEl: HTMLElement;

	const dispatch = createEventDispatcher();

	onMount(() => {
		const picker = createPicker({
			rootElement: pickerEl
		});

		picker.addEventListener('emoji:select', (event) => {
			dispatch('emojipicked', event);
			if (onEmojiSelected) onEmojiSelected(event.emoji);
			closeModal();
		});

		return () => {
			picker.destroy();
		};
	});
</script>

{#if isOpen}
	<div class="modal-content">
		<div class="picker" bind:this={pickerEl} />
	</div>
{/if}

<style lang="postcss">
	.modal-content {
		@apply w-auto;
	}
</style>
