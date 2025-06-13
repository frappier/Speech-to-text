import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop, FaCopy, FaDownload, FaTrash, FaInfoCircle, FaSignOutAlt } from 'react-icons/fa';
import WelcomeScreen from './WelcomeScreen';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef(null);
  const isListeningRef = useRef(false); // Add this ref to track listening state

  useEffect(() => {
    // Update the ref whenever isListening changes
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    // Check if browser supports SpeechRecognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript((prev) => {
        // Remove any interim results from previous update
        const cleanPrev = prev.replace(/<span class="interim">.*?<\/span>/g, '');
        return cleanPrev + finalTranscript + (interimTranscript ? `<span class="interim">${interimTranscript}</span>` : '');
      });
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access to use this feature.');
      }
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      // Only restart if we're still in listening mode
      // Use the ref instead of the state to avoid closure issues
      if (isListeningRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error('Error restarting speech recognition:', error);
          setIsListening(false);
        }
      }
    };

    // Start or stop recognition based on isListening state
    if (isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
      }
    } else if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
        }
      }
    };
  }, [isListening]); // This dependency ensures the effect runs when isListening changes

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTranscript('');
    }
  };

  const handleCopy = () => {
    // Create a temporary element to strip HTML tags
    const tempElement = document.createElement('div');
    tempElement.innerHTML = transcript;
    const textToCopy = tempElement.textContent || tempElement.innerText || '';
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert('Transcript copied to clipboard!');
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  };

  const handleDownload = () => {
    // Create a temporary element to strip HTML tags
    const tempElement = document.createElement('div');
    tempElement.innerHTML = transcript;
    const textToDownload = tempElement.textContent || tempElement.innerText || '';
    
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcript.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the transcript?')) {
      setTranscript('');
    }
  };

  const handleExit = () => {
    if (transcript && confirm('Are you sure you want to exit? Your transcript will be lost.')) {
      setTranscript('');
      setIsListening(false);
      setShowWelcome(true);
    } else if (!transcript) {
      setShowWelcome(true);
    }
  };

  const handleTranscriptChange = (e) => {
    setTranscript(e.target.innerHTML);
  };

  if (showWelcome) {
    return <WelcomeScreen onGetStarted={() => setShowWelcome(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" x2="12" y1="19" y2="22"></line>
            </svg>
            <h1 className="text-xl font-bold text-gray-900">SpeakText</h1>
          </div>
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaInfoCircle className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {showInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 fade-in">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">How to use SpeakText</h2>
              <ol className="list-decimal pl-5 space-y-1 text-blue-700">
                <li>Click the microphone button to start recording</li>
                <li>Speak clearly into your microphone</li>
                <li>Your speech will be transcribed in real-time</li>
                <li>Click the stop button when you're finished</li>
                <li>Edit the text directly if needed</li>
                <li>Use the buttons below to copy or download your transcript</li>
              </ol>
            </div>
          )}

          {!isSupported ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Browser Not Supported</h2>
              <p className="text-red-700">
                Your browser doesn't support the Speech Recognition API. 
                Please try using Chrome, Edge, or Safari for the best experience.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <button
                  onClick={toggleListening}
                  className={`inline-flex items-center justify-center p-4 rounded-full shadow-lg transition-all duration-300 ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600 text-white pulse-animation' 
                      : 'bg-primary-500 hover:bg-primary-600 text-white'
                  }`}
                  aria-label={isListening ? "Stop recording" : "Start recording"}
                >
                  {isListening ? (
                    <FaStop className="h-8 w-8" />
                  ) : (
                    <FaMicrophone className="h-8 w-8" />
                  )}
                </button>
                <p className="mt-2 text-sm text-gray-600">
                  {isListening ? 'Listening... Click to stop' : 'Click to start recording'}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div
                  ref={transcriptRef}
                  contentEditable="true"
                  className="transcript-area w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  dangerouslySetInnerHTML={{ __html: transcript || '<p class="text-gray-400">Your transcript will appear here...</p>' }}
                  onInput={handleTranscriptChange}
                  aria-label="Editable transcript"
                ></div>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={handleCopy}
                  disabled={!transcript}
                  className={`inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium ${
                    transcript 
                      ? 'bg-secondary-500 text-white hover:bg-secondary-600' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FaCopy className="mr-2 h-4 w-4" />
                  Copy to Clipboard
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!transcript}
                  className={`inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium ${
                    transcript 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FaDownload className="mr-2 h-4 w-4" />
                  Download as Text
                </button>
                <button
                  onClick={handleClear}
                  disabled={!transcript}
                  className={`inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium ${
                    transcript 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FaTrash className="mr-2 h-4 w-4" />
                  Clear
                </button>
                <button
                  onClick={handleExit}
                  className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium bg-gray-500 text-white hover:bg-gray-600"
                >
                  <FaSignOutAlt className="mr-2 h-4 w-4" />
                  Exit
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            SpeakText - Modern Voice Transcription | Built with Web Speech API
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
