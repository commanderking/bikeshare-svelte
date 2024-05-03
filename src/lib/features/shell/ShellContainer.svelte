<script lang="ts">
	import { onMount } from 'svelte';
	import 'xterm/css/xterm.css';
	import shell_wasm from '@duckdb/duckdb-wasm-shell/dist/shell_bg.wasm?url';
	import * as shell from '@duckdb/duckdb-wasm-shell';
	import { initDB } from '$lib/duckdb';
	import { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
	import { dev } from '$app/environment';

	let shellContainer: HTMLDivElement;
	let connectionPromise: Promise<AsyncDuckDBConnection> | null;

	let db: AsyncDuckDB;

	onMount(async () => {
		const parquetUrl = new URL('local/all_trips.parquet', window.location.origin).href;
		await shell.embed({
			shellModule: shell_wasm,
			container: shellContainer,

			resolveDatabase: async () => {
				db = await initDB();
				await db.registerFileURL('all_trips.parquet', parquetUrl, 4, false);
				connectionPromise = db.connect();
				return db;
			}
		});
	});
</script>

<div>
	<h1 id="shellHeader">Terminal</h1>
	<div class="shellContainer"><div id="shell" bind:this={shellContainer} /></div>
</div>

<style>
	.shellContainer {
		width: '50%';
		overflow: 'scroll';
		padding: 16px 0 0 20px;
		background-color: #333;
	}
</style>
