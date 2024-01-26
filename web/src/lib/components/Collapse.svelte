<script lang="ts">
	import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	export let open = false;
	export let styled = false;

	let clazz = '';
	export { clazz as class };
</script>

<div class="sw-collapse {clazz}" class:styled>
	<div class="sw-collapse-title" on:click={() => (open = !open)} on:keypress={() => (open = !open)}>
		<slot name="title" />
		<span class:rotate-90={open}>
			<Fa icon={faChevronDown} class="sw-collapse-icon" />
		</span>
	</div>
	<div class="sw-collapse-content" class:max-h-0={!open} class:max-h-full={open}>
		<slot name="content" />
	</div>
</div>

<style lang="postcss">
	.sw-collapse {
		&.styled {
			@apply bg-base-200 px-2 rounded-md border-2 border-accent font-semibold text-sm font-title text-neutral/[0.8] w-full py-2;
		}

		.sw-collapse-title {
			@apply flex justify-between items-center cursor-pointer;
		}

		.sw-collapse-content {
			@apply overflow-hidden;
		}
	}
</style>
