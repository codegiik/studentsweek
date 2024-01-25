<script lang="ts">
	import { onMount } from 'svelte';
	import toast from 'svelte-french-toast';
	import { nToAdjective, toBinary } from '$lib/utils';
	import { Timestamp } from 'firebase/firestore';
	import { payload } from '$lib/components/admin/setup/setup-store';
	import Fa from 'svelte-fa';
	import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

	let clazz = '';
	export { clazz as class };
	export let canEditDays = true;
	export let rules: number[] | undefined;
	export let days: Timestamp[] | undefined;
	export let restricted: number[][] | undefined = undefined;
	export let setData: ({
		rules,
		days,
		numberOfHours
	}: {
		rules: number[];
		days?: Timestamp[];
		numberOfHours?: number;
	}) => void;

	const getBaseCalendar = () => {
		if (rules && days) {
			return Object.fromEntries(
				days.map((day, i) => {
					if (!rules || !$payload.numberOfHours) return [];
					return [
						day.toDate().toISOString(),
						toBinary($payload.numberOfHours, rules, i, {
							restricted
						})
					];
				})
			);
		} else {
			return {
				_day1: [1]
			};
		}
	};

	let calendar: Record<string, number[]> = getBaseCalendar();

	const addDay = () => {
		if (!canEditDays) return;
		let arrLen = 1;
		if (Object.values(calendar).length > 0) arrLen = Object.values(calendar)[0].length;
		calendar = {
			...calendar,
			[`_day${Object.keys(calendar).length + 1}`]: Array(arrLen).fill(1)
		};
	};

	const removeDay = (key: string) => {
		if (Object.keys(calendar).length > 1) {
			delete calendar[key];
			calendar = calendar;
		} else toast.error("Dev'esserci almeno un elemento nel calendario.");
	};

	const addHour = () => {
		calendar = Object.fromEntries(Object.entries(calendar).map(([k, day]) => [k, [...day, 1]]));
	};

	const switchActive = (key: string, keyIndex: number, j: number) => {
		if (restricted && restricted[keyIndex][j] === 1) return;
		calendar[key][j] = calendar[key][j] === 1 ? 0 : 1;
	};

	const getStartTimes = () => {
		if (!$payload.startTime) return [0, 0];
		const date = $payload.startTime.toDate();
		return [date.getHours(), date.getMinutes()];
	};

	$: getHourAndMinutes = (hourIndex: number) => {
		if (!$payload.timeUnit || !$payload.startTime) return '';

		const [startHour, startMinutes] = getStartTimes();
		const hour = (startHour + Math.floor((startMinutes + hourIndex * $payload.timeUnit) / 60)) % 24;
		const minutes = ((startMinutes + hourIndex * $payload.timeUnit) % 60)
			.toString()
			.padStart(2, '0');
		return `${hour}:${minutes.toString().padStart(2, '0')}`;
	};

	let currentKey: string;
	let datePicker: HTMLInputElement;

	const setDatePickerDate = (e: Event) => {
		if (!calendar[currentKey]) return;
		const target = e.target as HTMLInputElement;
		const newKey = new Date(target.value).toISOString();

		if (Object.keys(calendar).includes(newKey)) {
			toast.error("L'elemento già esiste");
			return;
		} else if (new Date() > new Date(target.value)) {
			toast.error('Per favore, inserire una data futura.');
			return;
		}

		calendar = {
			...calendar,
			[newKey]: calendar[currentKey]
		};
		delete calendar[currentKey];

		calendar = Object.fromEntries(
			Object.keys(calendar)
				.sort((k1, k2) => (k1.startsWith('_') && !k2.startsWith('_') ? 1 : -1))
				.sort((k1, k2) => +new Date(k1) - +new Date(k2))
				.map((k) => [k, calendar[k]])
		);
	};

	const showCalendarWidget = (key: string) => {
		if (!canEditDays) return;

		const date = new Date(key);
		if (!key.startsWith('_')) datePicker.valueAsDate = date;
		else datePicker.valueAsDate = new Date();

		currentKey = key;
		datePicker.showPicker();
	};

	onMount(() => {
		if (datePicker) datePicker.addEventListener('change', setDatePickerDate);
	});

	function updateCalendar(cal: Record<string, number[]>) {
		if (!cal) return;

		const data: {
			rules: number[];
			days?: Timestamp[];
			numberOfHours?: number;
		} = {
			rules: Object.values(cal).map((hours) => {
				let sum = 0;
				hours.forEach((value, i) => {
					if (value === 1) sum += Math.pow(2, i);
				});
				return sum;
			})
		};

		if (canEditDays) {
			const newDays = Object.keys(cal).filter((k) => !k.startsWith('_'));
			if (newDays.length > 0) data.days = newDays.map((k) => Timestamp.fromDate(new Date(k)));

			const numberOfHours = Object.values(cal)[0].length;
			data.numberOfHours = numberOfHours;
		}

		setData(data);
	}

	$: updateCalendar(calendar);
