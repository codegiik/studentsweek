import { getUserProfile } from '$lib/server/utils';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const access_token = cookies.get('access_token');

	if (!access_token) throw redirect(302, '/login');

	const [user, profile] = await getUserProfile(access_token);

	if (!profile || !user || !profile.rules || !profile.loc) throw redirect(302, '/login');

	if (profile.role === 'admin') throw redirect(302, '/admin');

	return;
};
