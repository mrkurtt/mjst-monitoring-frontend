import React, { createContext, useContext, useState } from 'react';

export interface Editor {
	_id: string;
	firstname: string;
	middlename: string;
	lastname: string;
	position: string;
	email: string;
	department: string;
	profileLink: string;
}

interface EditorsContextType {
	editors: Editor[];
	addEditor: (editor: Editor) => void;
	removeEditor: (id: string) => void;
	updateEditor: (id: string, editor: Editor) => void;
}

const EditorsContext = createContext<EditorsContextType>({
	editors: [],
	addEditor: () => {},
	removeEditor: () => {},
	updateEditor: () => {},
});

export const useEditors = () => useContext(EditorsContext);

export const EditorsProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [editors, setEditors] = useState<Editor[]>([]);

	const addEditor = (editor: Editor) => {
		setEditors([...editors, editor]);
	};

	const removeEditor = (id: string) => {
		setEditors(editors.filter((editor) => editor._id !== id));
	};

	const updateEditor = (id: string, updatedEditor: Editor) => {
		setEditors(
			editors.map((editor) => (editor._id === id ? updatedEditor : editor))
		);
	};

	return (
		<EditorsContext.Provider
			value={{ editors, addEditor, removeEditor, updateEditor }}
		>
			{children}
		</EditorsContext.Provider>
	);
};
