
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AppState, SlideData } from './types';
import { generatePresentationFromText, generatePresentationFromAudio, generateImage } from './services/geminiService';
import Landing from './components/Landing';
import AudioUploader from './components/AudioUploader';
import Uploader from './components/Uploader';
import TxtUploader from './components/TxtUploader';
import Editor from './components/Editor';
import Presentation from './components/Presentation';
import Loader from './components/Loader';
import { XCircleIcon } from './components/Icons';

const VALID_LAYOUTS: SlideData['layout'][] = ['default', 'timeline', 'blocks', 'title', 'quote', 'comparison', 'features', 'cta', 'bar-chart', 'pie-chart', 'line-chart', 'swot-analysis', 'process-flow', 'circular-diagram', 'hierarchy'];
const VALID_POSITIONS: NonNullable<SlideData['imagePosition']>[] = ['left', 'right', 'top', 'bottom'];


function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [presentation, setPresentation] = useState<SlideData[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [loaderText, setLoaderText] = useState('');
  const [pageCount, setPageCount] = useState<number>(10);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);
  
  const handleError = useCallback((message: string) => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setAppState('error');
    setErrorMessage(message);
    setProgress(0);
    setLoaderText('');
  }, []);

  const generateAndSetPresentation = async (generator: () => Promise<{ slides: Omit<SlideData, 'id' | 'imageUrl' | 'imagePosition'>[] }>, source: 'text' | 'audio') => {
    setAppState('loading');
    setProgress(0);

    try {
      // Stage 1: Generate text content and image prompts
      setLoaderText('正在分析內容並生成文字稿...');
      const textGenerationPromise = generator();
      let currentProgress = 0;
      progressIntervalRef.current = window.setInterval(() => {
        currentProgress += Math.random() * 5;
        setProgress(Math.min(currentProgress, 45));
      }, 500);

      const result = await textGenerationPromise;
      clearInterval(progressIntervalRef.current!);
      progressIntervalRef.current = null;

      if (!result || !result.slides || result.slides.length === 0) {
        throw new Error(`The AI couldn't generate presentation content from the ${source}.`);
      }
      setProgress(50);
      
      // Stage 2: Generate images for each slide
      setLoaderText('正在根據文字內容生成附圖...');
      const imagePromises = result.slides.map(slide => {
        // Only generate images for layouts that are not full-width charts
        const isChartLayout = ['bar-chart', 'pie-chart', 'line-chart', 'swot-analysis', 'process-flow', 'circular-diagram', 'hierarchy'].includes(slide.layout);
        return isChartLayout ? Promise.resolve('') : generateImage(slide.imagePrompt);
      });

      const settledImages = await Promise.allSettled(imagePromises);

      const slidesWithImages: SlideData[] = result.slides.map((slide, index) => {
        const imageResult = settledImages[index];
        const imageUrl = imageResult.status === 'fulfilled' ? imageResult.value : undefined;
        // Assign random image position, a unique ID, and validate layout
        const layout = VALID_LAYOUTS.includes(slide.layout) ? slide.layout : 'default';
        const imagePosition = VALID_POSITIONS[Math.floor(Math.random() * VALID_POSITIONS.length)];
        
        // Robustness: Ensure slide.content is always an array. The AI might inconsistently return a string.
        const content = Array.isArray(slide.content) ? slide.content : (slide.content ? [String(slide.content)] : []);

        return {
          ...slide,
          id: `${Date.now()}-${index}`,
          imageUrl,
          imagePosition,
          layout,
          content,
        };
      });
      
      setProgress(100);
      
      setTimeout(() => {
        setPresentation(slidesWithImages);
        setAppState('editing');
      }, 500)

    } catch(error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      handleError(`Failed to generate presentation: ${message}`);
    }
  }


  const handleTextGeneration = (text: string) => {
    if (!text.trim()) {
      handleError("The provided content is empty. Please provide some text to generate a presentation.");
      return;
    }
    generateAndSetPresentation(() => generatePresentationFromText(text, pageCount), 'text');
  };

  const handleAudioGeneration = (audioData: { mimeType: string; data: string; }) => {
     generateAndSetPresentation(() => generatePresentationFromAudio(audioData, pageCount), 'audio');
  };
  
  const handleStart = (count: number, type: 'audio' | 'pdf' | 'txt') => {
    setPageCount(count);
    if (type === 'audio') {
        setAppState('uploadingAudio');
    } else if (type === 'pdf') {
        setAppState('uploading');
    } else if (type === 'txt') {
        setAppState('textInput');
    }
  };

  const resetApp = () => {
    setAppState('landing');
    setPresentation(null);
    setErrorMessage('');
    setProgress(0);
    setLoaderText('');
    setPageCount(10);
  };

  const handleUpdateSlide = (updatedSlide: SlideData) => {
    setPresentation(prev => 
      prev!.map(slide => slide.id === updatedSlide.id ? updatedSlide : slide)
    );
  };
  
  const handleFinalizePresentation = () => {
    setAppState('presenting');
  }

  const renderContent = () => {
    switch (appState) {
      case 'landing':
        return <Landing onStart={handleStart} />;
      case 'uploadingAudio':
        return <AudioUploader onBack={resetApp} onGenerationStart={handleAudioGeneration} onError={handleError} />;
      case 'uploading':
        return <Uploader onBack={resetApp} onGenerationStart={handleTextGeneration} onError={handleError} />;
      case 'textInput':
        return <TxtUploader onBack={resetApp} onGenerationStart={handleTextGeneration} onError={handleError} />;
      case 'loading':
        return <Loader text={loaderText} progress={progress} />;
      case 'editing':
        return presentation && <Editor slides={presentation} onUpdateSlide={handleUpdateSlide} onFinalize={handleFinalizePresentation} onBack={resetApp}/>;
      case 'presenting':
        return presentation && <Presentation slides={presentation} onReset={() => setAppState('editing')} />;
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <XCircleIcon className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-400 mb-2">發生錯誤</h2>
            <p className="text-slate-400 max-w-md mb-6">{errorMessage}</p>
            <button
              onClick={resetApp}
              className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors"
            >
              再試一次
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="presentation-main-container w-full max-w-6xl h-[90vh] min-h-[700px] bg-slate-800/50 rounded-2xl shadow-2xl ring-1 ring-slate-700 flex flex-col">
            {renderContent()}
        </div>
        <footer className="text-center p-4 text-xs text-slate-500">
            Powered by React & Google Gemini.
        </footer>
    </main>
  );
}

export default App;
