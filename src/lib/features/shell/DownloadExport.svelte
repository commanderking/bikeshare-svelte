<script lang="ts">
	import { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';

	export let connectionPromise: Promise<AsyncDuckDBConnection> | null;
	export let db: AsyncDuckDB;
	type Link = { href: string; fileName: string };
	$: links = [] as Link[];
	let handleQuerySubmit: (event: SubmitEvent) => Promise<void>;

	// Code for handling submitting a query for download. Still a few issues
	// 1. One submission works fine, but second submission of the same query will throw error
	handleQuerySubmit = async (event: SubmitEvent) => {
		if (!event.target) {
			return;
		}
		const conn = await connectionPromise;

		event.target;

		// Typescript doesn't seem to have an event where event.target is typed as an HTMLFormElement, so casting here is necessary
		const formData = new FormData(event.target as HTMLFormElement);

		const query = formData.get('query');
		if (conn) {
			const fileName = `blueBikes_${new Date().toISOString().slice(0, 10)}_${Date.now()}.parquet`;

			const copyQuery = `COPY (${query}) TO '${fileName}' (FORMAT 'parquet');`;
			const parquet_buffer = await db.copyFileToBuffer(fileName);
			const filePath = URL.createObjectURL(new Blob([parquet_buffer]));
			links = [...links, { href: filePath, fileName }];

			await db.dropFile(fileName);
			await conn.close();
		}
	};
</script>

<div>
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
	{#each links as link}
		<a href={link.href} target="_blank" download={link.fileName}>Download Ready</a>
	{/each}
</div>
