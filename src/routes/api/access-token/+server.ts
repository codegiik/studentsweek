import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler<{
	success?: string;
	error?: string;
}> = async ({ url, cookies }) => {
	const access_token = url.searchParams.get('at');
	if (access_token) {
		cookies.set('access_token', access_token, {
			path: '/'
		});
		return json({ success: true, access_token });
	} else {
		return json(
			{
				error: 'No access token provided'
			},
			{
				status: 400
			}
		);
	}
};

export const DELETE: RequestHandler = async ({ cookies }) => {
	cookies.delete('access_token', {
		path: '/'
	});
	return json({ success: true });
};
