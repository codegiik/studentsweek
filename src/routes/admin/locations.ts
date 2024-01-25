import { firestore } from '$lib/firebase';
import type { SchoolLocation } from '$lib/interfaces';
import currentUser, { specialUnpackMulti } from '$lib/user';
import { asyncDerivedStream } from '$lib/utils';
import { collection, CollectionReference, getDocs } from 'firebase/firestore';

const { school } = currentUser;

export const locations = asyncDerivedStream(
	school,
	async ($school) => {
		if ($school) {
			const docs = await getDocs<SchoolLocation>(
				collection(
					firestore,
					'schools',
					$school._.id,
					'locations'
				) as CollectionReference<SchoolLocation>
			);
			return specialUnpackMulti<SchoolLocation>(docs.docs);
		}
	},
	null
);
