export interface SlideData {
  id: string;
  title: string;
  content: string[];
  imagePrompt: string;
  imageUrl?: string;
  imagePosition?: 'left' | 'right' | 'top' | 'bottom';
  layout: 'default' | 'timeline' | 'blocks' | 'title' | 'quote' | 'comparison' | 'features' | 'cta' | 'bar-chart' | 'pie-chart' | 'line-chart' | 'swot-analysis' | 'process-flow' | 'circular-diagram' | 'hierarchy';
}

export interface PresentationData {
    slides: SlideData[];
}

export type AppState = 'landing' | 'uploadingAudio' | 'uploading' | 'textInput' | 'loading' | 'editing' | 'presenting' | 'error';