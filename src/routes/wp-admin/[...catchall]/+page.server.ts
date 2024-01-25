import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

const HACKERMAN = 'https://www.youtube.com/watch?v=KEkrWRHCDQU';

export const load: PageLoad = async () => {
	throw redirect(302, HACKERMAN);
};
