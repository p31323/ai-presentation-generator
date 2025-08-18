
import React, { useState, useRef, useCallback } from 'react';
import { UploadIcon, HomeIcon } from './Icons';

// pdfjsLib is loaded from CDN in index.html
declare const pdfjsLib: any;

type UploaderProps = {
    onBack: () => void;
    onGenerationStart: (text: string) => void;
    onError: (message: string) => void;
};

const Uploader: React.FC<UploaderProps> = ({ onBack, onGenerationStart, onError }) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [extractedText, setExtractedText] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = useCallback(async (file: File | null) => {
        if (!file) return;

        if (file.type !== 'application/pdf') {
            onError("Please upload a valid PDF file.");
            return;
        }

        setFileName(file.name);
        setIsParsing(true);
        setExtractedText('');

        try {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`;
            const fileReader = new FileReader();
            fileReader.onload = async (e) => {
                const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
                const pdf = await pdfjsLib.getDocument(typedArray).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item: any) => item.str).join(' ');
                    fullText += pageText + '\n\n';
                }
                setExtractedText(fullText);
                setIsParsing(false);
            };
            fileReader.readAsArrayBuffer(file);
        } catch (error) {
            console.error("Error parsing PDF:", error);
            onError("Failed to parse the PDF file. It might be corrupted or in an unsupported format.");
            setIsParsing(false);
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
        onGenerationStart(extractedText);
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col h-full p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-sky-400">上傳 PDF 以生成簡報</h2>
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
                    <HomeIcon className="w-6 h-6 text-slate-400" />
                </button>
            </div>

            <div 
                className={`flex-grow flex flex-col items-center justify-center bg-slate-900/50 rounded-lg p-4 mb-4 ring-1 border-2 border-dashed transition-colors cursor-pointer ${isDragging ? 'border-sky-400 ring-sky-400 bg-sky-900/20' : 'border-slate-600 hover:border-sky-500'}`}
                onClick={triggerFileSelect}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                {isParsing ? (
                    <div className="text-center">
                        <p className="text-lg text-sky-400">正在解析: {fileName}</p>
                        <p className="text-slate-400">請稍候...</p>
                    </div>
                ) : fileName ? (
                    <div className="text-center">
                        <p className="text-lg text-green-400">已選擇檔案: {fileName}</p>
                        <p className="text-slate-400 text-sm mt-2">點擊下方按鈕以生成簡報。</p>
                    </div>
                ) : (
                    <div className="text-center text-slate-400 pointer-events-none">
                        <UploadIcon className="w-16 h-16 mx-auto mb-4" />
                        <p className="font-semibold text-slate-300">{isDragging ? '放開檔案以開始上傳' : '點擊此處或拖曳檔案至此'}</p>
                        <p className="text-sm">支援 PDF 格式</p>
                    </div>
                )}
            </div>
            
            <button
                onClick={handleGenerate}
                disabled={!extractedText || isParsing}
                className="w-full px-8 py-4 bg-green-600 text-white font-bold rounded-lg disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-green-500 transition-colors"
            >
                {isParsing ? '解析中...' : '生成簡報'}
            </button>
        </div>
    );
};

export default Uploader;
