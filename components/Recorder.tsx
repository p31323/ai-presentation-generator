
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MicrophoneIcon, StopIcon, HomeIcon } from './Icons';

type RecorderProps = {
    onBack: () => void;
    onGenerationStart: (text: string) => void;
};

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const Recorder: React.FC<RecorderProps> = ({ onBack, onGenerationStart }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState('');
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (!SpeechRecognition) {
            setError("Your browser does not support the Web Speech API. Please try Chrome or Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'zh-TW';

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setTranscript(prev => prev + finalTranscript + interimTranscript);
        };

        recognition.onerror = (event: any) => {
            setError(`Speech recognition error: ${event.error}`);
        };
        
        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
        } else {
            setTranscript('');
            recognitionRef.current?.start();
        }
        setIsRecording(!isRecording);
    };
    
    const handleGenerate = () => {
        if(isRecording) {
           recognitionRef.current?.stop();
           setIsRecording(false);
        }
        onGenerationStart(transcript);
    };

    return (
        <div className="flex flex-col h-full p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-sky-400">錄製音訊以生成簡報</h2>
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
                    <HomeIcon className="w-6 h-6 text-slate-400" />
                </button>
            </div>

            <div className="flex-grow bg-slate-900/50 rounded-lg p-4 overflow-y-auto mb-4 ring-1 ring-slate-700">
                <p className="text-slate-300 whitespace-pre-wrap">{transcript || '按下錄音鍵開始說話...'}</p>
            </div>

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            <div className="flex items-center justify-center space-x-6">
                <button 
                    onClick={toggleRecording} 
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-600 hover:bg-red-500 animate-pulse' : 'bg-sky-600 hover:bg-sky-500'}`}
                >
                    {isRecording ? <StopIcon className="w-10 h-10 text-white" /> : <MicrophoneIcon className="w-10 h-10 text-white" />}
                </button>
                <button
                    onClick={handleGenerate}
                    disabled={!transcript || isRecording}
                    className="px-8 py-4 bg-green-600 text-white font-bold rounded-lg disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-green-500 transition-colors"
                >
                    生成簡報
                </button>
            </div>
        </div>
    );
};

export default Recorder;
