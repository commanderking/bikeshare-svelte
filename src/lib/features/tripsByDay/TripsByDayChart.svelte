<script lang="ts">
	import * as Plot from '@observablehq/plot';
	import { type GetQuery } from '$lib/types/queries';
	import { onMount } from 'svelte';
	import type { RawTableRow, Day } from './types';
	import { tripsByDayQuery } from './constants';
	export let getQuery: GetQuery;
	let container: HTMLDivElement;

	let isLoading = true;

	onMount(async () => {
		const data = await getQuery(tripsByDayQuery);

		const tripsData = data.map((row: RawTableRow) => {
			return {
				dayIndex: Number(row.day),
				dayName: row.dayname,
				trips: Number(row.trips)
			};
		});

		const plot = Plot.plot({
			marginLeft: 90,
			y: { label: null },
			marks: [
				Plot.barX(tripsData, {
					x: 'trips',
					y: 'dayName',
					sort: {
						y: 'data',
						reduce: ([row]: Day[]) => {
							return row.dayIndex;
						}
					}
				}),
				Plot.text(tripsData, {
					text: (d) => d.trips,
					x: 'trips',
					y: 'dayName',
					textAnchor: 'end',
					dx: -3,
					fill: 'white'
				})
			]
		});

		container.append(plot); // Append the plot to our container
		isLoading = false;
	});
</script>

{#if isLoading}
	<div>Loading Bar Data</div>
{/if}
<div bind:this={container} />
