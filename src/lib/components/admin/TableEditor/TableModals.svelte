<script lang="ts">
	import DeleteModal from './modals/Delete.svelte';
	import ElementModal from './modals/Element.svelte';
	import type { TableEditorSchema, TableEditorButtons, CallbacksHandler } from '$lib/interfaces';

	export let currentElement: any;
	export let closeModal: () => void;
	export let schema: TableEditorSchema;
	export let buttons: TableEditorButtons;
	export let handler: CallbacksHandler | undefined;
	export let currentModal: 'create' | 'edit' | 'delete' | undefined = undefined;

	const runCallback = async (key: 'create' | 'edit' | 'delete', el?: any) => {
		if (!handler) return;
		let callbackOk;
		switch (key) {
			case 'delete':
				callbackOk = await handler.deleteEntity(currentElement.id);
				break;
			case 'edit':
				callbackOk = await handler.editEntity(currentElement.id, el);
				break;
			case 'create':
				callbackOk = await handler.createEntity(el);
				break;
		}

		if (callbackOk) closeModal();
	};
</script>

{#if currentModal === 'create' && buttons.create}
	<ElementModal
		{schema}
		close={closeModal}
		element={currentElement}
		callback={(el) => runCallback('create', el)}
	/>
{:else if currentModal === 'edit' && buttons.edit}
	<ElementModal
		{schema}
		close={closeModal}
		element={currentElement}
		callback={(el) => runCallback('edit', el)}
	/>
{:else if currentModal === 'delete' && buttons.delete}
	<DeleteModal
		close={closeModal}
		callback={() => runCallback('delete')}
		elementIdentifier={currentElement[buttons.delete.identifierKey]}
	/>
{/if}
