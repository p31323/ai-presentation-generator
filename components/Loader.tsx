import React from 'react';

type LoaderProps = {
    text?: string;
    progress?: number;
}

const Loader: React.FC<LoaderProps> = ({ text = "Loading...", progress }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 border-4 border-t-sky-400 border-slate-600 rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-bold text-slate-200 mb-6">{text}</h2>
            {progress !== undefined && (
                <div className="w-full max-w-md">
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div
                            className="bg-sky-500 h-2.5 rounded-full transition-all duration-300 ease-linear"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-slate-300 mt-2 font-mono">{Math.round(progress)}%</p>
                </div>
            )}
        </div>
    );
};

export default Loader;