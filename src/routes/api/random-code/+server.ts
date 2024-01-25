import type { RequestHandler } from '@sveltejs/kit';
import wordlist from '$lib/assets/wordlist.json';

const N_OF_WORDS = 4;

const generateCode = () => {
	const extracted: Record<string, boolean> = {};

	while (Object.values(extracted).length < N_OF_WORDS) {
		const word = wordlist[Math.floor(Math.random() * wordlist.length)];
		extracted[word] = true;
	}

	return Object.keys(extracted).join('-');
};

export const GET: RequestHandler = ({ url }) => {
	let qta = Number(url.searchParams.get('qta') ?? 1);
	if (qta <= 0 || qta > 10000) qta = 1;
	return new Response(
		JSON.stringify({
			qta,
			codes: Array.from({ length: qta }).map(generateCode)
		})
	);
};
