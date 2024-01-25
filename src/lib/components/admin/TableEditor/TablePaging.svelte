<script lang="ts">
	import { onMount } from 'svelte';
	import type { TableEditorPaging, IncrementalPaging } from '$lib/interfaces';

	export let currentPage: number;
	export let mode: 'normal' | 'bulk';
	export let renderedDataLength: number;
	export let setCurrentPage: (newPage: number) => void;
	export let sliceData: (start: number, end?: number) => void;
	export let paging: TableEditorPaging & {
		dataLength: number;
	};

	$: setCurrentPage(currentPage);

	/* General */
	let lastPage: number | undefined;
	$: {
		paging.dataLength = paging.dataLength;
		lastPage = paging.dataLength - 1 < paging.pageSize ? 0 : undefined;
	}
	$: if (renderedDataLength === 0) prevPage();

	onMount(() => {
		sliceData(currentPage * pageSize, (currentPage + 1) * pageSize);
	});

	/* Auto */
	const nextPage = async () => {
		let p = paging as TableEditorPaging<IncrementalPaging> & { dataLength: number };

		if ((lastPage && currentPage + 1 <= lastPage) || currentPage < p.dataLength / p.pageSize - 2)
			currentPage += 1;
		else {
			await p
				.fetchCallback()
				.then((result: any[]) => {
					if (p.setData) p.setData({ newData: result });
					if (result.length === 0) lastPage = currentPage + 1;
				})
				.catch((err) => console.error(err));
			currentPage += 1;
		}

		setCurrentPage(currentPage);
		if (p.setData) p.setData({ newPage: currentPage });
	};

	const prevPage = () => {
		let p = paging as TableEditorPaging<IncrementalPaging>;
		currentPage -= 1;
		setCurrentPage(currentPage);
		if (p.setData) p.setData({ newPage: currentPage });
	};

	let { pageSize } = paging;
	$: currentPage, sliceData(currentPage * pageSize, (currentPage + 1) * pageSize);

	//	const switchPage = async (newPage: string) => {
	//		if (!parseInt(newPage) || !options?.paging?.switchPage) return;
	//
	//		const oldPage = getQueryParams("page") || "1";
	//		addQueryParams('page', newPage);
	//
	//		const callbackOk = await options?.paging?.switchPage(oldPage, newPage);
	//		if (!callbackOk) addQueryParams("page", oldPage);
	//	};
</script>

{#if paging.type === 'incremental'}
	<td>
		Pag. {currentPage + 1}
	</td>
	<td>
		{#if mode !== 'bulk' && renderedDataLength > 0}
			{#if currentPage !== 0}
				<button on:click={prevPage}>
					{'<'} Pagina Precedente
				</button>
			{/if}
			{#if currentPage !== lastPage}
				<button on:click={nextPage}>
					Prossima Pagina {'>'}
				</button>
			{/if}
		{/if}
	</td>
{:else if paging.type === 'default'}
	<!--
	TODO
	<SearchBox
		label="Pagina"
		callback={switchPage}
		inputProps={{ type: 'number', min: 1 }}
		initialQuery={paging.currentPage?.toString()}
	/>
	-->
	/ {paging.dataLength / paging.pageSize}
{/if}

<!--
<td>
	{#if paging.type === 'incremental'}
	{:else}
			<SearchBox
				label="Pagina"
				callback={switchPage}
				inputProps={{ type: 'number', min: 1 }}
				initialQuery={paging.currentPage?.toString()}
			/>
			{#if paging.pages}
				/ {paging.pages}
			{/if}
	{/if}
</td>
-->
