<script lang="ts">
	import * as Plot from '@observablehq/plot';

	export let getQuery;

	import { onMount } from 'svelte';

	let data = [];
	let container: HTMLDivElement;

	onMount(async () => {
		console.log('mounting');

		const tripsByDayQuery = `
            SELECT
            DAYOFWEEK(start_time) as day,
            DAYNAME(start_time) as dayname,
            COUNT(*) as trips
            FROM
                parquet_scan('all_trips.parquet')
            WHERE
                strftime('%Y', start_time) = '2023'
            GROUP BY
                day, dayname
            ORDER BY
                day ASC;
        `;

		const table = await getQuery(tripsByDayQuery);
		const table_arr = table.toArray(); // list of objects, compatible with OJS

		const trips_data = table_arr.map((row) => {
			return {
				dayIndex: Number(row.day),
				dayName: row.dayname,
				trips: Number(row.trips)
			};
		});

		console.log({ trips_data });

		data = trips_data;

		const plot = Plot.plot({
			marginLeft: 90,
			y: { label: null },
			marks: [
				Plot.barX(data, {
					x: 'trips',
					y: 'dayName',
					sort: {
						y: 'data',
						reduce: ([row]) => {
							return row.dayIndex;
						}
					}
				}),
				Plot.text(data, {
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
	});
</script>

{#if data.length === 0}
	<div>Loading Bar Data</div>
{/if}
<div bind:this={container} />
