import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

export default new Stripe(
	env.SECRET_STRAPI_API_KEY ||
		'sk_test_51MD5uXBFf10upAzq3VmGIc6Zv1c0MdDJuwO4CVBfMRsR51lyEWYVaQsxcAQu4ZPRzPtXaFOSKQPRCIXBMsEqxh5700xMBXKVV3',
	{
		apiVersion: '2022-11-15'
	}
);
