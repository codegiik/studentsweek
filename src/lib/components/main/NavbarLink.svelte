<script lang="ts">
	export let href: string;
	let clazz = '';

	export { clazz as class };
</script>

<a {href} class={clazz}>
	<slot />
</a>

<style lang="postcss">
	a {
		@apply font-title font-semibold text-lg;
	}
</style>
