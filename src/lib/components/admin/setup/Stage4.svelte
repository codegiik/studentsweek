<script lang="ts">
	import type { School } from '$lib/interfaces';
	import { Timestamp } from 'firebase/firestore';

	import DatePicker from './DatePicker.svelte';

	import { payload as payloadStore } from '$lib/components/admin/setup/setup-store';

	let payload: Partial<School>;
	payloadStore.subscribe((p) => (payload = p));

	const setData = ({
		rules,
		days,
		numberOfHours
	}: {
		rules: number[];
		days?: Timestamp[];
		numberOfHours?: number;
	}) => {
		payloadStore.update((p) => {
			p.rules = rules;
			if (days) p.days = days;
			if (numberOfHours) p.numberOfHours = numberOfHours;
			if (p.locations)
				p.locations = p.locations.map((location) => ({
					...location,
					rules: p.rules || []
				}));
			return p;
		});
	};

	const getStartTime = () => {
		if (!payload.startTime) return '08:30';
		const d = payload.startTime.toDate();
		return `${d.getHours().toString().padStart(2, '0')}:${d
			.getMinutes()
			.toString()
			.padStart(2, '0')}`;
	};

	let startTime = getStartTime();

	const getTime = () => {
		const [hours, minutes] = startTime.split(':').map((t) => parseInt(t));
		const d = new Date();
		d.setHours(hours, minutes);
		return d;
	};

	$: if (payload.timeUnit) payloadStore.set(payload);
	$: if (startTime)
		payloadStore.update((p) => ({
			...p,
			startTime: Timestamp.fromDate(getTime())
		}));
</script>

<h2 class="text-center">Selezione Orari</h2>
<p class="desc text-center">
	Seleziona gli orari in cui la scuola è aperta. Puoi selezionare orari diversi per ogni giorno.
	Successivamente potrai specificare l'orario per le singole sedi.
</p>
<hr />
<div class="input-box">
	<span> Ora d'Inizio: </span>
	<input type="time" bind:value={startTime} />
</div>
<div class="input-box">
	<span> Unità di Tempo (minuti): </span>
	<input type="number" min={1} max={23 * 60} bind:value={payload.timeUnit} />
</div>
<DatePicker {setData} class="date-picker" days={payload.days} rules={payload.rules} />
<hr />

<style lang="postcss">
	:global(.date-picker) {
		@apply max-h-[40vh] overflow-y-auto pr-2;

		&::-webkit-scrollbar {
			@apply w-[5px] h-[5px] rounded-md;
		}

		&::-webkit-scrollbar-track {
			@apply bg-transparent;
		}

		&::-webkit-scrollbar-thumb {
			@apply bg-primary/[0.8];
		}

		&::-webkit-scrollbar-thumb:hover {
			@apply bg-primary;
		}
	}
</style>
