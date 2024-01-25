<script lang="ts">
	import GenericInput from '$lib/components/admin/GenericInput.svelte';
	import Collapse from '$lib/components/Collapse.svelte';
	import DatePickerFree from '$lib/components/DatePickerFree.svelte';
	import EmojiPicker from '$lib/components/EmojiPicker.svelte';
	import type { Course } from '$lib/interfaces';
	import currentUser from '$lib/user';
	import { TimetableRule } from '$lib/utils';
	import { faPen } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { closeModal, openModal } from 'svelte-modals';
	import { locations } from '../../locations';

	export let isOpen: boolean;
	export let data: Partial<Course> = {};
	export let onSubmit: ((data: Partial<Course>) => any) | null = null;

	const { school } = currentUser;

	const openPicker = () => {
		openModal(EmojiPicker, {
			onEmojiSelected: (e) => (data.emoji = e)
		});
	};

	const handleSubmit = () => {
		closeModal();
		if (onSubmit) onSubmit(data);
	};

	const onDurationChange = (e: any) => {
		data.unit = parseInt(e.detail);
	};

	const onLimitChange = (e: any) => {
		data.limit = parseInt(e.detail);
	};
</script>

{#if isOpen}
	<div class="modal-content">
		<h2>Corso</h2>
		<p class="desc">Compila i campi sottostanti</p>
		<div class="divider" />
		<form on:submit|preventDefault={handleSubmit}>
			<p class="course-emoji">
				{data.emoji ?? '🏫'}
			</p>
			<div class="btn btn-secondary btn-icons" on:click={openPicker}>
				Cambia Emoji
				<Fa icon={faPen} />
			</div>
			<GenericInput
				placeholder="Nome del Corso"
				name="course-name"
				class="w-full"
				bind:value={data.name}
			/>
			<GenericInput
				placeholder="Aula del Corso"
				name="course-room"
				class="w-full"
				bind:value={data.room}
			/>
			<textarea
				name="course-desc"
				id="course-desc"
				class="textarea textarea-bordered w-full"
				placeholder="Inserisci una breve descrizione per il corso..."
				bind:value={data.desc}
			/>
			<GenericInput
				placeholder="Email dell'Organizzatore"
				name="course-org"
				class="w-full"
				bind:value={data.org}
			/>
			<GenericInput
				type="number"
				placeholder="Durata del Corso (in ore)"
				name="course-duration"
				class="w-full"
				inputProps={{ min: 1, max: TimetableRule.maxNOfHours($school?.rules ?? []) }}
				on:valuechange={onDurationChange}
			/>
			<GenericInput
				type="number"
				placeholder="Limite di partecipanti (per ora)"
				name="course-limit"
				class="w-full"
				inputProps={{ min: 1 }}
				on:valuechange={onLimitChange}
			/>
			{#if Array.isArray($locations)}
				<select
					name="course-location"
					id="course-location"
					class="select select-bordered w-full"
					bind:value={data.loc}
				>
					<option value="" disabled selected hidden>Scegli la sede del corso</option>
					{#each $locations as location}
						<option value={location._.id}>{location.name}</option>
					{/each}
				</select>
			{/if}
			<Collapse styled>
				<p slot="title">Modifica la Disponibilità del corso:</p>
				<div slot="content">
					{#if $school?.rules && $school.startTime}
						<DatePickerFree
							bind:rules={data.rules}
							schemaRules={$school.rules}
							bind:unit={data.unit}
							timeUnit={$school.timeUnit}
							startTime={$school.startTime}
						/>
					{/if}
				</div>
			</Collapse>

			<input type="submit" class="btn btn-primary w-full" value="Crea" />
		</form>
	</div>
{/if}

<style lang="postcss">
	.modal-content {
		@apply max-w-[500px];

		form {
			@apply flex flex-col gap-4 items-center;

			.course-emoji {
				@apply text-8xl w-max h-auto;
			}
		}
	}
</style>
