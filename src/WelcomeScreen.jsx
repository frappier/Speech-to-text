import React from 'react';
import { FaMicrophone } from 'react-icons/fa';

const WelcomeScreen = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-8 flex justify-center">
            <div className="bg-green-50 p-4 rounded-full">
              <FaMicrophone className="h-16 w-16 text-green-500" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-green-600 mb-4">Welcome to SpeakText</h1>
          
          <p className="text-xl text-green-700 mb-6">
            Transform your voice into text instantly with our modern transcription tool.
          </p>
          
          <p className="text-green-600 mb-8">
            Speak clearly, edit easily, and share your transcriptions with just a few clicks.
          </p>
          
          <button
            onClick={onGetStarted}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
          >
            Get Started
          </button>
        </div>
      </div>
      
      <footer className="bg-white border-t border-gray-100 py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-green-500">
            SpeakText - Modern Voice Transcription | Built with Web Speech API
          </p>
        </div>
      </footer>
    </div>
  );
};

export default WelcomeScreen;
