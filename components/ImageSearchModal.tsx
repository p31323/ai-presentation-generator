import React, { useState, useEffect, FormEvent } from 'react';
import { XCircleIcon } from './Icons';
import Loader from './Loader';

type ImageSearchModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onImageSelect: (imageUrl: string) => void;
    initialQuery: string;
};

interface PexelsPhoto {
    id: number;
    src: {
        large2x: string;
        medium: string;
    };
    alt: string;
}

const ImageSearchModal: React.FC<ImageSearchModalProps> = ({ isOpen, onClose, onImageSelect, initialQuery }) => {
    const [query, setQuery] = useState(initialQuery);
    const [images, setImages] = useState<PexelsPhoto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

    const handleSearch = async (e?: FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;
        if (!PEXELS_API_KEY || PEXELS_API_KEY === 'undefined') {
            setError("Pexels API 金鑰未設定。請在環境變數中設定 VITE_PEXELS_API_KEY。");
            return;
        }

        setIsLoading(true);
        setError(null);
        setImages([]);

        try {
            const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=24`, {
                headers: {
                    Authorization: PEXELS_API_KEY,
                },
            });

            if (!response.ok) {
                throw new Error(`Pexels API 請求失敗: ${response.statusText}`);
            }

            const data = await response.json();
            setImages(data.photos);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : '搜尋圖片時發生未知錯誤。');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (isOpen) {
            setQuery(initialQuery);
            handleSearch();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialQuery]);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden ring-1 ring-slate-700"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-sky-400">從圖庫搜尋圖片</h2>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
                        <XCircleIcon className="w-8 h-8" />
                    </button>
                </header>

                <div className="p-4 flex-shrink-0">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-100 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                            placeholder="輸入英文關鍵字搜尋, 例如: business meeting"
                        />
                        <button type="submit" className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors">
                            搜尋
                        </button>
                    </form>
                </div>
                
                <main className="flex-grow overflow-y-auto p-4">
                    {isLoading ? (
                        <Loader text="搜尋中..." />
                    ) : error ? (
                        <div className="text-center text-red-400 p-8">{error}</div>
                    ) : images.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map(image => (
                                <button 
                                    key={image.id} 
                                    className="aspect-video bg-slate-700 rounded-md overflow-hidden group focus:outline-none focus:ring-4 focus:ring-sky-500"
                                    onClick={() => onImageSelect(image.src.large2x)}
                                >
                                    <img 
                                        src={image.src.medium} 
                                        alt={image.alt} 
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 p-8">找不到結果。請嘗試不同的關鍵字。</div>
                    )}
                </main>
                <footer className="text-center p-2 text-xs text-slate-500 border-t border-slate-700 flex-shrink-0">
                    Photos provided by <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-sky-400">Pexels</a>
                </footer>
            </div>
        </div>
    );
};

export default ImageSearchModal;