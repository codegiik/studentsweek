<script lang="ts">
	import { onMount } from 'svelte';
	import toast from 'svelte-french-toast';
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import type { School, SetupExtra } from '$lib/interfaces';

	import {
		payload as payloadStore,
		errors as errorsStore,
		extra as extraStore
	} from '$lib/components/admin/setup/setup-store';
	import Fa from 'svelte-fa';
	import { faTrash } from '@fortawesome/free-solid-svg-icons';

	let extra: SetupExtra;
	let payload: Partial<School>;
	let errors: Record<string, string>;

	extraStore.subscribe((e) => (extra = e));
	errorsStore.subscribe((e) => (errors = e));
	payloadStore.subscribe((p) => (payload = p));

	const DEFAULT_PREVIEW = env.PUBLIC_DEFAULT_SCHOOL_LOGO || 'https://i.imgur.com/KPaLoPR.png';

	onMount(() => {
		if (!extra.logoPreview)
			extraStore.update((e) => ({
				...e,
				logoPreview: DEFAULT_PREVIEW
			}));
	});

	let setImage: () => void;
	let imageUpload: HTMLInputElement;

	if (browser) {
		const reader = new FileReader();
		reader.addEventListener('load', (data) => {
			if (!data.target) return;
			payload.logo = data.target.result as string;
			payloadStore.set(payload);
		});

		setImage = () => {
			if (!imageUpload.files || imageUpload.files.length == 0) return;

			const file = imageUpload.files[0];
			if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
				toast.error('Tipo di file sconosciuto');
				return;
			} else if (file.size > 1024 * 1024 * parseInt(env.PUBLIC_MAX_UPLOAD_MB || '5')) {
				toast.error('File di dimensioni troppo grandi (max. 5 MB)');
				return;
			}
			reader.readAsDataURL(file);
			extraStore.update((e) => ({
				...e,
				logoPreview: URL.createObjectURL(file)
			}));
		};
	}

	const removePreview = () => {
		delete payload.logo;
		payloadStore.set(payload);
		extraStore.update((e) => ({
			...e,
			logoPreview: DEFAULT_PREVIEW
		}));
		imageUpload = imageUpload;
	};

	$: extraStore.update((extra) => {
		extra.canProceed = payload.name ? payload.name.length >= 3 && payload.name.length <= 50 : false;
		return extra;
	});
</script>

<h2>Informazioni Generali</h2>
<p class="desc text-center">
	Compila i seguenti campi con le informazioni generali della scuola. La descrizione verrà mostrata
	sulla dashboard degli studenti.
</p>
<hr />
<img
	class="logo cartoonize cart-accent"
	on:click={() => imageUpload.click()}
	on:keypress={() => imageUpload.click()}
	src={extra.logoPreview ?? DEFAULT_PREVIEW}
	alt="Logo della Scuola"
/>
{#if payload.logo}
	<div on:click={removePreview} on:keypress={removePreview} class="btn btn-error btn-icons mx-auto">
		Rimuovi
		<Fa icon={faTrash} />
	</div>
{/if}
<input
	type="file"
	class="hidden"
	on:change={setImage}
	bind:this={imageUpload}
	accept="image/jpeg, image/png, image/jpg"
/>
<input
	type="text"
	minlength="3"
	bind:value={payload.name}
	class="input input-bordered"
	placeholder="Nome della Scuola"
	class:border-red-500={errors.name}
/>
<textarea
	class="input input-bordered"
	placeholder="Una breve descrizione per introdurre gli studenti alla settimana dello studente..."
	bind:value={payload.introDescription}
/>

<style lang="postcss">
	h2 {
		@apply text-center;
	}

	.logo {
		@apply rounded-full;
		@apply w-48 h-48 object-cover cursor-pointer my-2 mx-auto;
	}

	input,
	textarea {
		@apply w-full;
	}

	textarea {
		@apply h-[75px] py-2;
		resize: none;
	}
</style>
