import { responseHandler } from '../components/shared/responseHandler';
import { api } from './axios';
import Cookies from 'js-cookie';

/***
    params
    email: string
    password: string
***/
export const login = async (user: Object) => {
	try {
		const { data } = await api.post('/auth/login', user);

		// responseHandler(data);

		Cookies.set('access_token', data.data.token, {
			expires: 7,
			secure: true,
		});

		Cookies.set('role', data.data.user.role, {
			expires: 7,
			secure: true,
		});

		return data;
	} catch (error: any) {
		responseHandler(error);
	}
};

/***
    params
    email: string
    password: string
    role: 0 - director | 1 - staff
***/
export const registerUser = async (user: Object) => {
	try {
		const { data } = await api.post('/auth/register', user);
		responseHandler(data);

		return data;
	} catch (error: any) {
		responseHandler(error);
	}
};
