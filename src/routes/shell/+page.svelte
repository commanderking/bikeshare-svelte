<script lang="ts">
	import { format } from 'sql-formatter';
	import 'xterm/css/xterm.css';
	import { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';

	import ShellContainer from '$lib/features/shell/ShellContainer.svelte';
	type Link = { href: string; fileName: string };

	let db: AsyncDuckDB;

	$: links = [] as Link[];

	console.log({ links });

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
</script>

<div class="pageContainer">
	<h1>Investigate Every Bluebike Trip since May, 2018!</h1>
	<p>
		In the <a href="#shellHeader">terminal</a> below, you can run SQL queries on every single Boston
		Bluebike trip since May, 2018. All queries are run through
		<a target="_blank" href="https://duckdb.org/2021/10/29/duckdb-wasm">DuckDB-Wasm</a>, an in
		browser database that you can query with SQL. For example, to query the number of trips in May,
		2023, copy and paste the following into the shell:
	</p>
	<pre>{format(yearlRidesQuery, { language: 'mysql' })}</pre>

	<h3>Data Characteristics</h3>
	<p>
		The all_trips.parquet file, which contains the data for all trips, has been registered with
		duckdb so you can query it directly. For a description of all possible columns that you can
		grab, run:
	</p>
	<pre>{describeQuery}</pre>

	<p>
		If you wish to download the parquet file to do your own analysis locally, you can do so <a
			href="./local/all_trips.parquet"
			target="_blank"
			download="all_bluebike_trips.parquet">here</a
		>.
	</p>
	<div>
		<ShellContainer />
	</div>
</div>

<style>
	.pageContainer {
		width: 70%;
		margin: auto;
		font-size: 20px;
	}

	pre {
		font-size: 14px;
		padding: 16px;
		background-color: lightgray;
	}
</style>
