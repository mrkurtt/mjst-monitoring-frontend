import { responseHandler } from '../components/shared/responseHandler';
import { api } from './axios';
import Cookies from 'js-cookie';

export const createReviewer = async (reviewer: Object) => {
	try {
		const { data } = await api.post('/reviewer', reviewer, {
			headers: {
				Authorization: `Bearer ${Cookies.get('access_token')}`,
			},
		});

		responseHandler(data);

		return data;
	} catch (error: any) {
		responseHandler(error);
	}
};

export const getReviewers = async () => {
	try {
		const { data } = await api.get('/reviewer', {
			headers: {
				Authorization: `Bearer ${Cookies.get('access_token')}`,
			},
		});

		return data;
	} catch (error: any) {
		responseHandler(error);
	}
};

export const updateReviewer = async (id: string, updateData: Object) => {
	try {
		const { data } = await api.put(`/reviewer/${id}`, updateData, {
			headers: {
				Authorization: `Bearer ${Cookies.get('access_token')}`,
			},
		});

		responseHandler(data);

		return data;
	} catch (error: any) {
		responseHandler(error);
	}
};

export const deleteReviewer = async (id: string) => {
	try {
		const { data } = await api.delete(`/reviewer/${id}`, {
			headers: {
				Authorization: `Bearer ${Cookies.get('access_token')}`,
			},
		});

		responseHandler(data);

		return data;
	} catch (error: any) {
		responseHandler(error);
	}
};
