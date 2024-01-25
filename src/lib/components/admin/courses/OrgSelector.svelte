<script lang="ts">
	export let data: any;
	export let bind: any;
	export let callback: (newOrg: string) => void;

	const runCallback = (e: Event) => {
		const { value } = e.target as HTMLSelectElement;
		callback(value);
	};
</script>

<select bind:value={bind} on:change={runCallback}>
	{#each Object.entries(data) as [key, value]}
		<option value={key}>{value}</option>
	{/each}
</select>
