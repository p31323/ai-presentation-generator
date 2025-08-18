
import React, { useState, useRef, useCallback } from 'react';
import { AudioWaveIcon, HomeIcon, DocumentTextIcon } from './Icons';

type AudioUploaderProps = {
    onBack: () => void;
    onGenerationStart: (audioData: { mimeType: string; data: string; }) => void;
    onError: (message: string) => void;
};

const AudioUploader: React.FC<AudioUploaderProps> = ({ onBack, onGenerationStart, onError }) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [audioData, setAudioData] = useState<{ mimeType: string; data: string; } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = useCallback(async (file: File | null) => {
        if (!file) return;
        
        if (!file.type.startsWith('audio/')) {
            onError("Please upload a valid audio file (e.g., MP3, WAV, M4A).");
            return;
        }

        setFileName(file.name);
        setIsProcessing(true);
        setAudioData(null);

        try {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                setAudioData({ mimeType: file.type, data: base64String });
                setIsProcessing(false);
            };
            reader.onerror = () => {
                onError("Failed to read the audio file.");
                setIsProcessing(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("Error processing audio file:", error);
            onError("An unexpected error occurred while processing the audio file.");
            setIsProcessing(false);
        }

    }, [onError]);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        processFile(file || null);
    }, [processFile]);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        processFile(file || null);
    };

    const handleGenerate = () => {
        if (audioData) {
            onGenerationStart(audioData);
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col h-full p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-sky-400">上傳音訊以生成簡報</h2>
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
                    <HomeIcon className="w-6 h-6 text-slate-400" />
                </button>
            </div>

            <div 
                className={`flex-grow flex flex-col items-center justify-center bg-slate-900/50 rounded-lg p-4 mb-4 ring-1 ring-slate-700 border-2 border-dashed transition-colors cursor-pointer ${isDragging ? 'border-sky-400 ring-sky-400 bg-sky-900/20' : 'border-slate-600 hover:border-sky-500'}`}
                onClick={triggerFileSelect}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input type="file" accept="audio/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                {isProcessing ? (
                    <div className="text-center">
                        <p className="text-lg text-sky-400">正在處理: {fileName}</p>
                        <p className="text-slate-400">請稍候...</p>
                    </div>
                ) : fileName ? (
                     <div className="text-center">
                        <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-green-400" />
                        <p className="font-semibold text-slate-300">已選擇檔案: {fileName}</p>
                        <p className="text-slate-400 text-sm mt-2">點擊下方按鈕以生成簡報。</p>
                    </div>
                ) : (
                    <div className="text-center text-slate-400 pointer-events-none">
                        <AudioWaveIcon className="w-16 h-16 mx-auto mb-4" />
                        <p className="font-semibold text-slate-300">{isDragging ? '放開檔案以開始上傳' : '點擊此處或拖曳音訊檔案至此'}</p>
                        <p className="text-sm">支援 MP3, WAV, M4A 等格式</p>
                    </div>
                )}
            </div>
            
            <button
                onClick={handleGenerate}
                disabled={!audioData || isProcessing}
                className="w-full px-8 py-4 bg-green-600 text-white font-bold rounded-lg disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-green-500 transition-colors"
            >
                {isProcessing ? '處理中...' : '生成簡報'}
            </button>
        </div>
    );
};

export default AudioUploader;
