export const ssr = false;
import type { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
import { initDB } from '../lib/duckdb';

export async function load({ params }) {
	const parquetUrl = new URL('/all_trips.parquet', import.meta.url).href;

	let conn_prom: Promise<AsyncDuckDBConnection> | null; // Declare globally so promise can be awaited anywhere
	const load_db = async () => {
		if (conn_prom) {
			return conn_prom; // Return existing promise, if any
		}

		// Initialize database
		const db = await initDB();
		await db.registerFileURL('all_trips.parquet', parquetUrl, 4, false);
		conn_prom = db.connect(); // Open a connection (promise)
		return conn_prom;
	};

	// Send query and await results from DuckDB
	const getQuery = async (q: string) => {
		const conn = await conn_prom;
		if (conn) {
			const results = await conn.query(q);
			return results;
		}
		return null;
	};

	const db = await load_db();

	return {
		getQuery
	};
}
