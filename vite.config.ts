import { sveltekit } from '@sveltejs/kit/vite';
import preprocess from 'svelte-preprocess';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	preprocess: preprocess(),
	kit: {
		paths: {
			base: '/sveltekit-typescript'
		},
		prerender: {
			default: true
		},
		appDir: 'internal' // For github pages: https://www.npmjs.com/package/@sveltejs/adapter-static/v/next
	}
};

export default config;
