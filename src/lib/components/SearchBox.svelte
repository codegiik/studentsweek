<script lang="ts">
	export let inputProps: any = {};
	export let label: string | undefined;
	export let initialQuery = '';
	export let timeoutDuration = 1500;
	export let callback: (query: string) => void;

	let clazz = '';
	export { clazz as class };

	let query: string = initialQuery;

	let t: ReturnType<typeof setTimeout> | undefined;

	const runQuery = () => {
		if (t) clearTimeout(t);
		t = setTimeout(() => callback(query), timeoutDuration);
	};
</script>

<div class={`search-wrapper ${clazz}`}>
	{#if label}
		{label}
	{/if}
	<input {...inputProps} bind:value={query} on:input={runQuery} />
</div>
