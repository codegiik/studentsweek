<script lang="ts">
	import type { TableEditorProp, MultiProp } from '$lib/interfaces';

	import PencilIcon from './icons/PencilIcon.svelte';
	import MultiModal from './modals/MultiModal.svelte';

	export let data: any;
	export let schema: TableEditorProp<any, MultiProp>;
	export let callback: (newValue: any[]) => void;

	let selected = data || [];

	const updateSelected = (newSelected: any[]) => {
		selected = newSelected;
		callback(newSelected);
	};

	let open = false;
	const openModal = () => (open = true);
	const closeModal = () => (open = false);
	let { displayMax } = schema.multiOptions;
</script>

{#if open}
	<MultiModal {schema} {selected} close={closeModal} callback={updateSelected} />
{/if}
<button on:click={openModal}>
	<PencilIcon class={'w-4 h-4'} />
</button>
{#if Array.isArray(schema.multiOptions.data)}
	{displayMax
		? `${selected.slice(0, displayMax).join(', ')} e ${selected.length - displayMax} altri`
		: selected.join(', ')}
{:else}
	{displayMax
		? `${selected
				.slice(0, displayMax)
				.map((k) => schema.multiOptions.data[k])
				.join(', ')} e ${selected.length - displayMax} altri`
		: selected.map((k) => schema.multiOptions.data[k]).join(', ')}
{/if}
