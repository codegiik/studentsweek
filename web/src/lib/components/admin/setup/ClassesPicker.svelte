<script lang="ts">
	import type { School } from '$lib/interfaces';
	import { payload as payloadStore } from '$lib/components/admin/setup/setup-store';
	import CheckBox from '$lib/components/CheckBox.svelte';

	export let locationIndex: number;

	let payload: Partial<School>;
	payloadStore.subscribe((p) => (payload = p));

	const switchClass = (className: string) => {
		if (!payload.locations) return;

		if (payload.locations[locationIndex].classes.includes(className)) {
			payload.locations[locationIndex].classes = payload.locations[locationIndex].classes.filter(
				(c: string) => c !== className
			);
		} else payload.locations[locationIndex].classes.push(className);

		payloadStore.update((p) => ({
			...p,
			locations: payload.locations
		}));
	};
</script>

{#if payload.locations && payload.classes}
	<div class="filter-wrapper">
		{#each payload.classes as className}
			<div on:click={() => switchClass(className)}>
				{className}
				<input
					type="checkbox"
					class="toggle toggle-primary"
					checked={payload.locations[locationIndex].classes.includes(className)}
				/>
			</div>
		{/each}
	</div>
{/if}

<style lang="postcss">
	.filter-wrapper {
		@apply grid grid-cols-1 gap-2;

		div {
			@apply flex justify-between items-center p-4 hover:bg-base-300 cursor-pointer font-light rounded-md font-title;
		}
	}
</style>
