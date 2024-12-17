import { responseHandler } from '../components/shared/responseHandler';
import { api } from './axios';
import Cookies from 'js-cookie';

export const createRating = async (rating: Object) => {
	try {
		const { data } = await api.post('/rating', rating, {
			headers: {
				Authorization: `Bearer ${Cookies.get('access_token')}`,
			},
		});

		return data;
	} catch (error) {
		responseHandler(error);
	}
};

export const getRating = async (manuscriptId: string, reviewerId: string) => {
	try {
		const { data } = await api.get('/rating', {
			params: {
				manuscriptId,
				reviewerId,
			},
			headers: {
				Authorization: `Bearer ${Cookies.get('access_token')}`,
			},
		});

		return data;
	} catch (error) {
		// responseHandler(error);
	}
};
