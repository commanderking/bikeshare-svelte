// Based off this example for using DuckDB-Wasm with SvelteKit:
// https://github.com/duckdb-wasm-examples/sveltekit-typescript

// I think this code needs to be kept apart from the App.svelte to function?
// Either way, it's neater to keep the worker and logger imports separate from everything else

import * as duckdb from '@duckdb/duckdb-wasm';

import duckdb_wasm from '/node_modules/@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';

import duckdb_worker from '/node_modules/@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?worker';

import shell_wasm from '@duckdb/duckdb-wasm-shell/dist/shell_bg.wasm?url';

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
	// eh: {
	// 	mainModule: duckdb_wasm_eh,
	// 	mainWorker: new URL(
	// 		'@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?worker',
	// 		import.meta.url
	// 	).toString()
	// }
};

let db: AsyncDuckDB | null = null;
let shell;
const initDB = async () => {
	// vite can't handle commonjs module
	shell = (await import('@duckdb/duckdb-wasm-shell')).default;
	if (db) {
		return db; // Return existing database, if any
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

export { initDB }; // so we can import this elsewhere
