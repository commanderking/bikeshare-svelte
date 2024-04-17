<script lang="ts">
	import * as Plot from '@observablehq/plot';
	import { type GetQuery } from '$lib/types/queries';
	import { onMount } from 'svelte';
	export let getQuery: GetQuery;

	let query = `
        SELECT
        EXTRACT(HOUR FROM start_time) AS hour,
        COUNT(*) AS trips
        FROM
        parquet_scan('all_trips.parquet')
        GROUP BY
        hour
        ORDER BY
        hour;
    `;

	let container: HTMLDivElement;
	let isLoading = true;

	onMount(async () => {
		const data = await getQuery(query);

		const tripsData = data.map((row: { hour: BigInt; trips: BigInt }) => {
			return {
				hour: Number(row.hour),
				trips: Number(row.trips)
			};
		});

		const plot = Plot.plot({
			marginLeft: 90,
			y: { grid: true },
			marks: [
				Plot.barY(tripsData, {
					x: 'hour',
					y: 'trips',
					sort: {
						x: 'data',
						reduce: ([row]: { hour: number; trips: number }[]) => {
							return row.hour;
						}
					}
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
