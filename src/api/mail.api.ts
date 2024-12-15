import { responseHandler } from '../components/shared/responseHandler';
import { api } from './axios';
import Cookies from 'js-cookie';

export const sendMail = async (mailData: Object) => {
	try {
		const { data } = await api.post('/mail', mailData, {
			headers: {
				Authorization: `Bearer ${Cookies.get('access_token')}`,
			},
		});

		return data;
	} catch (error) {
		responseHandler(error);
	}
};
