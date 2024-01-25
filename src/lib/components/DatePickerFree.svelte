<script lang="ts">
	import type { Timestamp } from 'firebase/firestore';
	import {
		getHoursSchemaByRuleAndUnit,
		getTimeByHour,
		nToAdjective,
		TimetableRule
	} from '$lib/utils';
	import { createEventDispatcher } from 'svelte';

	let clazz = '';
	export { clazz as class };
	export let unit = 1;
	export let timeUnit = 60;
	export let days: Timestamp[] | undefined = undefined;
	export let startTime: Timestamp | undefined = undefined;
	export let schemaRules: number[];
	export let rules: number[] = schemaRules;
	export let hourSchema: number[][][] = [];

	const dispatch = createEventDispatcher();

	const setHourSchema = (nu: number) => {
		hourSchema = schemaRules.map((d) => getHoursSchemaByRuleAndUnit(d, Number(nu)));
	};

	$: if (unit) setHourSchema(unit);

	const switchActive = (i: number, j: number) => {
		rules = TimetableRule.toggleHour(rules, i, j);
		dispatch('change', rules);
	};
</script>

<div class="calendar {clazz}">
	{#each hourSchema as day, i}
		<div class="day">
			<h4>
				{#if days}
					<span>
						{days[i].toDate().toLocaleString()}
					</span>
				{:else}
					<span>
						{nToAdjective(i + 1, 'male')} giorno
					</span>
				{/if}
			</h4>
			<div class="hours">
				{#each hourSchema[i] as hour, j}
					<div
						on:click={() => switchActive(i, j)}
						class="tile cartoonize"
						class:active={TimetableRule.at(rules, i, j)}
						class:cart-primary={TimetableRule.at(rules, i, j)}
						class:cart-accent={!TimetableRule.at(rules, i, j)}
					>
						<p>{nToAdjective(j + 1)} Ora</p>
						{#if startTime && unit}
							<span>
								{getTimeByHour(hour[0], timeUnit, startTime)} - {getTimeByHour(
									hour[1],
									timeUnit,
									startTime
								)}
							</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>

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
