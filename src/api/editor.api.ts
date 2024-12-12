import { responseHandler } from '../components/shared/responseHandler';
import { api } from './axios';
import Cookies from 'js-cookie';

export const createEditor = async (editor: Object) => {
	try {
		const { data } = await api.post('/editor', editor, {
			headers: {
				Authorization: `Bearer ${Cookies.get('access_token')}`,
			},
		});

		return data;
	} catch (error: any) {
		responseHandler(error);
	}
};

export const getEditors = async () => {
	try {
		const { data } = await api.get('/editor', {
			headers: {
				Authorization: `Bearer ${Cookies.get('access_token')}`,
			},
		});

		return data;
	} catch (error: any) {
		responseHandler(error);
	}
};

export const updateEditor = async (id: string, updateData: Object) => {
	try {
		const { data } = await api.put(`/editor/${id}`, updateData, {
			headers: {
				Authorization: `Bearer ${Cookies.get('access_token')}`,
			},
		});

		return data;
	} catch (error: any) {
		responseHandler(error);
	}
};

export const deleteEditor = async (id: string) => {
	try {
		const { data } = await api.delete(`/editor/${id}`, {
			headers: {
				Authorization: `Bearer ${Cookies.get('access_token')}`,
			},
		});

		return data;
	} catch (error: any) {
		responseHandler(error);
	}
};
