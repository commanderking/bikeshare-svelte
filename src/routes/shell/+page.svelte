<script lang="ts">
	import { format } from 'sql-formatter';
	import { onMount } from 'svelte';
	import 'xterm/css/xterm.css';
	import shell_wasm from '@duckdb/duckdb-wasm-shell/dist/shell_bg.wasm?url';
	import * as shell from '@duckdb/duckdb-wasm-shell';
	import { initDB } from '$lib/duckdb';
	import type { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';

	let shellContainer: HTMLDivElement;
	let handleQuerySubmit: (event: SubmitEvent) => Promise<void>;
	let connectionPromise: Promise<AsyncDuckDBConnection> | null;
	let linkHtml: HTMLAnchorElement;
	const link = null;

	const yearlRidesQuery = `
        SELECT
        strftime('%Y', start_time) as year,
        COUNT(*) as trips
        FROM 
        all_trips.parquet
        GROUP BY
        year
        ORDER BY 
        year ASC;
    `;

	const describeQuery = `DESCRIBE SELECT * FROM all_trips.parquet;`;

	onMount(async () => {
		const parquetUrl = new URL('local/all_trips.parquet', window.location.origin).href;

		await shell.embed({
			shellModule: shell_wasm,
			container: shellContainer,

			resolveDatabase: async () => {
				const db = await initDB();
				await db.registerFileURL('all_trips.parquet', parquetUrl, 4, false);
				connectionPromise = db.connect();

				handleQuerySubmit = async (event: SubmitEvent) => {
					const conn = await connectionPromise;

					if (conn) {
						const fileName = `blueBikes_${new Date().toISOString().slice(0, 10)}`;
						await conn.send(
							`COPY (SELECT * FROM all_trips.parquet LIMIT 100) TO '${fileName}' (FORMAT 'parquet');`
						);

						const parquet_buffer = await db.copyFileToBuffer(fileName);
						const filePath = URL.createObjectURL(new Blob([parquet_buffer]));

						linkHtml.href = filePath;

						await conn.close();
					}
				};

				return db;
			}
		});
	});
</script>

<div class="pageContainer">
	<h1>Investigate Every Bluebike Trip since May, 2018!</h1>
	<p>
		In the <a href="#shellHeader">terminal</a> below, you can run SQL queries on every single Boston
		Bluebike trip since May, 2018. All queres are run through
		<a target="_blank" href="https://duckdb.org/2021/10/29/duckdb-wasm">DuckDB-Wasm</a>, an in
		browser database that you can query with SQL. For example, to query the number of trips in May,
		2023, copy and paste the following into the shell:
	</p>
	<pre>{format(yearlRidesQuery, { language: 'mysql' })}</pre>

	<h3>Data Characteristics</h3>
	<p>The all_trips.parquet file has been registered with duckdb so you can query it directly.</p>
	<p>For a description of all possible columns, run:</p>
	<pre>{describeQuery}</pre>

	<h3>Export your data</h3>
	<p>
		Have a query whose data you'd like to export? Submit the query here nd we'll create a parquet
		file to download.
	</p>
	<form on:submit|preventDefault={handleQuerySubmit}>
		<label for="query">Query</label>
		<input type="text" id="fname" name="query" value="" />
		<input type="submit" value="Submit" />
	</form>
	<a download="results.parquet" href={link} bind:this={linkHtml}>Download</a>
	<h1 id="shellHeader">Terminal</h1>
	<div class="shellContainer"><div id="shell" bind:this={shellContainer} /></div>
</div>

<style>
	.pageContainer {
		width: 70%;
		margin: auto;
		font-size: 20px;
	}
	.shellContainer {
		width: '50%';
		overflow: 'scroll';
		padding: 16px 0 0 20px;
		background-color: #333;
	}

	pre {
		font-size: 14px;
		padding: 16px;
		background-color: lightgray;
	}
</style>
