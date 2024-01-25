import { resolve } from 'path';
import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [sveltekit()],
	resolve: {
		alias: {
			$styles: resolve('./src/styles')
		}
	}
};

export default config;
