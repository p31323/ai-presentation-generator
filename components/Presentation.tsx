import React, { useState } from 'react';
import { SlideData } from '../types';
import { 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    PencilSquareIcon,
    LightBulbIcon,
    ShieldCheckIcon,
    RocketLaunchIcon,
    Cog8ToothIcon,
    RectangleGroupIcon,
    ArrowLongRightIcon,
    Squares2X2Icon,
    ShareIcon,
    ArrowPathIcon,
    ArrowDownTrayIcon
} from './Icons';

type PresentationProps = {
    slides: SlideData[];
    onReset: () => void;
};

// --- PptxGenJS/PDF Declaration ---
declare const PptxGenJS: any;
declare const html2canvas: any;
declare const jspdf: any;


// --- Chart and Layout Utilities ---
const parseJsonData = (jsonString: string, fallback: any = null) => {
    try {
        if (!jsonString || typeof jsonString !== 'string') return fallback;
        // The AI sometimes returns a JSON string that is inside another string.
        const cleanedString = jsonString.trim().startsWith('"') && jsonString.trim().endsWith('"')
            ? JSON.parse(jsonString)
            : jsonString;
        const data = JSON.parse(cleanedString);
        return data;
    } catch (e) {
        console.error("Failed to parse JSON data:", jsonString, e);
        return fallback;
    }
};

interface HierarchyNodeData {
    name: string;
    children?: HierarchyNodeData[];
}


// --- Layout-specific Renderers ---

const TitleLayout: React.FC<{ slide: SlideData }> = ({ slide }) => (
    <div className="w-full h-full flex items-center justify-center relative text-white text-center p-8">
        {slide.imageUrl && (
            <img src={slide.imageUrl} alt={slide.imagePrompt} className="absolute inset-0 w-full h-full object-cover z-0" />
        )}
        <div className="absolute inset-0 bg-slate-900/70 z-10"></div>
        <div className="relative z-20 flex flex-col items-center">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">{slide.title}</h1>
            {slide.content[0] && (
                <p className="mt-4 text-xl md:text-2xl text-slate-300 max-w-3xl">{slide.content[0]}</p>
            )}
        </div>
    </div>
);

const DefaultLayout: React.FC<{ slide: SlideData }> = ({ slide }) => (
    <div className="flex-1 flex flex-col justify-center p-8 md:p-12 overflow-y-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-sky-400 mb-6">{slide.title}</h2>
        <ul className="space-y-3 text-lg md:text-xl text-slate-300 list-disc list-inside text-left max-w-prose">
            {slide.content.map((point, index) => (
                <li key={index}>{point}</li>
            ))}
        </ul>
    </div>
);

const QuoteLayout: React.FC<{ slide: SlideData }> = ({ slide }) => (
    <div className="flex-1 flex flex-col justify-center p-8 md:p-16">
        <blockquote className="border-l-4 border-sky-500 pl-6">
            <p className="text-2xl md:text-3xl font-serif italic text-slate-200">"{slide.content[0]}"</p>
        </blockquote>
         {slide.content[1] && (
            <p className="mt-4 text-right text-lg text-slate-400 font-semibold">— {slide.content[1]}</p>
         )}
    </div>
);

