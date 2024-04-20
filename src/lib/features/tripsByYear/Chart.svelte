<script lang="ts">
	import * as Plot from '@observablehq/plot';
	import { type GetQuery } from '$lib/types/queries';
	import { onMount } from 'svelte';
	import type { RawTableRow, Year } from './types';
	import { yearlyRidesQuery } from './constants';

	export let getQuery: GetQuery;
	let container: HTMLDivElement;
	let isLoading = true;

	onMount(async () => {
		const data = await getQuery(yearlyRidesQuery);

		const tripsData = data.map((row: RawTableRow) => {
			return {
				year: row.year,
				trips: Number(row.trips)
			};
		});

		const plot = Plot.plot({
			marginLeft: 90,
			y: { grid: true },
			marks: [
				Plot.barY(tripsData, {
					x: 'year',
					y: 'trips',
					sort: {
						x: 'data',
						reduce: ([row]: Year[]) => {
							return row.year;
						}
					}
				}),
				Plot.text(tripsData, {
					text: (d) => d.trips,
					x: 'year',
					y: 'trips',
					textAnchor: 'end',
					fill: 'black',
					dy: -6,
					dx: 22,
					lineAnchor: 'bottom'
				})
			]
		});

		container.append(plot);
		isLoading = false;
	});
</script>

{#if isLoading}
	<div>Loading Bar Data</div>
{/if}
<div bind:this={container} />
