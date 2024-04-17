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
	import { type GetQuery } from '$lib/types/queries';

	let shellContainer: HTMLDivElement;
	let getQuery: GetQuery | null = null;

	onMount(async () => {
		const parquetUrl = new URL('local/all_trips.parquet', window.location.origin).href;

		// SELECT start_time, stop_time FROM all_trips.parquet LIMIT 100;
		await shell.embed({
			shellModule: shell_wasm,
			container: shellContainer,
			resolveDatabase: async (props) => {
				const db = await initDB();
				await db.registerFileURL('all_trips.parquet', parquetUrl, 4, false);
				// connectionPromise = db.connect(); // Open a connection (promise)

				return db;
			}
		});

		let connectionPromise: Promise<AsyncDuckDBConnection> | null;

		// For now, initiate separate db for querying. Otherwise, querying here will block the terminal
		const loadQueryDb = async () => {
			console.log('loading db');
			if (connectionPromise) {
				return connectionPromise; // Return existing promise, if any
			}

			// Initialize database
			const db = await initDB();
			await db.registerFileURL('all_trips.parquet', parquetUrl, 4, false);
			connectionPromise = db.connect(); // Open a connection (promise)

			return connectionPromise;
		};

		await loadQueryDb();

		// Send query and await results from DuckDB
		getQuery = async (query: string) => {
			const conn = await connectionPromise;

			console.log({ conn });
			if (conn) {
				const results = await conn.query(query);
				const array: Object[] = results.toArray(); // list of objects, compatible with OJS

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

<div class="shellContainer"><div id="shell" bind:this={shellContainer} /></div>

<style>
	.shellContainer {
		width: '100%';
		height: '100%';
		overflow: 'hidden';
		padding: 16px 0 0 20px;
		background-color: #333;
	}
</style>
