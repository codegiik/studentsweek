import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	return {
		success: url.searchParams.get('success'),
		schoolId: url.searchParams.get('schoolId')
	};
};
