import * as duckdb from '@duckdb/duckdb-wasm';

import duckdb_wasm from '/node_modules/@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';

// import shell_wasm from '@duckdb/duckdb-wasm-shell/dist/shell_bg.wasm?url';

import type { AsyncDuckDB } from '@duckdb/duckdb-wasm';

const DUCKDB_BUNDLES: duckdb.DuckDBBundles = {
	mvp: {
		mainModule: duckdb_wasm,
		mainWorker: new URL(
			'@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js',
			import.meta.url
		).toString()
	}
	// There are import issues that I have yet to resolve - likely due to vite and how it imports these workers
	// eh: {
	// 	mainModule: duckdb_wasm_eh,
	// 	mainWorker: new URL(
	// 		'@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?worker',
	// 		import.meta.url
	// 	).toString()
	// }
};

let db: AsyncDuckDB | null = null;
const initDB = async () => {
	if (db) {
		return db;
	}

	const bundle = await duckdb.selectBundle(DUCKDB_BUNDLES);

	// Instantiate worker
	const logger = new duckdb.ConsoleLogger();
	const worker = new Worker(bundle.mainWorker!);

	// and asynchronous database
	db = new duckdb.AsyncDuckDB(logger, worker);
	await db.instantiate(duckdb_wasm);
	return db;
};

export { initDB };
