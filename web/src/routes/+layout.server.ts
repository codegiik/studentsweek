import { env } from '$env/dynamic/public';

export const prerender = false;

export function load() {
	return {
		under_maintenance: env.PUBLIC_MAINTENANCE == 'true'
	};
}