</script>

{#if canEditDays}
	<input type="date" class="calendar-picker" bind:this={datePicker} />
{/if}
<div class="calendar {clazz}">
	{#each Object.keys(calendar) as day, i}
		<div class="day">
			<h4>
				<span on:click={() => showCalendarWidget(day)} on:keypress={() => showCalendarWidget(day)}>
					{#if day.startsWith('_')}
						Giorno {i + 1}
					{:else}
						{new Date(day).toLocaleDateString()}
					{/if}
				</span>
				{#if canEditDays}
					<span class="opacity-75"> (Clicca per modificare) </span>
					<span
						on:click={() => removeDay(day)}
						on:keypress={() => removeDay(day)}
						class="display-contents"
					>
						<Fa icon={faTrash} />
					</span>
				{/if}
			</h4>
			<div class="hours">
				{#each calendar[day] as hour, j}
					<div
						on:click={() => switchActive(day, i, j)}
						on:keypress={() => switchActive(day, i, j)}
						class="tile cartoonize"
						class:active={hour === 1}
						class:cart-secondary={hour === 1 && !(restricted && restricted[i][j] == 1)}
						class:cart-accent={hour === 0 || (restricted && restricted[i][j] == 1)}
						class:disabled={restricted && restricted[i][j] == 1}
					>
						<p>{nToAdjective(j + 1)} Ora</p>
						<span>
							{getHourAndMinutes(j)} - {getHourAndMinutes(j + 1)}
						</span>
					</div>
				{/each}
				{#if canEditDays}
					<div class="tile cartoonize cart-secondary active" on:click={addHour}>
						<p>
							<Fa icon={faPlus} />
						</p>
					</div>
				{/if}
			</div>
		</div>
	{/each}
</div>
{#if canEditDays}
	<div class="btn btn-secondary" on:click={addDay}>Aggiungi Giorno</div>
{/if}

<style lang="postcss">
	.calendar {
		@apply pb-2;

		.day {
			@apply mt-5;

			&:first-child {
				@apply mt-0;
			}

			h4 {
				@apply opacity-70 text-base flex gap-2 items-center;

				span {
					@apply cursor-pointer;
				}
			}

			.hours {
				@apply flex rounded-md flex-wrap gap-1;

				.tile {
					@apply h-20 flex flex-1 items-center justify-center flex-col px-2 cursor-pointer min-w-[100px] rounded-md;

					&.active {
						@apply bg-secondary text-white bg-opacity-80;

						span {
							@apply text-white;
						}
					}

					/* &:not(.disabled):hover { */
					/* 	@apply bg-accent; */
					/**/
					/* 	span { */
					/* 		@apply text-accent-content; */
					/* 	} */
					/* } */

					&.disabled {
						@apply bg-gray-200 text-gray-300 cursor-not-allowed;
					}

					p {
						@apply font-title font-semibold text-center leading-tight;
					}

					span {
						@apply font-light text-accent-focus text-xs;
					}
				}
			}
		}
	}

	.calendar-picker {
		@apply fixed top-[40%] left-[40%] w-0 h-0 opacity-0;
	}
</style>
