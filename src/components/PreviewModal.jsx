import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaDownload, FaEdit } from 'react-icons/fa';

const PreviewModal = ({ 
  isOpen, 
  onClose, 
  originalText, 
  formattedText, 
  onAccept, 
  onReject,
  onDownload 
}) => {
  const [text, setText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    setText(formattedText);
  }, [formattedText]);
  
  if (!isOpen) return null;
  
  const handleTextChange = (e) => {
    setText(e.target.value);
  };
  
  const handleAccept = () => {
    onAccept(text);
  };
  
  const handleDownload = () => {
    onDownload(text);
  };
  
  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Formatted Text Preview</h2>
          <button 
            onClick={toggleEditing}
            className="text-primary-500 hover:text-primary-600 flex items-center"
          >
            <FaEdit className="mr-1" />
            {isEditing ? 'View' : 'Edit'}
          </button>
        </div>
        
        <div className="flex-grow overflow-auto p-4">
          {isEditing ? (
            <textarea
              value={text}
              onChange={handleTextChange}
              className="w-full h-full min-h-[300px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          ) : (
            <div className="prose max-w-none">
              {text.split('\n\n').map((paragraph, i) => (
                <React.Fragment key={i}>
                  {paragraph.startsWith('•') ? (
                    <ul className="list-disc pl-5 my-2">
                      {paragraph.split('\n').map((item, j) => (
                        <li key={j} className="my-1">{item.replace('• ', '')}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="my-2">{paragraph}</p>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-between">
          <div>
            <button
              onClick={onReject}
              className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium bg-red-500 text-white hover:bg-red-600 mr-2"
            >
              <FaTimes className="mr-2 h-4 w-4" />
              Reject
            </button>
            <button
              onClick={handleAccept}
              className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium bg-primary-500 text-white hover:bg-primary-600"
            >
              <FaCheck className="mr-2 h-4 w-4" />
              Accept
            </button>
          </div>
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium bg-green-500 text-white hover:bg-green-600"
          >
            <FaDownload className="mr-2 h-4 w-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
