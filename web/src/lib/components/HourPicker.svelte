<script lang="ts">
	import type { Course, TimetableRules } from '$lib/interfaces';
	import { currentUser, type SpecialDocumentRef } from '$lib/user';
	import {
		getDayName,
		getHoursSchemaByRuleAndUnit,
		getTimeByHour,
		nToAdjective,
		TimetableRule
	} from '$lib/utils';

	const { school, location } = currentUser;

	export let rules: TimetableRules;
	export let unit: number;
	export let callback: ((d: number, h: [number, number]) => void) | undefined;
	let hoursSchemaPerDay: any[] = [];
	const rulesObj = new TimetableRule(rules);

	location.subscribe((value) => {
		if (!value) return;
		hoursSchemaPerDay = value.rules.map((rule) => getHoursSchemaByRuleAndUnit(rule, unit));
	});
</script>

{#if $school?.days}
	{#each $school.days as day, i}
		<div class="day">
			<h4>{getDayName(day)}</h4>
			<div class="hours">
				{#each hoursSchemaPerDay[i] as hour, j}
					<div
						class="tile"
						style={`flex: ${Math.abs(hour[1] - hour[0])}`}
						class:disabled={!rulesObj.at(i, hour)}
						on:click={() => rulesObj.at(i, hour) && callback && callback(i, hour)}
					>
						<p>{nToAdjective(j + 1)}</p>
						<span>
							{`${getTimeByHour(hour[0], $school.timeUnit, $school.startTime)} - ${getTimeByHour(
								hour[1],
								$school.timeUnit,
								$school.startTime
							)}`}
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/each}
{/if}

<style lang="postcss">
	.day {
		@apply mt-5;

		h4 {
			@apply opacity-70 text-base;
		}

		.hours {
			@apply flex overflow-hidden border-[1px] border-accent rounded-md flex-wrap;

			.tile {
				@apply border-[1px] border-accent h-20 flex items-center justify-center flex-col px-2 cursor-pointer min-w-[100px];

				&:not(.disabled):hover {
					@apply bg-accent;

					span {
						@apply text-accent-content;
					}
				}

				&.disabled {
					@apply bg-gray-200 text-gray-300 cursor-not-allowed;
				}

				p {
					@apply font-title font-semibold;
				}

				span {
					@apply font-light text-accent-focus text-xs;
				}
			}
		}
	}
</style>
