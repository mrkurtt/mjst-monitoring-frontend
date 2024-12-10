import React, { createContext, useContext, useState } from 'react';

interface Editor {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  position: string;
  email: string;
  department: string;
  profileLink: string;
}

interface EditorsContextType {
  editors: Editor[];
  addEditor: (editor: Editor) => void;
  removeEditor: (id: number) => void;
  updateEditor: (id: number, editor: Editor) => void;
}

const EditorsContext = createContext<EditorsContextType>({
  editors: [],
  addEditor: () => {},
  removeEditor: () => {},
  updateEditor: () => {},
});

export const useEditors = () => useContext(EditorsContext);

export const EditorsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [editors, setEditors] = useState<Editor[]>([]);

  const addEditor = (editor: Editor) => {
    setEditors([...editors, editor]);
  };

  const removeEditor = (id: number) => {
    setEditors(editors.filter(editor => editor.id !== id));
  };

  const updateEditor = (id: number, updatedEditor: Editor) => {
    setEditors(editors.map(editor => 
      editor.id === id ? updatedEditor : editor
    ));
  };

  return (
    <EditorsContext.Provider value={{ editors, addEditor, removeEditor, updateEditor }}>
      {children}
    </EditorsContext.Provider>
  );
};