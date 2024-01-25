<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let type = 'text';
	export let name: string;
	export let placeholder: string;
	export let inputClass = '';
	export let transition = true;
	export let inputProps: any = {};
	export let value: any = null;

	const dispatch = createEventDispatcher();
	let clazz = '';

	export { clazz as class };
</script>

<div class="form-group {clazz}">
	<input
		{type}
		{name}
		id={name}
		on:click
		on:focus
		on:change
		on:keypress
		{placeholder}
		{...inputProps}
		class="input input-bordered {inputClass}"
		{value}
		on:input={(e) => {
			value = e?.currentTarget?.value;
			dispatch('valuechange', e?.currentTarget?.value);
		}}
	/>
	<label for={name} class:transition-all={transition}>{placeholder ?? name}</label>
</div>

<style lang="postcss">
	.form-group {
		@apply relative h-12;

		input {
			@apply w-full h-full;

			&::placeholder {
				@apply text-transparent;
			}

			&:focus + label,
			&:not(:placeholder-shown) + label {
				@apply top-0 text-sm bg-base-100;
			}
		}

		label {
			@apply absolute top-1/2 left-2 -translate-y-1/2 font-title font-semibold text-gray-400 px-2;
		}
	}
</style>
