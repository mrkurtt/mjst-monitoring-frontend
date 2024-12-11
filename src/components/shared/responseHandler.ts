import toast from 'react-hot-toast';

interface ToasterProps {
	success: boolean;
	message: string;
}

const AppToaster = ({ success = true, message }: ToasterProps) => {
	if (success) {
	} else {
		toast.error(message);
	}
};

export default AppToaster;

export const responseHandler = (res: any) => {
	if (res.status === 200 || res.status === 201) {
		toast.success(res.message);
	} else {
		toast.error(res.message);
	}
};
