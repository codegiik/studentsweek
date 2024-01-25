import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }): { columns: string | null } => {
	const columns = url.searchParams.get('cols');

	return {
		columns
	};
};
