
import React, { useState } from 'react';
import { HomeIcon, PencilSquareIcon } from './Icons';

type TxtUploaderProps = {
    onBack: () => void;
    onGenerationStart: (text: string) => void;
    onError: (message: string) => void;
};

const TxtUploader: React.FC<TxtUploaderProps> = ({ onBack, onGenerationStart, onError }) => {
    const [text, setText] = useState<string>('');

    const handleGenerate = () => {
        if (!text.trim()) {
            onError("請輸入或貼上一些文字內容。(Please enter or paste some text.)");
            return;
        }
        onGenerationStart(text);
    };

    return (
        <div className="flex flex-col h-full p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-sky-400">輸入文字以生成簡報</h2>
                <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
                    <HomeIcon className="w-6 h-6 text-slate-400" />
                </button>
            </div>

            <div className="flex-grow flex flex-col">
                 <label htmlFor="text-input" className="text-slate-400 mb-2">
                    在此處撰寫或貼上您的內容：
                 </label>
                 <textarea
                    id="text-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="例如，貼上您的會議記錄、文章草稿或一個新想法..."
                    className="w-full flex-grow bg-slate-900/50 border border-slate-600 rounded-lg p-4 text-slate-300 resize-none focus:ring-2 focus:ring-sky-500 focus:outline-none mb-4"
                />
            </div>
            
            <button
                onClick={handleGenerate}
                disabled={!text.trim()}
                className="w-full px-8 py-4 bg-green-600 text-white font-bold rounded-lg disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-green-500 transition-colors flex items-center justify-center gap-2"
            >
                <PencilSquareIcon className="w-6 h-6"/>
                <span>生成簡報</span>
            </button>
        </div>
    );
};

export default TxtUploader;