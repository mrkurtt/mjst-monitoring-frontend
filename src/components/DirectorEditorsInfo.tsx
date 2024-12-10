import React from 'react';
import { User, ExternalLink } from 'lucide-react';
import { useEditors } from '../contexts/EditorsContext';

const DirectorEditorsInfo: React.FC = () => {
  const { editors } = useEditors();

  return (
    <div className="editors-info-container">
      <div className="bg-white p-6 rounded-lg shadow-md">
        {editors.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No editors available.</p>
        ) : (
          <div className="space-y-4">
            {editors.map((editor) => (
              <div key={editor.id} className="flex items-center bg-gray-100 p-4 rounded-lg">
                <div className="flex-shrink-0 mr-4">
                  <User size={40} className="text-gray-500" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold">
                    {`${editor.firstName} ${editor.middleName} ${editor.lastName}`}
                  </h3>
                  <p className="text-blue-600 font-medium">{editor.position}</p>
                  <p className="text-gray-600">{editor.department}</p>
                  <p className="text-gray-500">{editor.email}</p>
                </div>
                {editor.profileLink && (
                  <div className="flex-shrink-0">
                    <a
                      href={editor.profileLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 flex items-center"
                    >
                      <ExternalLink size={20} className="mr-1" />
                      Profile
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectorEditorsInfo;