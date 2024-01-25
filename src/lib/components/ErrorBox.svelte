<script lang="ts">
	import type { UIError } from '$lib/interfaces';

	import { getCodeMessage } from '$lib/utils';

	export let error: UIError;
</script>

<div class="error-box">
	<span class="error-box-title">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
			<path
				fill-rule="evenodd"
				d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
				clip-rule="evenodd"
			/>
		</svg>

		Errore
	</span>
	{getCodeMessage(error.code)}
</div>

<style lang="postcss">
	.error-box {
		@apply border-2 bg-error text-error-content border-red-600 w-full;
		@apply p-2 rounded-lg;

		.error-box-title {
			@apply block font-title font-bold mb-1 text-lg flex gap-2 items-center justify-center;
		}
	}
</style>
