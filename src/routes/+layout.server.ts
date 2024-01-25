import { env } from '$env/dynamic/public';

export function load() {
	return {
		under_maintenance: env.PUBLIC_MAINTENANCE == 'true'
	};
}
