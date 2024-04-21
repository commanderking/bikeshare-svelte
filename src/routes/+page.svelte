<script lang="ts">
	import 'xterm/css/xterm.css';
	import { onMount } from 'svelte';
	import type { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';

	import TripsByDayChart from '$lib/features/tripsByDay/TripsByDayChart.svelte';
	import TripsByYearChart from '$lib/features/tripsByYear/Chart.svelte';
	import TripsByHour from '$lib/features/tripsByHour/Chart.svelte';

	import { initDB } from '$lib/duckdb';
	import { type GetQuery } from '$lib/types/queries';

	let getQuery: GetQuery | null = null;

	onMount(async () => {
		const parquetUrl = new URL('local/all_trips.parquet', window.location.origin).href;
		let connectionPromise: Promise<AsyncDuckDBConnection> | null;

		const loadQueryDb = async () => {
			console.log('loading db');
			if (connectionPromise) {
				return connectionPromise;
			}
			const db = await initDB();
			await db.registerFileURL('all_trips.parquet', parquetUrl, 4, false);
			connectionPromise = db.connect();
			return connectionPromise;
		};

		await loadQueryDb();

		// Send query and await results from DuckDB
		getQuery = async (query: string) => {
			const conn = await connectionPromise;

			if (conn) {
				const results = await conn.query(query);
				const array: Object[] = results.toArray(); // list of objects, compatible with OJS

				conn.close();

				return array;
			}

			return null;
		};
	});
</script>

<h1>Bluebike data</h1>

{#if getQuery !== null}
	<h3>How many bike rides have been taken each day of the week?</h3>
	<TripsByDayChart {getQuery} />
	<h3>How many bike rides have been taken each year?</h3>

	<TripsByYearChart {getQuery} />
	<h3>How many bike rides have been each hour?</h3>
	<TripsByHour {getQuery} />
{/if}
