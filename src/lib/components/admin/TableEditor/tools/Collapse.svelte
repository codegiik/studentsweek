<script lang="ts">
	export let title: string;
	export let open = false;

	let clazz = '';
	export { clazz as class };

	const switchOpen = () => (open = !open);
</script>

<div class={clazz}>
	<div class="collapse-title" on:click={switchOpen}>
		{@html title}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width={1.5}
			stroke="currentColor"
			class:rotate-90={open}
			class="collapse-arrow w-6 h-6"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
		</svg>
	</div>
	<div class="collapse-content" class:max-h-0={!open} class:max-h-[100vh]={open}>
		<slot />
	</div>
</div>

<style lang="postcss">
	.collapse-title {
		@apply flex justify-between items-center p-2 border-black border-[1px] cursor-pointer;
	}

	.collapse-arrow {
		transition: transform 0.25s ease-in-out;
	}

	.collapse-content {
		@apply h-full overflow-hidden;
	}
</style>