const TimelineLayout: React.FC<{ slide: SlideData }> = ({ slide }) => {
    const timelineItems = slide.content.map(item => {
        const parts = item.split('::');
        return {
            key: parts[0]?.trim() || '',
            value: parts[1]?.trim() || item,
        };
    });

    return (
        <div className="flex-1 flex flex-col p-8 md:p-12 overflow-y-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-sky-400 mb-8 text-center">{slide.title}</h2>
            <div className="relative border-l-4 border-sky-600/50 ml-4 pl-8">
                {timelineItems.map((item, index) => (
                    <div key={index} className="mb-8 relative">
                        <div className="absolute -left-[42px] top-1 w-6 h-6 bg-slate-800 border-4 border-sky-500 rounded-full"></div>
                        <h3 className="text-xl font-bold text-sky-400">{item.key}</h3>
                        <p className="text-slate-300 mt-1">{item.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BlocksLayout: React.FC<{ slide: SlideData }> = ({ slide }) => {
    const numItems = slide.content.length;
    const gridCols = numItems > 2 ? 'grid-cols-2' : 'grid-cols-1';
    const gridRows = numItems > 1 ? 'grid-rows-2' : 'grid-rows-1';

    return (
        <div className="flex-1 flex flex-col p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-sky-400 mb-6 text-center">{slide.title}</h2>
            <div className={`grid ${gridCols} ${gridRows} gap-4 flex-grow`}>
                {slide.content.map((block, index) => (
                    <div key={index} className="bg-slate-900/50 p-4 rounded-lg flex items-center justify-center text-center ring-1 ring-slate-700 shadow-md">
                        <p className="text-slate-300 text-lg">{block}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ComparisonLayout: React.FC<{ slide: SlideData }> = ({ slide }) => {
    const leftTitle = slide.content[0] || '主題 A';
    const leftContent = slide.content[1]?.split('\n') || [];
    const rightTitle = slide.content[2] || '主題 B';
    const rightContent = slide.content[3]?.split('\n') || [];

    return (
        <div className="flex-1 flex flex-col p-8 md:p-12 overflow-y-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-sky-400 mb-8 text-center">{slide.title}</h2>
            <div className="flex-grow grid grid-cols-2 gap-8">
                <div className="border-r border-slate-600 pr-8">
                    <h3 className="text-2xl font-semibold text-center text-green-400 mb-4">{leftTitle}</h3>
                    <ul className="space-y-2 list-disc list-inside text-slate-300">
                        {leftContent.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
                <div>
                    <h3 className="text-2xl font-semibold text-center text-red-400 mb-4">{rightTitle}</h3>
                    <ul className="space-y-2 list-disc list-inside text-slate-300">
                        {rightContent.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const iconMap: { [key: string]: React.FC<{ className?: string }> } = {
    lightbulb: LightBulbIcon,
    shield: ShieldCheckIcon,
    rocket: RocketLaunchIcon,
    cog: Cog8ToothIcon,
    default: RectangleGroupIcon,
};

const FeaturesLayout: React.FC<{ slide: SlideData }> = ({ slide }) => {
    const features = slide.content.map(item => {
        const parts = item.split('::');
        return {
            icon: parts[0]?.trim() || 'default',
            title: parts[1]?.trim() || '',
            description: parts[2]?.trim() || '',
        };
    });
    
    return (
        <div className="flex-1 flex flex-col p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-sky-400 mb-8 text-center">{slide.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow items-center">
                {features.map((feature, index) => {
                    const IconComponent = iconMap[feature.icon] || iconMap.default;
                    return (
                        <div key={index} className="bg-slate-900/50 p-6 rounded-lg text-center flex flex-col items-center h-full">
                           <IconComponent className="w-12 h-12 mb-4 text-sky-400"/>
                           <h3 className="text-xl font-bold text-slate-100 mb-2">{feature.title}</h3>
                           <p className="text-slate-400 text-sm flex-grow">{feature.description}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const CtaLayout: React.FC<{ slide: SlideData }> = ({ slide }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <h2 className="text-4xl md:text-5xl font-bold text-sky-400 mb-4">{slide.title}</h2>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-8">{slide.content[0]}</p>
            {slide.content[1] && (
                <div className="px-10 py-4 bg-green-600 text-white font-bold rounded-lg text-xl shadow-lg">
                    {slide.content[1]}
                </div>
            )}
        </div>
    );
};


// --- Chart Layouts ---
const CHART_COLORS = ['38bdf8', '818cf8', 'f471b5', 'fbbf24', 'a3e635', '4ade80'];

const BarChartLayout: React.FC<{ slide: SlideData }> = ({ slide }) => {
    const data = parseJsonData(slide.content[0], []);
    if (!Array.isArray(data) || data.length === 0) return (
        <div className="flex-1 flex flex-col justify-center items-center p-8">
            <h2 className="text-3xl font-bold text-sky-400 text-center">{slide.title}</h2>
            <p className="text-center text-red-400 mt-8">圖表資料無效</p>
        </div>
    );
    const maxValue = Math.max(...data.map((d: any) => d.value), 0);
    return (
        <div className="flex-1 flex flex-col justify-between p-8 md:p-12">
            <h2 className="text-3xl font-bold text-sky-400 text-center flex-shrink-0">{slide.title}</h2>
            <div className="flex items-center justify-center">
                <div className="w-full max-w-3xl h-[25rem] flex items-end justify-around gap-4 px-4 border-l-2 border-b-2 border-slate-600 pb-2">
                    {data.map((item: any, index: number) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full bg-slate-700/50 hover:bg-sky-500/80 transition-colors rounded-t-md" style={{ height: `${(item.value / maxValue) * 100}%`, backgroundColor: `#${CHART_COLORS[index % CHART_COLORS.length]}` }}>
                               <span className="text-xs font-bold text-white/80 relative -top-5">{item.value}</span>
                            </div>
                            <span className="text-sm text-slate-300 font-medium">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const PieChartLayout: React.FC<{ slide: SlideData }> = ({ slide }) => {
    const data = parseJsonData(slide.content[0], []);
    if (!Array.isArray(data) || data.length === 0) return <div className="p-8"><h2 className="text-3xl font-bold text-sky-400 mb-8 text-center">{slide.title}</h2><p className="text-center text-red-400">圖表資料無效</p></div>;
    const total = data.reduce((acc: number, item: any) => acc + item.value, 0);
    if (total === 0) return <div className="p-8"><h2 className="text-3xl font-bold text-sky-400 mb-8 text-center">{slide.title}</h2><p className="text-center text-red-400">圖表資料總和為零</p></div>;
    let cumulative = 0;
    const gradient = data.map((item: any, index: number) => {
        const start = (cumulative / total) * 100;
        cumulative += item.value;
        const end = (cumulative / total) * 100;
        return `#${CHART_COLORS[index % CHART_COLORS.length]} ${start}% ${end}%`;
    }).join(', ');
    
    return (
        <div className="flex-1 flex flex-col p-8 md:p-12">
            <h2 className="text-3xl font-bold text-sky-400 text-center flex-shrink-0 mb-8">{slide.title}</h2>
            <div className="flex-grow flex flex-col lg:flex-row items-center justify-center gap-8">
                <div className="w-64 h-64 rounded-full flex-shrink-0" style={{ background: `conic-gradient(${gradient})` }}></div>
                <div className="flex flex-col gap-2">
                    {data.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: `#${CHART_COLORS[index % CHART_COLORS.length]}` }}></div>
                            <span className="text-slate-300">{item.label}: {item.value} ({((item.value / total) * 100).toFixed(1)}%)</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const LineChartLayout: React.FC<{ slide: SlideData }> = ({ slide }) => {
    const data = parseJsonData(slide.content[0], []);
    if (!Array.isArray(data) || data.length < 2) return <div className="p-8"><h2 className="text-3xl font-bold text-sky-400 mb-8 text-center">{slide.title}</h2><p className="text-center text-red-400">圖表資料無效 (至少需要 2 個點)</p></div>;
    const width = 500, height = 300, padding = 40;
    const maxValue = Math.max(...data.map((d: any) => d.value), 0);
    const getX = (i: number) => padding + (i / (data.length - 1)) * (width - 2 * padding);
    const getY = (v: number) => height - padding - (v / maxValue) * (height - 2 * padding);
    const points = data.map((d: any, i: number) => `${getX(i)},${getY(d.value)}`).join(' ');

    return (
        <div className="flex-1 flex flex-col p-8 md:p-12">
            <h2 className="text-3xl font-bold text-sky-400 text-center flex-shrink-0 mb-8">{slide.title}</h2>
            <div className="flex-grow flex items-center justify-center">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-xl">
                    {/* Y-axis grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(f => (
                        <line key={f} x1={padding} y1={getY(f * maxValue)} x2={width - padding} y2={getY(f * maxValue)} stroke="#475569" strokeWidth="1" strokeDasharray="2,2"/>
                    ))}
                    {/* X-axis */}
                    <line x1={padding} y1={height - padding} x2={width-padding} y2={height - padding} stroke="#94a3b8" strokeWidth="2"/>
                    {/* Y-axis */}
                    <line x1={padding} y1={padding/2} x2={padding} y2={height - padding} stroke="#94a3b8" strokeWidth="2"/>
                    {/* Data line */}
                    <polyline points={points} fill="none" stroke={`#${CHART_COLORS[0]}`} strokeWidth="3" />
                    {/* Data points */}
                    {data.map((d: any, i: number) => (
                        <g key={i}>
                            <circle cx={getX(i)} cy={getY(d.value)} r="5" fill={`#${CHART_COLORS[0]}`} stroke="#1e293b" strokeWidth="2" />
                            <text x={getX(i)} y={height - padding + 20} textAnchor="middle" fill="#cbd5e1" fontSize="12">{d.label}</text>
                        </g>
                    ))}
                     {[0, 0.5, 1].map(f => (
                        <text key={f} x={padding - 10} y={getY(f * maxValue) + 4} textAnchor="end" fill="#cbd5e1" fontSize="12">{(f * maxValue).toFixed(0)}</text>
                     ))}
                </svg>
            </div>
        </div>
    );
};

const ProcessFlowLayout: React.FC<{ slide: SlideData }> = ({ slide }) => (
    <div className="flex-1 flex flex-col p-8 md:p-12 overflow-x-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-sky-400 mb-12 text-center flex-shrink-0">{slide.title}</h2>
        <div className="flex-grow flex items-center justify-center gap-2">
            {slide.content.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="bg-slate-800/70 p-4 rounded-lg flex items-center justify-center text-center ring-1 ring-slate-700 shadow-lg min-w-[150px] h-24">
                        <p className="text-slate-300 font-semibold">{step}</p>
                    </div>
                    {index < slide.content.length - 1 && (
                        <ArrowLongRightIcon className="w-12 h-12 text-sky-500 flex-shrink-0 mx-2" />
                    )}
                </React.Fragment>
            ))}
        </div>
    </div>
);

const SwotAnalysisLayout: React.FC<{ slide: SlideData }> = ({ slide }) => {
    const swotItems = [
        { title: '優勢', content: slide.content[0] || '', color: 'border-green-500', textColor: 'text-green-400' },
        { title: '劣勢', content: slide.content[1] || '', color: 'border-red-500', textColor: 'text-red-400' },
        { title: '機會', content: slide.content[2] || '', color: 'border-sky-500', textColor: 'text-sky-400' },
        { title: '威脅', content: slide.content[3] || '', color: 'border-amber-500', textColor: 'text-amber-400' },
    ];
    return (
        <div className="flex-1 flex flex-col p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-sky-400 mb-8 text-center">{slide.title}</h2>
            <div className="flex-grow grid grid-cols-2 grid-rows-2 gap-4">
                {swotItems.map((item, index) => (
                    <div key={index} className={`bg-slate-900/50 p-4 rounded-lg flex flex-col border-t-4 ${item.color}`}>
                        <h3 className={`text-xl font-bold mb-2 ${item.textColor}`}>{item.title}</h3>
                        <ul className="space-y-1 list-disc list-inside text-slate-300 text-sm">
                            {item.content.split('\n').map((line, i) => line && <li key={i}>{line}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CircularDiagramLayout: React.FC<{ slide: SlideData }> = ({ slide }) => {
    const items = slide.content;
    const count = items.length;
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 relative">
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-sky-900/50 border-2 border-sky-500 rounded-full flex items-center justify-center text-center p-4">
                <h2 className="text-2xl font-bold text-sky-300">{slide.title}</h2>
            </div>
            {items.map((item, index) => {
                const angle = (index / count) * 2 * Math.PI - (Math.PI / 2);
                const radius = 220; // in pixels
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                return (
                    <div
                        key={index}
                        className="absolute top-1/2 left-1/2 w-40 h-24 bg-slate-800/80 rounded-lg shadow-lg flex items-center justify-center text-center p-2 ring-1 ring-slate-700"
                        style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }}
                    >
                        <p className="text-slate-300 font-semibold">{item}</p>
                    </div>
                );
            })}
        </div>
    );
};

const HierarchyNode: React.FC<{ node: HierarchyNodeData }> = ({ node }) => (
    <div className="flex flex-col items-center">
        {/* Node Box */}
        <div className="bg-sky-600 text-white font-bold py-2 px-4 rounded-lg shadow-md min-w-[120px] text-center">{node.name}</div>
        {/* Children Container */}
        {node.children && node.children.length > 0 && (
            <>
                {/* Vertical Connector */}
                <div className="w-px h-8 bg-slate-500"></div>
                {/* Horizontal Connector */}
                <div className="flex justify-center relative">
                    {node.children.length > 1 && <div className="absolute top-0 h-px bg-slate-500" style={{ left: '50%', right: '50%', transform: `translateX(-${(node.children.length-1)*50}%)`, width: `${(node.children.length-1)*100}%`}}></div>}
                    {node.children.map((child, index) => (
                        <div key={index} className="flex flex-col items-center px-4 relative">
                            {/* Vertical line to child */}
                            <div className="absolute top-0 w-px h-4 bg-slate-500"></div>
                            <HierarchyNode node={child} />
                        </div>
                    ))}
                </div>
            </>
        )}
    </div>
);


const HierarchyLayout: React.FC<{ slide: SlideData }> = ({ slide }) => {
    const data = parseJsonData(slide.content[0]) as HierarchyNodeData | null;
     if (!data || !data.name) return <div className="p-8"><h2 className="text-3xl font-bold text-sky-400 mb-8 text-center">{slide.title}</h2><p className="text-center text-red-400">階層圖資料無效</p></div>;

    return (
        <div className="flex-1 flex flex-col p-8 overflow-auto">
             <h2 className="text-3xl md:text-4xl font-bold text-sky-400 mb-8 text-center flex-shrink-0">{slide.title}</h2>
             <div className="flex-grow flex items-start justify-center pt-4">
                <HierarchyNode node={data} />
             </div>
        </div>
    );
};


// --- Main Components ---

const SlideContent: React.FC<{ slide: SlideData }> = ({ slide }) => {
    switch (slide.layout) {
        case 'timeline': return <TimelineLayout slide={slide} />;
        case 'blocks': return <BlocksLayout slide={slide} />;
        case 'quote': return <QuoteLayout slide={slide} />;
        case 'default':
        default: return <DefaultLayout slide={slide} />;
    }
};

const SlideImage: React.FC<{ slide: SlideData }> = ({ slide }) => {
    if (!slide.imageUrl) {
        return null;
    }

    const isVertical = slide.imagePosition === 'top' || slide.imagePosition === 'bottom';
    const containerClass = isVertical 
        ? 'w-full h-[35%]' 
        : 'w-[35%] h-full';

    return (
        <div className={`${containerClass} bg-slate-900 flex-shrink-0`}>
            <img src={slide.imageUrl} alt={slide.imagePrompt} className="w-full h-full object-cover" />
        </div>
    );
};


const Slide: React.FC<{ slide: SlideData; position: string }> = ({ slide, position }) => {
    const animationClass = `absolute inset-0 w-full h-full transition-transform duration-500 ease-in-out`;
    
    const FullWidthLayoutComponent = {
      title: TitleLayout,
      cta: CtaLayout,
      comparison: ComparisonLayout,
      features: FeaturesLayout,
      'bar-chart': BarChartLayout,
      'pie-chart': PieChartLayout,
      'line-chart': LineChartLayout,
      'swot-analysis': SwotAnalysisLayout,
      'process-flow': ProcessFlowLayout,
      'circular-diagram': CircularDiagramLayout,
      'hierarchy': HierarchyLayout,
    }[slide.layout as keyof typeof FullWidthLayoutComponent];

    if (FullWidthLayoutComponent) {
         return (
            <div className={animationClass} style={{ transform: `translateX(${position})` }}>
                <FullWidthLayoutComponent slide={slide} />
            </div>
        );
    }
    
    // --- Image + Content layouts ---
    const isVertical = slide.imagePosition === 'top' || slide.imagePosition === 'bottom';
    
    let flexClass = '';
    if (isVertical) {
        flexClass = slide.imagePosition === 'top' ? 'flex-col' : 'flex-col-reverse';
    } else {
        flexClass = slide.imagePosition === 'left' ? 'flex-row' : 'flex-row-reverse';
    }

    return (
        <div className={animationClass} style={{ transform: `translateX(${position})` }}>
            <div className={`flex ${flexClass} w-full h-full items-stretch`}>
                <SlideImage slide={slide} />
                <SlideContent slide={slide} />
            </div>
        </div>
    );
};

const Presentation: React.FC<PresentationProps> = ({ slides, onReset }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

    const nextSlide = () => {
        setCurrentSlide(prev => (prev < slides.length - 1 ? prev + 1 : prev));
    };

    const prevSlide = () => {
        setCurrentSlide(prev => (prev > 0 ? prev - 1 : prev));
    };

    const handlePptxDownload = async () => {
        if (isDownloading || isDownloadingPdf) return;
        setIsDownloading(true);

        try {
            const pres = new PptxGenJS();
            pres.layout = 'LAYOUT_16x9';

            for (const slide of slides) {
                const pptxSlide = pres.addSlide();
                pptxSlide.background = { color: '1e293b' };

                try {
                    const imageCompatibleLayouts = ['default', 'quote', 'timeline', 'blocks'];
                    let contentBounds = { x: 0.5, y: 1.2, w: 9, h: 4.2 };
                    let titleBounds: any = { x: 0.5, y: 0.25, w: 9, h: 0.75, fontSize: 32, color: '38bdf8', bold: true, align: 'center' };
                    
                    if (slide.imageUrl && imageCompatibleLayouts.includes(slide.layout)) {
                        let imgOpts: { x: number | string; y: number | string; w: string; h: string; } = { x: 0, y: 0, w: '35%', h: '100%' };
                        titleBounds = { x: 3.8, y: 0.5, w: 5.7, h: 0.75, fontSize: 32, color: '38bdf8', bold: true };
                        contentBounds = { x: 3.8, y: 1.4, w: 5.7, h: 4.0 };

                        switch(slide.imagePosition) {
                            case 'right': 
                                imgOpts.x = '65%'; 
                                titleBounds.x = 0.5;
                                contentBounds.x = 0.5;
                                break;
                            case 'top': 
                                imgOpts = { x: 0, y: 0, w: '100%', h: '35%' }; 
                                titleBounds = { x: 0.5, y: 2.2, w: 9, h: 0.75, align: 'center', fontSize: 32, color: '38bdf8', bold: true };
                                contentBounds = { x: 0.5, y: 3.1, w: 9, h: 2.2 };
                                break;
                            case 'bottom': 
                                imgOpts = { x: 0, y: '65%', w: '100%', h: '35%' }; 
                                titleBounds = { x: 0.5, y: 0.5, w: 9, h: 0.75, align: 'center', fontSize: 32, color: '38bdf8', bold: true };
                                contentBounds = { x: 0.5, y: 1.4, w: 9, h: 3.5 };
                                break;
                        }
                        pptxSlide.addImage({ data: slide.imageUrl, ...imgOpts });
                    }
                    
                    if (slide.layout !== 'title' && slide.layout !== 'circular-diagram') {
                        pptxSlide.addText(slide.title, titleBounds);
                    }
                    
                    switch(slide.layout) {
                        case 'title':
                            if (slide.imageUrl) {
                                pptxSlide.addImage({ data: slide.imageUrl, w: '100%', h: '100%' });
                                pptxSlide.addShape(pres.ShapeType.rect, { x:0, y:0, w:'100%', h:'100%', fill: { type: 'solid', color: '0f172a', alpha: 30 } });
                            }
                            pptxSlide.addText(slide.title, { x: 0, y: 0, w: '100%', h: '100%', align: 'center', valign: 'middle', fontSize: 48, color: 'FFFFFF', bold: true });
                            if (slide.content[0]) {
                                pptxSlide.addText(slide.content[0], { x: 0, y: '58%', w: '100%', h: 0.75, align: 'center', valign: 'top', fontSize: 24, color: 'e2e8f0' });
                            }
                            break;

                        case 'features': {
                            const features = slide.content.map(item => {
                                const parts = item.split('::');
                                return { title: parts[1]?.trim() || '項目', description: parts[2]?.trim() || '' };
                            });
                            const numFeatures = features.length;
                            if (numFeatures === 0) break;
                            const totalWidth = 9, gap = 0.4;
                            const featureW = (totalWidth - (gap * (numFeatures - 1))) / numFeatures;
                            
                            features.forEach((feature, index) => {
                                const featureX = 0.5 + index * (featureW + gap);
                                pptxSlide.addShape(pres.ShapeType.rect, { x: featureX, y: 1.5, w: featureW, h: 3.8, fill: { color: '293952' } });
                                pptxSlide.addText(feature.title, { x: featureX, y: 1.7, w: featureW, h: 0.5, fontSize: 18, color: 'f1f5f9', bold: true, align: 'center' });
                                pptxSlide.addText(feature.description, { x: featureX + 0.2, y: 2.3, w: featureW - 0.4, h: 2.8, fontSize: 14, color: 'cbd5e1', align: 'left' });
                            });
                            break;
                        }
                        
                        case 'quote':
                            pptxSlide.addText(`"${slide.content[0]}"`, { ...contentBounds, h: contentBounds.h - 1, align: 'center', valign: 'middle', fontSize: 28, color: 'f1f5f9', italic: true });
                            if (slide.content[1]) {
                                pptxSlide.addText(`— ${slide.content[1]}`, { ...contentBounds, y: contentBounds.y + contentBounds.h - 1, h: 0.5, align: 'right', fontSize: 20, color: '94a3b8'});
                            }
                            break;

                        case 'comparison': {
                            const col1X = 0.5, col2X = 5.25, colW = 4.25;
                            const textY = 1.5;
                            pptxSlide.addText(slide.content[0] || '主題 A', { x: col1X, y: textY, w: colW, h: 0.5, fontSize: 22, color: '4ade80', bold: true, align: 'center' });
                            pptxSlide.addText((slide.content[1] || '').split('\n').map(p => ({ text: p })), { x: col1X, y: textY + 0.6, w: colW, h: 3.5, fontSize: 16, color: 'f1f5f9', bullet: true });
                            pptxSlide.addText(slide.content[2] || '主題 B', { x: col2X, y: textY, w: colW, h: 0.5, fontSize: 22, color: 'f87171', bold: true, align: 'center' });
                            pptxSlide.addText((slide.content[3] || '').split('\n').map(p => ({ text: p })), { x: col2X, y: textY + 0.6, w: colW, h: 3.5, fontSize: 16, color: 'f1f5f9', bullet: true });
                            break;
                        }
                        
                        case 'bar-chart':
                        case 'pie-chart':
                        case 'line-chart': {
                            const data = parseJsonData(slide.content[0], []);
                            if(data && data.length > 0) {
                                const chartType = slide.layout === 'bar-chart' ? pres.ChartType.bar : (slide.layout === 'pie-chart' ? pres.ChartType.pie : pres.ChartType.line);
                                const chartData = [{ name: slide.title, labels: data.map((d: any) => d.label), values: data.map((d: any) => Number(d.value) || 0) }];
                                pptxSlide.addChart(chartType, chartData, { x: 1, y: 1.5, w: 8, h: 4, barDir: 'col', showLegend: true, legendPos: 'r', chartColors: CHART_COLORS, dataLabelColor: 'FFFFFF', showValue: true });
                            } else {
                                pptxSlide.addText('圖表資料無效', { x: 0, y: 0, w: '100%', h: '100%', align: 'center', valign: 'middle', color: 'FF0000' });
                            }
                            break;
                        }

                        case 'swot-analysis': {
                            const swotItems = [
                                { title: '優勢', content: slide.content[0] || '', color: '4ade80' }, { title: '劣勢', content: slide.content[1] || '', color: 'f87171' },
                                { title: '機會', content: slide.content[2] || '', color: '38bdf8' }, { title: '威脅', content: slide.content[3] || '', color: 'fbbf24' },
                            ];
                            const positions = [ { x: 0.25, y: 1.25 }, { x: 5.25, y: 1.25 }, { x: 0.25, y: 3.5 }, { x: 5.25, y: 3.5 } ];
                            swotItems.forEach((item, index) => {
                                const {x, y} = positions[index];
                                pptxSlide.addShape(pres.ShapeType.rect, { x, y, w: 4.5, h: 2.2, fill: { color: '293952' } });
                                pptxSlide.addText(item.title, { x: x + 0.1, y: y + 0.1, w: 4.3, h: 0.4, fontSize: 18, bold: true, color: item.color });
                                pptxSlide.addText(item.content.split('\n').map(p => ({ text: p })), { x: x + 0.1, y: y + 0.5, w: 4.3, h: 1.6, fontSize: 14, color: 'f1f5f9', bullet: true });
                            });
                            break;
                        }

                        case 'process-flow': {
                            const steps = slide.content;
                            const stepCount = steps.length;
                            if (stepCount > 0) {
                                const dynamicWidth = stepCount > 4 ? 1.8 : 2.2;
                                const totalWidth = stepCount * dynamicWidth + (stepCount - 1) * 0.8;
                                let startX = 5.0 - totalWidth / 2;

                                steps.forEach((step, index) => {
                                    pptxSlide.addText(step, { x: startX, y: 2.5, w: dynamicWidth, h: 1, align: 'center', valign: 'middle', shape: pres.ShapeType.rect, fill: { color: '293952' }, color: 'f1f5f9' });
                                    if (index < stepCount - 1) {
                                        pptxSlide.addShape(pres.ShapeType.arrow, { x: startX + dynamicWidth, y: 3.0, w: 0.8, h: 0, line: { color: '38bdf8', width: 2 } });
                                    }
                                    startX += dynamicWidth + 0.8;
                                });
                            }
                            break;
                        }

                        case 'hierarchy': {
                             const data = parseJsonData(slide.content[0]);
                             if (data) {
                                const listItems: { text: string; options: { indentLevel: number; } }[] = [];
                                const buildList = (node: HierarchyNodeData, level: number) => {
                                    listItems.push({ text: node.name, options: { indentLevel: level } });
                                    if (node.children) node.children.forEach(child => buildList(child, level + 1));
                                };
                                buildList(data, 0);
                                pptxSlide.addText(listItems, { ...contentBounds, color: 'f1f5f9', fontSize: 18, bullet: { type: 'bullet' } });
                             }
                             break;
                        }

                        case 'timeline': {
                            const timelineItems = slide.content.map(item => {
                                const parts = item.split('::');
                                return { key: parts[0]?.trim() || '', value: parts[1]?.trim() || '' };
                            });
                            const tableRows = timelineItems.map(item => [
                                { text: item.key, options: { fontFace: 'Arial', bold: true, color: '38bdf8', align: 'right', valign: 'top' } },
                                { text: item.value, options: { fontFace: 'Arial', color: 'e2e8f0', valign: 'top' } }
                            ]);
                            if (tableRows.length > 0) {
                                pptxSlide.addTable(tableRows, { ...contentBounds, colW: [contentBounds.w * 0.3, contentBounds.w * 0.7], border: { type: 'none' } });
                            }
                            break;
                        }
                        
                        case 'blocks': {
                            const blocks = slide.content;
                            const numBlocks = Math.min(blocks.length, 4);
                            if (numBlocks === 0) break;

                            const getGrid = (n: number) => {
                                if (n === 1) return [{ x: 0, y: 0, w: 1, h: 1 }];
                                if (n === 2) return [{ x: 0, y: 0.25, w: 0.48, h: 0.5 }, { x: 0.52, y: 0.25, w: 0.48, h: 0.5 }];
                                return [{ x: 0, y: 0, w: 0.48, h: 0.48 }, { x: 0.52, y: 0, w: 0.48, h: 0.48 }, { x: 0, y: 0.52, w: 0.48, h: 0.48 }, { x: 0.52, y: 0.52, w: 0.48, h: 0.48 }];
                            };
                            const grid = getGrid(numBlocks);

                            blocks.slice(0, 4).forEach((block, index) => {
                                if(grid[index]) {
                                    const itemBounds = {
                                        x: contentBounds.x + grid[index].x * contentBounds.w,
                                        y: contentBounds.y + grid[index].y * contentBounds.h,
                                        w: grid[index].w * contentBounds.w,
                                        h: grid[index].h * contentBounds.h,
                                    };
                                    pptxSlide.addText(block, { ...itemBounds, fontSize: 16, color: 'f1f5f9', align: 'center', valign: 'middle', shape: pres.ShapeType.rect, fill: { color: '293952' } });
                                 }
                            });
                            break;
                        }
                        
                        case 'cta': {
                             pptxSlide.addText(slide.content[0] || '', { x: 1, y: 2.0, w: 8, h: 2, align: 'center', valign: 'top', fontSize: 24, color: 'e2e8f0' });
                             if (slide.content[1]) {
                                 pptxSlide.addText(slide.content[1], { x: 3.5, y: 4.25, w: 3, h: 0.75, align: 'center', valign: 'middle', fontSize: 20, bold: true, color: 'FFFFFF', shape: pres.ShapeType.roundRect, fill: { color: '16a34a' } });
                             }
                             break;
                        }

                        case 'circular-diagram': {
                            const slideW = 10, slideH = 5.625;
                            const centerX = slideW / 2, centerY = slideH / 2;

                            // Central Title Circle
                            pptxSlide.addShape(pres.ShapeType.oval, {
                                x: centerX - 1.25, y: centerY - 1.25, w: 2.5, h: 2.5,
                                fill: { color: '293952' },
                                line: { color: '38bdf8', width: 2 }
                            });
                            pptxSlide.addText(slide.title, {
                                x: centerX - 1.25, y: centerY - 1.25, w: 2.5, h: 2.5,
                                align: 'center', valign: 'middle',
                                color: '38bdf8', bold: true, fontSize: 16
                            });

                            // Items around circle
                            const items = slide.content;
                            const count = items.length;
                            if (count > 0) {
                                const radius = 2.4; // inches
                                const itemW = 1.6, itemH = 1.0;
    
                                items.forEach((item, index) => {
                                    const angle = (index / count) * 2 * Math.PI - (Math.PI / 2); // Start from top
                                    const itemCenterX = centerX + Math.cos(angle) * radius;
                                    const itemCenterY = centerY + Math.sin(angle) * radius;
                                    
                                    const itemX = itemCenterX - itemW / 2;
                                    const itemY = itemCenterY - itemH / 2;
    
                                    pptxSlide.addShape(pres.ShapeType.rect, {
                                        x: itemX, y: itemY, w: itemW, h: itemH,
                                        fill: { color: '293952' },
                                        line: { color: '475569', width: 1 }
                                    });
                                    pptxSlide.addText(item, {
                                        x: itemX + 0.1, y: itemY + 0.1, w: itemW - 0.2, h: itemH - 0.2,
                                        align: 'center', valign: 'middle',
                                        color: 'f1f5f9', fontSize: 11
                                    });
                                });
                            }
                            break;
                        }

                        case 'default':
                        default:
                            pptxSlide.addText(slide.content.map(p => ({ text: p })), { ...contentBounds, fontSize: 18, color: 'f1f5f9', bullet: true });
                            break;
                    }
                } catch(e) {
                     pptxSlide.addText(`Error rendering slide: #${slide.id}`, { x: 0.5, y: 2.5, w: '90%', h: 0.5, align: 'center', color: 'FF0000' });
                     console.error(`Failed to generate slide #${slide.id}`, e);
                }
            }

            const fileName = (slides[0]?.title || 'AI-Presentation').replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '_');
            pres.writeFile({ fileName: `${fileName}.pptx` });

        } catch (error) {
            console.error("Failed to generate PPTX file:", error);
            // Consider showing an error to the user here
        } finally {
            setIsDownloading(false);
        }
    };
    
    const handlePdfDownload = async () => {
        if (isDownloading || isDownloadingPdf) return;
        setIsDownloadingPdf(true);

        try {
            const { jsPDF } = jspdf;
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [1920, 1080]
            });

            const slideElements = document.querySelectorAll('.slide-wrapper > div');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            for (let i = 0; i < slides.length; i++) {
                const slideElement = slideElements[i] as HTMLElement;
                if (!slideElement) continue;

                const canvas = await html2canvas(slideElement, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#0f172a' // Ensure background is not transparent
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.9);

                if (i > 0) {
                    pdf.addPage([1920, 1080], 'landscape');
                }

                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            }
            
            const fileName = (slides[0]?.title || 'AI-Presentation').replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '_');
            pdf.save(`${fileName}.pdf`);

        } catch (error) {
            console.error("Failed to generate PDF file:", error);
        } finally {
            setIsDownloadingPdf(false);
        }
    };


    return (
        <div className="flex flex-col h-full w-full bg-slate-800">
            <header className="presentation-header flex justify-between items-center p-3 border-b border-slate-700">
                <h2 className="font-bold text-xl ml-4">最終簡報預覽</h2>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-slate-400">{`投影片 ${currentSlide + 1} / ${slides.length}`}</span>
                    <button onClick={onReset} className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-sky-600 transition-colors" title="Back to Editor">
                        <PencilSquareIcon className="w-5 h-5" />
                        <span>返回編輯</span>
                    </button>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handlePptxDownload}
                            disabled={isDownloading || isDownloadingPdf}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                            title="Download as PPTX"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            <span>{isDownloading ? '下載中...' : '下載 (PPT)'}</span>
                        </button>
                        <button
                            onClick={handlePdfDownload}
                            disabled={isDownloading || isDownloadingPdf}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                            title="Download as PDF"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            <span>{isDownloadingPdf ? '下載中...' : '下載 (PDF)'}</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="presentation-viewport flex-grow relative overflow-hidden bg-slate-900">
                {slides.map((slide, index) => {
                    let position = '100%';
                    if (index === currentSlide) {
                        position = '0%';
                    } else if (index < currentSlide) {
                        position = '-100%';
                    }
                    return (
                        <div key={slide.id} className="slide-wrapper">
                             <Slide slide={slide} position={position} />
                        </div>
                    )
                })}
            </div>

            <footer className="presentation-footer flex justify-center items-center p-3 border-t border-slate-700 space-x-4">
                <button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="p-3 rounded-full bg-slate-700 hover:bg-sky-600 disabled:bg-slate-900 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button
                    onClick={nextSlide}
                    disabled={currentSlide === slides.length - 1}
                    className="p-3 rounded-full bg-slate-700 hover:bg-sky-600 disabled:bg-slate-900 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRightIcon className="w-6 h-6" />
                </button>
            </footer>
        </div>
    );
};

export default Presentation;