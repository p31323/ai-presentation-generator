
import React, { useState } from 'react';
import { AudioWaveIcon, DocumentTextIcon, PencilSquareIcon } from './Icons';

type LandingProps = {
    onStart: (pageCount: number, type: 'audio' | 'pdf' | 'txt') => void;
};

const Landing: React.FC<LandingProps> = ({ onStart }) => {
    const [pageCount, setPageCount] = useState(10);

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-sky-400 mb-2">AI Presentation Generator</h1>
            <p className="text-lg text-slate-400 mb-8 max-w-3xl">從您的聲音或文件中即時創建精美的簡報。上傳內容後，您將可以編輯文字、調整附圖版面，最後生成您的專屬簡報。(Instantly create beautiful presentations from your voice or documents. After uploading, you can edit text, adjust image layouts, and finalize your custom presentation.)</p>
            
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-300 mb-3">選擇簡報頁數 (Select slide count):</h2>
                <div className="flex justify-center space-x-4">
                    {[10, 15, 20].map(count => (
                        <button 
                            key={count}
                            onClick={() => setPageCount(count)}
                            className={`px-6 py-2 rounded-full font-bold text-lg transition-all duration-200 ${pageCount === count ? 'bg-sky-600 text-white shadow-lg scale-105' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                        >
                            {count}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                <OptionCard
                    icon={<AudioWaveIcon className="w-12 h-12 mb-4 text-sky-400" />}
                    title="上傳音訊"
                    description="上傳錄音檔，讓 AI 分析內容並轉換為簡報初稿。"
                    onClick={() => onStart(pageCount, 'audio')}
                />
                <OptionCard
                    icon={<DocumentTextIcon className="w-12 h-12 mb-4 text-sky-400" />}
                    title="上傳 PDF"
                    description="上傳 PDF 文件，讓 AI 為您總結並生成簡報初稿。"
                    onClick={() => onStart(pageCount, 'pdf')}
                />
                <OptionCard
                    icon={<PencilSquareIcon className="w-12 h-12 mb-4 text-sky-400" />}
                    title="直接輸入文字"
                    description="直接貼上您的文章或筆記，讓 AI 為您生成簡報初稿。"
                    onClick={() => onStart(pageCount, 'txt')}
                />
            </div>
        </div>
    );
};

type OptionCardProps = {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
};

const OptionCard: React.FC<OptionCardProps> = ({ icon, title, description, onClick }) => (
    <button
        onClick={onClick}
        className="bg-slate-800 p-8 rounded-lg shadow-lg hover:bg-slate-700/80 hover:ring-2 hover:ring-sky-500 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center"
    >
        {icon}
        <h2 className="text-2xl font-bold text-slate-100 mb-2">{title}</h2>
        <p className="text-slate-400">{description}</p>
    </button>
);

export default Landing;