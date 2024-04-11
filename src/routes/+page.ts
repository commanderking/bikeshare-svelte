export const ssr = false;
import type { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
import { initDB } from '$lib/duckdb';

export async function load({ params }) {
	// It's possible to call s3 to get the data, but it's very slow. Better approach seems a build script to build the latest parquet file from s3.
	// Below is configuration to pull from s3
	// const parquetUrl = 's3://city-bike-share/all_trips_february_2024.parquet';
	// const s3Protocol = 5;
	// await db.registerFileURL('all_trips.parquet', parquetUrl, s3Protocol, false);

	// You need to download the correct s3 parquet and load it into local. This file is too big for github. Need to add some preprocessing to get all_trips.parquet in local

	const parquetUrl = new URL('local/all_trips.parquet', window.location.origin).href;

	let connectionPromise: Promise<AsyncDuckDBConnection> | null; // Declare globally so promise can be awaited anywhere
	const loadDb = async () => {
		if (connectionPromise) {
			return connectionPromise; // Return existing promise, if any
		}

		// Initialize database
		const db = await initDB();
		await db.registerFileURL('all_trips.parquet', parquetUrl, 4, false);
		connectionPromise = db.connect(); // Open a connection (promise)

		return connectionPromise;
	};

	// Send query and await results from DuckDB
	const getQuery = async (query: string) => {
		const conn = await connectionPromise;
		if (conn) {
			const results = await conn.query(query);
			return results;
		}
		return null;
	};

	await loadDb();

	return {
		getQuery
	};
}
