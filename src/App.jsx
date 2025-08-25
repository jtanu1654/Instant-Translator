import React, { useState, useRef } from 'react';
import { Languages, Mic, MicOff, ArrowRight, Globe, Volume2 } from 'lucide-react';
import './App.css';

// This is the main application component.
const App = () => {
    // State variables for managing the app's data.
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [targetLang, setTargetLang] = useState('hi'); // Default to Hindi
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);

    // Reference to the speech recognition object
    const recognitionRef = useRef(null);

    // List of supported languages with flags/emojis
    const languages = [
        { code: 'es', name: 'Spanish', flag: '🇪🇸' },
        { code: 'fr', name: 'French', flag: '🇫🇷' },
        { code: 'de', name: 'German', flag: '🇩🇪' },
        { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
        { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
        { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
        { code: 'it', name: 'Italian', flag: '🇮🇹' },
        { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
        { code: 'ru', name: 'Russian', flag: '🇷🇺' },
        { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    ];

    const handleTranslate = async () => {
        if (!inputText.trim()) {
            setError("Please enter some text to translate.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setTranslatedText('');

        try {
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(inputText)}&langpair=en|${targetLang}`);
            
            if (!response.ok) {
                throw new Error(`Translation failed: ${response.status}`);
            }

            const data = await response.json();
            
            if (data && data.responseData && data.responseData.translatedText) {
                setTranslatedText(data.responseData.translatedText);
            } else if (data && data.responseStatus === 200) {
                setTranslatedText(data.responseData.translatedText || 'Translation not available');
            } else {
                console.log('API Response:', data);
                throw new Error('Translation service returned an unexpected response');
            }

        } catch (err) {
            console.error('Translation error:', err);
            setError(`Translation failed: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSpeechToText = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError("Your browser does not support Speech Recognition. Please use a modern browser like Chrome.");
            return;
        }

        if (!isListening) {
            setError(null);
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;
            recognition.continuous = false;

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                const speechResult = event.results[0][0].transcript;
                setInputText(speechResult);
            };

            recognition.onend = () => {
                setIsListening(false);
                if (inputText.trim()) {
                    handleTranslate();
                }
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (event.error !== 'no-speech') {
                    setError(`Speech recognition error: ${event.error}. Please ensure you have granted microphone access.`);
                }
                setIsListening(false);
            };

            recognition.start();
            recognitionRef.current = recognition;
        } else {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsListening(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#111827',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '80rem',
                backgroundColor: '#1f2937',
                borderRadius: '0.75rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid #374151',
                padding: '2rem'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        padding: '0.5rem',
                        backgroundColor: '#10b981',
                        borderRadius: '0.5rem'
                    }}>
                        <Languages style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
                    </div>
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#34d399'
                    }}>
                        Instant Translator
                    </h1>
                </div>

                {/* Main Content */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '2rem'
                }}>
                    {/* Left Column - Input Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Input Text */}
                        <div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '1rem'
                            }}>
                                <label style={{
                                    color: '#d1d5db',
                                    fontSize: '1.125rem',
                                    fontWeight: '500'
                                }}>
                                    Enter English Text
                                </label>
                                <button
                                    onClick={toggleSpeechToText}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '0.5rem',
                                        fontWeight: '500',
                                        transition: 'all 0.2s',
                                        backgroundColor: isListening ? '#dc2626' : '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = isListening ? '#b91c1c' : '#059669';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = isListening ? '#dc2626' : '#10b981';
                                    }}
                                >
                                    {isListening ? (
                                        <>
                                            <div style={{
                                                position: 'relative',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <MicOff style={{ 
                                                    width: '1rem', 
                                                    height: '1rem',
                                                    position: 'relative',
                                                    zIndex: 2
                                                }} />
                                                {/* Pulsing circles for listening effect */}
                                                <div style={{
                                                    position: 'absolute',
                                                    width: '2rem',
                                                    height: '2rem',
                                                    borderRadius: '50%',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                                    animation: 'pulse 1.5s ease-in-out infinite'
                                                }}></div>
                                                <div style={{
                                                    position: 'absolute',
                                                    width: '1.5rem',
                                                    height: '1.5rem',
                                                    borderRadius: '50%',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                    animation: 'pulse 1.5s ease-in-out infinite 0.5s'
                                                }}></div>
                                            </div>
                                            <span>Listening...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Mic style={{ width: '1rem', height: '1rem' }} />
                                            <span>Speak to Translate</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            <textarea
                                style={{
                                    width: '100%',
                                    height: '10rem',
                                    padding: '1rem',
                                    backgroundColor: '#374151',
                                    border: '1px solid #4b5563',
                                    borderRadius: '0.5rem',
                                    color: 'white',
                                    outline: 'none',
                                    resize: 'none',
                                    fontSize: '1rem'
                                }}
                                placeholder="Type or speak your text here..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />
                        </div>

                        {/* Language Selection */}
                        <div>
                            <label style={{
                                display: 'block',
                                color: '#d1d5db',
                                fontSize: '1.125rem',
                                fontWeight: '500',
                                marginBottom: '1rem'
                            }}>
                                Select Language
                            </label>
                            <select
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    backgroundColor: '#374151',
                                    border: '1px solid #4b5563',
                                    borderRadius: '0.5rem',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '1rem'
                                }}
                                value={targetLang}
                                onChange={(e) => setTargetLang(e.target.value)}
                            >
                                {languages.map((lang) => (
                                    <option key={lang.code} value={lang.code} style={{ backgroundColor: '#374151' }}>
                                        {lang.flag} {lang.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Translate Button */}
                        <button
                            onClick={handleTranslate}
                            disabled={isLoading || !inputText.trim()}
                            style={{
                                width: '100%',
                                padding: '1rem 1.5rem',
                                borderRadius: '0.5rem',
                                fontWeight: 'bold',
                                fontSize: '1.125rem',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                backgroundColor: isLoading || !inputText.trim() ? '#4b5563' : '#374151',
                                color: isLoading || !inputText.trim() ? '#9ca3af' : '#34d399',
                                border: '1px solid #4b5563',
                                cursor: isLoading || !inputText.trim() ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <div style={{
                                        width: '1.25rem',
                                        height: '1.25rem',
                                        border: '2px solid #34d399',
                                        borderTop: '2px solid transparent',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }}></div>
                                    <span>Translating...</span>
                                </>
                            ) : (
                                <>
                                    <Languages style={{ width: '1.25rem', height: '1.25rem' }} />
                                    <span>Translate</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Right Column - Output Section */}
                    <div>
                        <label style={{
                            display: 'block',
                            color: '#d1d5db',
                            fontSize: '1.125rem',
                            fontWeight: '500',
                            marginBottom: '1rem'
                        }}>
                            Translated Text
                        </label>
                        <div style={{
                            width: '100%',
                            height: '10rem',
                            padding: '1rem',
                            backgroundColor: '#374151',
                            border: '1px solid #4b5563',
                            borderRadius: '0.5rem',
                            color: 'white'
                        }}>
                            {translatedText ? (
                                <p style={{ color: 'white', fontSize: '1.125rem', lineHeight: '1.75' }}>{translatedText}</p>
                            ) : (
                                <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>Translation will appear here...</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div style={{
                        marginTop: '1.5rem',
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                        border: '1px solid #dc2626',
                        borderRadius: '0.5rem',
                        padding: '1rem'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#f87171',
                            marginBottom: '0.5rem'
                        }}>
                            <span style={{
                                width: '0.5rem',
                                height: '0.5rem',
                                backgroundColor: '#f87171',
                                borderRadius: '50%'
                            }}></span>
                            <span style={{ fontWeight: '500' }}>Error</span>
                        </div>
                        <p style={{ color: '#fca5a5' }}>{error}</p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes pulse {
                    0% { 
                        transform: scale(0.8);
                        opacity: 1;
                    }
                    50% { 
                        transform: scale(1.2);
                        opacity: 0.5;
                    }
                    100% { 
                        transform: scale(0.8);
                        opacity: 1;
                    }
                }
                
                @keyframes listening-wave {
                    0% { 
                        transform: scale(1);
                        opacity: 1;
                    }
                    100% { 
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default App;
