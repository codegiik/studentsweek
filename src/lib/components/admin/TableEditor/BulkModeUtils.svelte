<script lang="ts">
	import { openModal } from 'svelte-modals';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';

	export let selected: number[];
	export let deleteBulk: () => void;
	export let deactivate: () => void;

	const openConfirm = () => {
		openModal(ConfirmModal, {
			message: `Sei sicuro di voler eliminare ${selected.length} elementi?`,
			callback: deleteBulk
		});
	};
</script>

<div class="bulk-utils">
	Selezionati: {selected.length}
	<button class="delete-bulk" on:click={openConfirm}>Elimina ({selected.length}) elementi</button>
	<button on:click={deactivate}>Cancella</button>
</div>

<style lang="scss">
	.delete-bulk {
		@apply bg-red-400 text-white rounded-md p-2;
	}
</style>
