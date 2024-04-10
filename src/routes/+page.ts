export const ssr = false;
import type { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
import { initDB } from '$lib/duckdb';

export async function load({ params }) {
	const parquetUrl = new URL('/all_trips.parquet', import.meta.url).href;

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
