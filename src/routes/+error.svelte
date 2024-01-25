<script>
	import { page } from '$app/stores';
</script>

<div class="wrapper">
	<div class="errorbox">
		<h2>{$page.status}</h2>
		<div class="divider divider-horizontal" />
		<p>{$page?.error?.message}</p>
	</div>
</div>

<style lang="postcss">
	.wrapper {
		@apply flex justify-center items-center h-full;

		.errorbox {
			@apply flex m-auto items-center;

			p {
				@apply font-light text-xl;
			}
		}
	}
</style>
