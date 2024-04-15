<script lang="ts">
	import 'xterm/css/xterm.css';

	import TripsByDayChart from '$lib/features/tripsByDay/TripsByDayChart.svelte';
	import TripsByYearChart from '$lib/features/tripsByYear/Chart.svelte';
	import TripsByHour from '$lib/features/tripsByHour/Chart.svelte';

	import shell_wasm from '@duckdb/duckdb-wasm-shell/dist/shell_bg.wasm?url';
	import * as shell from '@duckdb/duckdb-wasm-shell';
	import { onMount } from 'svelte';
	import type { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
	import { initDB } from '$lib/duckdb';

	export let data;

	let shellContainer: HTMLDivElement;
	let getQuery = null;

	onMount(async () => {
		console.log('mounting');
		const parquetUrl = new URL('local/all_trips.parquet', window.location.origin).href;

		let connectionPromise: Promise<AsyncDuckDBConnection> | null; // Declare globally so promise can be awaited anywhere
		// const loadDb = async () => {
		// 	if (connectionPromise) {
		// 		return connectionPromise; // Return existing promise, if any
		// 	}

		// 	// Initialize database
		// 	const db = await initDB();
		// 	await db.registerFileURL('all_trips.parquet', parquetUrl, 4, false);
		// 	connectionPromise = db.connect(); // Open a connection (promise)

		// 	return connectionPromise;
		// };

		// SELECT start_time, stop_time FROM all_trips.parquet LIMIT 100;
		await shell.embed({
			shellModule: shell_wasm,
			container: shellContainer,
			resolveDatabase: async (props) => {
				const db = await initDB();
				await db.registerFileURL('all_trips.parquet', parquetUrl, 4, false);
				connectionPromise = db.connect(); // Open a connection (promise)

				return db;
			}
		});

		// Send query and await results from DuckDB
		getQuery = async (query: string) => {
			const conn = await connectionPromise;
			if (conn) {
				const results = await conn.query(query);
				return results;
			}
			return null;
		};
	});
</script>

<!-- <h1>Bluebike data</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p> -->

<div class="container"><div id="shell" bind:this={shellContainer} /></div>

<!-- {#if getQuery !== null}
	<TripsByDayChart {getQuery} />
	<TripsByYearChart {getQuery} />
	<TripsByHour {getQuery} />
{/if} -->

<style>
	.container {
		width: '100%';
		height: '100%';
		overflow: 'hidden';
		padding: 16px 0 0 20px;
		background-color: #333;
	}
</style>
