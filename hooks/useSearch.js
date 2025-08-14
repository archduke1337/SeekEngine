import { useState, useEffect, useCallback } from 'react';

export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useApiError = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((error) => {
    if (error.name === 'AbortError') {
      // Request was cancelled, ignore
      return;
    }

    if (!error.response) {
      setError({
        title: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection.'
      });
      return;
    }

    const status = error.response.status;

    switch (status) {
      case 429:
        setError({
          title: 'Too Many Requests',
          message: 'Please wait a moment before trying again.'
        });
        break;
      case 503:
        setError({
          title: 'Service Unavailable',
          message: 'The search service is currently unavailable. Please try again later.'
        });
        break;
      default:
        setError({
          title: 'Error',
          message: 'An unexpected error occurred. Please try again.'
        });
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    isLoading,
    setIsLoading,
    handleError,
    clearError
  };
};

export const useVoiceSearch = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Voice search is not supported in this browser.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setError('Error occurred in recognition: ' + event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
      recognition.abort();
    };
  }, []);

  const startListening = () => {
    setError(null);
    setTranscript('');
    const recognition = new window.webkitSpeechRecognition();
    recognition.start();
  };

  return {
    isListening,
    transcript,
    error,
    startListening
  };
};
