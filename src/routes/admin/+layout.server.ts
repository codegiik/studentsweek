import { redirect } from '@sveltejs/kit';
import { getUserProfile } from '$lib/server/utils';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const access_token = cookies.get('access_token');

	if (!access_token) throw redirect(302, '/login');

	const [user, profile] = await getUserProfile(access_token);

	if (!user) throw redirect(302, '/login');

	if (profile?.role !== 'admin' && !url.pathname.startsWith('/admin/setup'))
		throw redirect(302, '/admin/setup');

	if (profile?.role == 'admin' && url.pathname.startsWith('/admin/setup'))
		throw redirect(302, '/admin');

	return;
};
