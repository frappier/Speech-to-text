import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop, FaCopy, FaDownload, FaTrash, FaInfoCircle, FaSignOutAlt, FaMagic } from 'react-icons/fa';
import WelcomeScreen from './WelcomeScreen';
import PreviewModal from './components/PreviewModal';
import { formatTranscript } from './utils/textFormatter';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [formattedText, setFormattedText] = useState('');
  const [acceptedText, setAcceptedText] = useState('');
  const recognitionRef = useRef(null);
  const transcriptRef = useRef(null);
  const isListeningRef = useRef(false);

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
      setAcceptedText('');
    }
  };

  const handleCopy = () => {
    // Use accepted text if available, otherwise use the current transcript
    const textToCopy = acceptedText || getPlainText(transcript);
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert('Transcript copied to clipboard!');
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  };

  const getPlainText = (html) => {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = html;
    return tempElement.textContent || tempElement.innerText || '';
  };

  const handleDownload = (text = null) => {
    try {
      // Use provided text, accepted text, or current transcript
      const textToDownload = text || acceptedText || getPlainText(transcript);
      
      if (!textToDownload.trim()) {
        console.error('No text to download');
        return;
      }
      
      // Create a Blob with the text content
      const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
      
      // Use FileSaver.js approach (implemented manually)
      const blobURL = window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.style.display = 'none';
      tempLink.href = blobURL;
      tempLink.setAttribute('download', 'transcript.txt');
      
      // Safari requires the link to be in the body
      document.body.appendChild(tempLink);
      
      // Trigger click programmatically
      tempLink.click();
      
      // Clean up
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(blobURL);
      
      console.log('Download initiated');
      
      // Close preview if open
      if (showPreview) {
        setShowPreview(false);
      }
    } catch (error) {
      console.error('Error downloading transcript:', error);
      alert('There was an error downloading your transcript. Please try again.');
    }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the transcript?')) {
      setTranscript('');
      setAcceptedText('');
    }
  };

  const handleExit = () => {
    if ((transcript || acceptedText) && confirm('Are you sure you want to exit? Your transcript will be lost.')) {
      setTranscript('');
      setAcceptedText('');
      setIsListening(false);
      setShowWelcome(true);
    } else if (!transcript && !acceptedText) {
      setShowWelcome(true);
    }
  };

  const handleTranscriptChange = (e) => {
    setTranscript(e.target.innerHTML);
  };

  const handleFormatText = () => {
    const plainText = getPlainText(transcript);
    if (!plainText.trim()) {
      alert('Please record or type some text first.');
      return;
    }
    
    const formatted = formatTranscript(plainText);
    setFormattedText(formatted);
    setShowPreview(true);
  };

  const handleAcceptFormatted = (text) => {
    setAcceptedText(text);
    setShowPreview(false);
  };

  const handleRejectFormatted = () => {
    setShowPreview(false);
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
                <li>Click "Format Text" to add punctuation and structure</li>
                <li>Review the formatted text and accept or reject it</li>
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
                
                {acceptedText && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <h3 className="text-sm font-medium text-green-800 mb-2">Formatted Text (Accepted)</h3>
                    <div className="text-green-700 whitespace-pre-line">
                      {acceptedText}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={handleFormatText}
                  disabled={!transcript}
                  className={`inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium ${
                    transcript 
                      ? 'bg-purple-500 text-white hover:bg-purple-600' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FaMagic className="mr-2 h-4 w-4" />
                  Format Text
                </button>
                <button
                  onClick={handleCopy}
                  disabled={!transcript && !acceptedText}
                  className={`inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium ${
                    transcript || acceptedText
                      ? 'bg-secondary-500 text-white hover:bg-secondary-600' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FaCopy className="mr-2 h-4 w-4" />
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => handleDownload()}
                  disabled={!transcript && !acceptedText}
                  className={`inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium ${
                    transcript || acceptedText
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FaDownload className="mr-2 h-4 w-4" />
                  Download as Text
                </button>
                <button
                  onClick={handleClear}
                  disabled={!transcript && !acceptedText}
                  className={`inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium ${
                    transcript || acceptedText
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

      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        originalText={getPlainText(transcript)}
        formattedText={formattedText}
        onAccept={handleAcceptFormatted}
        onReject={handleRejectFormatted}
        onDownload={handleDownload}
      />
    </div>
  );
}

export default App;
