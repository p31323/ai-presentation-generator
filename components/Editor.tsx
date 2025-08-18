import React, { useState, useEffect, useRef } from 'react';
import { SlideData } from '../types';
import ImageSearchModal from './ImageSearchModal'; // Import the new component
import { 
    HomeIcon, 
    PresentationChartBarIcon, 
    PencilSquareIcon,
    ListBulletIcon,
    ViewColumnsIcon,
    Bars3BottomLeftIcon,
    StarIcon,
    ChatBubbleLeftRightIcon,
    ScaleIcon,
    RectangleGroupIcon,
    MegaphoneIcon,
    ChevronDownIcon,
    ArrowUpCircleIcon,
    ArrowDownCircleIcon,
    ArrowLeftCircleIcon,
    ArrowRightCircleIcon,
    ChartBarIcon,
    ChartPieIcon,
    ArrowTrendingUpIcon,
    Squares2X2Icon,
    ArrowLongRightIcon,
    ArrowPathIcon,
    ShareIcon,
    PlusCircleIcon,
    XCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from './Icons';

type EditorProps = {
    slides: SlideData[];
    onUpdateSlide: (slide: SlideData) => void;
    onFinalize: () => void;
    onBack: () => void;
};

const layoutOptions: { name: SlideData['layout']; icon: React.FC<{className?: string}>; label: string; }[] = [
    { name: 'title', icon: StarIcon, label: '標題頁' },
    { name: 'default', icon: ListBulletIcon, label: '預設' },
    { name: 'quote', icon: ChatBubbleLeftRightIcon, label: '引言' },
    { name: 'blocks', icon: ViewColumnsIcon, label: '區塊' },
    { name: 'timeline', icon: Bars3BottomLeftIcon, label: '時間軸' },
    { name: 'process-flow', icon: ArrowLongRightIcon, label: '流程圖' },
    { name: 'circular-diagram', icon: ArrowPathIcon, label: '環狀圖' },
    { name: 'hierarchy', icon: ShareIcon, label: '層級圖' },
    { name: 'comparison', icon: ScaleIcon, label: '比較' },
    { name: 'swot-analysis', icon: Squares2X2Icon, label: 'SWOT 分析' },
    { name: 'features', icon: RectangleGroupIcon, label: '特色' },
    { name: 'cta', icon: MegaphoneIcon, label: 'CTA' },
    { name: 'bar-chart', icon: ChartBarIcon, label: '長條圖' },
    { name: 'pie-chart', icon: ChartPieIcon, label: '圓餅圖' },
    { name: 'line-chart', icon: ArrowTrendingUpIcon, label: '折線圖' },
];

const positionLabels: Record<NonNullable<SlideData['imagePosition']>, string> = {
    top: '上',
    bottom: '下',
    left: '左',
    right: '右',
};

const Editor: React.FC<EditorProps> = ({ slides, onUpdateSlide, onFinalize, onBack }) => {
    const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
    const [isLayoutDropdownOpen, setIsLayoutDropdownOpen] = useState(false);
    const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (slides.length > 0 && (!selectedSlideId || !slides.find(s => s.id === selectedSlideId))) {
            setSelectedSlideId(slides[0].id);
        }
    }, [slides, selectedSlideId]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsLayoutDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const selectedSlide = slides.find(s => s.id === selectedSlideId);
    const selectedSlideIndex = slides.findIndex(s => s.id === selectedSlideId);

    const handleFieldChange = (field: keyof SlideData, value: any) => {
        if (selectedSlide) {
            onUpdateSlide({ ...selectedSlide, [field]: value });
        }
    };

    const handleImageSelect = (imageUrl: string) => {
        if (selectedSlide) {
            onUpdateSlide({ ...selectedSlide, imageUrl });
        }
        setIsImageSearchOpen(false);
    };
    
    const handleContentChange = (index: number, value: string) => {
        if (selectedSlide) {
            const newContent = [...(selectedSlide.content || [])];
            while(newContent.length <= index) newContent.push('');
            newContent[index] = value;
            handleFieldChange('content', newContent);
        }
    };
    
    const handleComplexContentChange = (index: number, parts: (string | undefined)[]) => {
         if (selectedSlide) {
            const newContent = [...(selectedSlide.content || [])];
            newContent[index] = parts.join(' :: ');
            handleFieldChange('content', newContent);
        }
    }

    const renderContentInputs = () => {
        if (!selectedSlide) return null;

        const chartLayouts: SlideData['layout'][] = ['bar-chart', 'pie-chart', 'line-chart'];
        if (chartLayouts.includes(selectedSlide.layout)) {
            let chartData: { label: string, value: number }[] = [];
            try {
                if (selectedSlide.content?.[0]) {
                    const parsed = JSON.parse(selectedSlide.content[0]);
                    if (Array.isArray(parsed)) chartData = parsed;
                }
            } catch (e) { /* ignore parse error */ }

            const updateChartData = (newData: any[]) => handleFieldChange('content', [JSON.stringify(newData, null, 2)]);
            const updateItem = (index: number, field: 'label' | 'value', value: string) => {
                const newData = [...chartData];
                newData[index] = { ...newData[index], [field]: field === 'value' ? (Number(value) || 0) : value };
                updateChartData(newData);
            };
            const addItem = () => updateChartData([...chartData, { label: '新項目', value: 10 }]);
            const removeItem = (index: number) => updateChartData(chartData.filter((_, i) => i !== index));

            return (
                <div className="flex-grow flex flex-col gap-2">
                    <div className="overflow-y-auto pr-2 space-y-2 flex-grow">
                        {chartData.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 bg-slate-900/70 p-2 rounded-md border border-slate-600">
                                <input type="text" placeholder="標籤" value={item.label} onChange={e => updateItem(index, 'label', e.target.value)} className="flex-grow bg-slate-800 border-slate-600 rounded p-1 text-sm text-slate-100 focus:ring-1 focus:ring-sky-500 focus:outline-none"/>
                                <input type="number" placeholder="數值" value={item.value} onChange={e => updateItem(index, 'value', e.target.value)} className="w-24 bg-slate-800 border-slate-600 rounded p-1 text-sm text-slate-100 focus:ring-1 focus:ring-sky-500 focus:outline-none"/>
                                <button onClick={() => removeItem(index)} title="移除項目" className="p-1 text-slate-400 hover:text-red-500"><XCircleIcon className="w-6 h-6"/></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={addItem} className="mt-2 flex items-center justify-center gap-2 w-full text-sm py-2 px-3 rounded-md bg-sky-600/50 hover:bg-sky-600 text-sky-200 hover:text-white transition-colors">
                        <PlusCircleIcon className="w-5 h-5"/> 新增圖表項目
                    </button>
                </div>
            );
        }

        if (selectedSlide.layout === 'hierarchy') {
            const jsonToFlat = (node: any, level = 0, list: {name: string, level: number}[] = []) => {
                if (!node || !node.name) return list;
                list.push({ name: node.name, level });
                if (node.children) node.children.forEach((child: any) => jsonToFlat(child, level + 1, list));
                return list;
            };
            const flatToJson = (list: {name: string, level: number}[]) => {
                if (!list || list.length === 0) return null;
                const root = { name: list[0].name, children: [] as any[] };
                const stack = [{ node: root, level: 0 }];
                for (let i = 1; i < list.length; i++) {
                    const currentItem = list[i];
                    const newNode = { name: currentItem.name, children: [] as any[] };
                    while (stack.length > 0 && currentItem.level <= stack[stack.length - 1].level) {
                        stack.pop();
                    }
                    if (stack.length > 0) stack[stack.length - 1].node.children.push(newNode);
                    stack.push({ node: newNode, level: currentItem.level });
                }
                return root;
            };

            let hierarchyData: {name: string, level: number}[] = [];
            try {
                if (selectedSlide.content?.[0]) hierarchyData = jsonToFlat(JSON.parse(selectedSlide.content[0]));
            } catch(e) {}
            
            const updateHierarchy = (newList: {name: string, level: number}[]) => handleFieldChange('content', [JSON.stringify(flatToJson(newList), null, 2)]);
            const updateName = (index: number, name: string) => {
                const newList = [...hierarchyData];
                newList[index] = {...newList[index], name};
                updateHierarchy(newList);
            };
            const indent = (index: number) => {
                if (index === 0) return;
                const newList = [...hierarchyData];
                if(newList[index].level >= newList[index-1].level + 1) return;
                newList[index].level++;
                updateHierarchy(newList);
            };
            const outdent = (index: number) => {
                const newList = [...hierarchyData];
                if(newList[index].level === 0) return;
                newList[index].level--;
                updateHierarchy(newList);
            };
            const addItem = (index: number) => {
                const newList = [...hierarchyData];
                newList.splice(index + 1, 0, {name: "新節點", level: newList[index]?.level || 0});
                updateHierarchy(newList);
            };
            const removeItem = (index: number) => {
                 const newList = [...hierarchyData];
                 const levelToRemove = newList[index].level;
                 // Also remove children
                 let itemsToRemove = 1;
                 let nextIndex = index + 1;
                 while(nextIndex < newList.length && newList[nextIndex].level > levelToRemove) {
                     itemsToRemove++;
                     nextIndex++;
                 }
                 newList.splice(index, itemsToRemove);
                 updateHierarchy(newList);
            };

            return (
                 <div className="flex-grow flex flex-col gap-2">
                    <div className="overflow-y-auto pr-2 space-y-1 flex-grow">
                        {hierarchyData.map((item, index) => (
                            <div key={index} className="flex items-center gap-1 bg-slate-900/70 p-1 rounded-md border border-slate-700">
                                <div style={{width: `${item.level * 20}px`}}></div>
                                <input type="text" value={item.name} onChange={e => updateName(index, e.target.value)} className="flex-grow bg-transparent p-1 text-sm text-slate-100 focus:outline-none"/>
                                <button onClick={() => indent(index)} disabled={index === 0} className="p-1 text-slate-400 hover:text-sky-400 disabled:opacity-20"><ChevronRightIcon className="w-5 h-5"/></button>
                                <button onClick={() => outdent(index)} disabled={item.level === 0} className="p-1 text-slate-400 hover:text-sky-400 disabled:opacity-20"><ChevronLeftIcon className="w-5 h-5"/></button>
                                <button onClick={() => addItem(index)} className="p-1 text-slate-400 hover:text-green-400"><PlusCircleIcon className="w-5 h-5"/></button>
                                <button onClick={() => removeItem(index)} className="p-1 text-slate-400 hover:text-red-500"><XCircleIcon className="w-5 h-5"/></button>
                            </div>
                        ))}
                    </div>
                     {hierarchyData.length === 0 && <button onClick={() => updateHierarchy([{name: '根節點', level: 0}])} className="mt-2 flex items-center justify-center gap-2 w-full text-sm py-2 px-3 rounded-md bg-sky-600/50 hover:bg-sky-600 text-sky-200 hover:text-white transition-colors">
                        <PlusCircleIcon className="w-5 h-5"/> 新增根節點
                    </button>}
                </div>
            );
        }

        const simpleListLayouts: SlideData['layout'][] = ['default', 'blocks', 'process-flow', 'circular-diagram'];
        if (simpleListLayouts.includes(selectedSlide.layout)) {
            const content = selectedSlide.content || [];
            const updateList = (newList: string[]) => handleFieldChange('content', newList);
            const updateItem = (index: number, value: string) => { const c = [...content]; c[index] = value; updateList(c); };
            const addItem = () => updateList([...content, '']);
            const removeItem = (index: number) => updateList(content.filter((_, i) => i !== index));
            const placeholders: Record<string, string> = { 'default': '項目符號內容', 'blocks': '區塊內容', 'process-flow': '流程步驟', 'circular-diagram': '環狀項目' };
            
            return (
                 <div className="flex-grow flex flex-col gap-2">
                    <div className="overflow-y-auto pr-2 space-y-2 flex-grow">
                        {content.map((point, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <textarea value={point} onChange={e => updateItem(index, e.target.value)} placeholder={`${placeholders[selectedSlide.layout]} #${index + 1}`} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-300 resize-none focus:ring-2 focus:ring-sky-500 focus:outline-none" rows={2}/>
                                <button onClick={() => removeItem(index)} className="p-1 text-slate-400 hover:text-red-500"><XCircleIcon className="w-6 h-6"/></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={addItem} className="mt-2 flex items-center justify-center gap-2 w-full text-sm py-2 px-3 rounded-md bg-sky-600/50 hover:bg-sky-600 text-sky-200 hover:text-white transition-colors">
                        <PlusCircleIcon className="w-5 h-5"/> 新增項目
                    </button>
                </div>
            );
        }
        
        switch (selectedSlide.layout) {
            case 'title':
                return <textarea value={selectedSlide.content?.[0] || ''} onChange={(e) => handleContentChange(0, e.target.value)} placeholder="輸入副標題 (選填)" className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-300 resize-none focus:ring-2 focus:ring-sky-500 focus:outline-none" rows={2}/>;
            case 'quote':
                 return (
                    <div className="flex-grow flex flex-col gap-2 overflow-y-auto pr-2">
                        <textarea value={selectedSlide.content?.[0] || ''} onChange={(e) => handleContentChange(0, e.target.value)} placeholder="輸入引言內容" className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-300 resize-none focus:ring-2 focus:ring-sky-500 focus:outline-none" rows={4}/>
                        <input type="text" value={selectedSlide.content?.[1] || ''} onChange={(e) => handleContentChange(1, e.target.value)} placeholder="輸入來源或作者" className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-sm text-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none"/>
                   </div>
                );
            case 'timeline':
                return (
                    <div className="flex-grow flex flex-col gap-3 overflow-y-auto pr-2">
                        {(selectedSlide.content || []).map((point, index) => {
                            const [key, value] = point.split('::').map(p => p.trim());
                            return (
                                <div key={index} className="bg-slate-900/70 p-2 rounded-md border border-slate-600">
                                    <input type="text" placeholder="日期 / 標題" value={key || ''} onChange={(e) => handleComplexContentChange(index, [e.target.value, value])} className="w-full bg-slate-800 border-b border-slate-500 rounded-t-sm p-1 text-sm font-semibold text-sky-300 focus:ring-1 focus:ring-sky-500 focus:outline-none"/>
                                    <textarea value={value || ''} placeholder="事件描述" onChange={(e) => handleComplexContentChange(index, [key, e.target.value])} className="w-full bg-transparent p-1 text-slate-300 resize-none focus:outline-none mt-1" rows={2}/>
                                </div>
                            );
                        })}
                    </div>
                );
            case 'swot-analysis':
                const swotLabels = ['優勢 (Strengths)', '劣勢 (Weaknesses)', '機會 (Opportunities)', '威脅 (Threats)'];
                const swotColors = ['text-green-300', 'text-red-300', 'text-sky-300', 'text-amber-300'];
                return (
                    <div className="flex-grow grid grid-cols-2 grid-rows-2 gap-4 overflow-y-auto">
                        {swotLabels.map((label, index) => (
                            <div key={index}>
                                <label className={`block text-sm font-semibold mb-1 ${swotColors[index]}`}>{label}</label>
                                <textarea
                                    value={selectedSlide.content?.[index] || ''}
                                    onChange={e => handleContentChange(index, e.target.value)}
                                    placeholder={`輸入${label}要點...`}
                                    className="w-full h-full min-h-[100px] bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-300 resize-none focus:ring-2 focus:ring-sky-500 focus:outline-none"
                                />
                            </div>
                        ))}
                    </div>
                );
            case 'comparison':
                return (
                    <div className="flex-grow grid grid-cols-2 gap-4 overflow-y-auto pr-2">
                        <div>
                            <input type="text" placeholder="主題 A 標題" value={selectedSlide.content?.[0] || ''} onChange={e => handleContentChange(0, e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-sm font-semibold text-green-300 focus:ring-2 focus:ring-sky-500 focus:outline-none mb-2" />
                            <textarea placeholder="主題 A 內容 (一行一個重點)" value={selectedSlide.content?.[1] || ''} onChange={e => handleContentChange(1, e.target.value)} className="w-full h-48 bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-300 resize-none focus:ring-2 focus:ring-sky-500 focus:outline-none" />
                        </div>
                        <div>
                            <input type="text" placeholder="主題 B 標題" value={selectedSlide.content?.[2] || ''} onChange={e => handleContentChange(2, e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-sm font-semibold text-red-300 focus:ring-2 focus:ring-sky-500 focus:outline-none mb-2" />
                            <textarea placeholder="主題 B 內容 (一行一個重點)" value={selectedSlide.content?.[3] || ''} onChange={e => handleContentChange(3, e.target.value)} className="w-full h-48 bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-300 resize-none focus:ring-2 focus:ring-sky-500 focus:outline-none" />
                        </div>
                    </div>
                );
            case 'features':
                return (
                     <div className="flex-grow flex flex-col gap-3 overflow-y-auto pr-2">
                        {(selectedSlide.content || []).map((point, index) => {
                             const [icon, title, desc] = point.split('::').map(p => p.trim());
                             return (
                                 <div key={index} className="bg-slate-900/70 p-2 rounded-md border border-slate-600">
                                     <div className="grid grid-cols-3 gap-2">
                                         <input type="text" placeholder="圖示名稱" value={icon || ''} onChange={(e) => handleComplexContentChange(index, [e.target.value, title, desc])} className="col-span-1 bg-slate-800 p-1 text-sm text-sky-300 focus:ring-1 focus:ring-sky-500 focus:outline-none rounded-sm"/>
                                         <input type="text" placeholder="特色標題" value={title || ''} onChange={(e) => handleComplexContentChange(index, [icon, e.target.value, desc])} className="col-span-2 bg-slate-800 p-1 text-sm font-semibold text-slate-100 focus:ring-1 focus:ring-sky-500 focus:outline-none rounded-sm"/>
                                     </div>
                                     <textarea value={desc || ''} placeholder="特色描述" onChange={(e) => handleComplexContentChange(index, [icon, title, e.target.value])} className="w-full bg-transparent p-1 text-slate-300 resize-none focus:outline-none mt-1" rows={2}/>
                                 </div>
                             );
                        })}
                     </div>
                );
            case 'cta':
                 return (
                    <div className="flex-grow flex flex-col gap-2 overflow-y-auto pr-2">
                        <textarea value={selectedSlide.content?.[0] || ''} onChange={(e) => handleContentChange(0, e.target.value)} placeholder="輸入說明文字" className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-slate-300 resize-none focus:ring-2 focus:ring-sky-500 focus:outline-none" rows={3}/>
                        <input type="text" value={selectedSlide.content?.[1] || ''} onChange={(e) => handleContentChange(1, e.target.value)} placeholder="輸入按鈕文字或聯絡資訊" className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-lg text-white font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none"/>
                   </div>
                );
            default:
                return (
                    <div className="flex-grow flex flex-col gap-2 overflow-y-auto pr-2">
                       <p className="text-slate-500 text-center p-4">此版面沒有可編輯的內容欄位。</p>
                   </div>
                );
        }
    };

    return (
        <div className="flex h-full w-full">
            {/* Sidebar */}
            <aside className="w-1/4 bg-slate-900/50 p-4 flex flex-col border-r border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-sky-400">投影片列表</h2>
                     <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-700 transition-colors" title="Start Over">
                        <HomeIcon className="w-6 h-6 text-slate-400" />
                    </button>
                </div>
                <div className="overflow-y-auto flex-grow pr-2">
                    {slides.map((slide, index) => (
                        <button
                            key={slide.id}
                            onClick={() => setSelectedSlideId(slide.id)}
                            className={`w-full text-left p-3 mb-2 rounded-lg transition-colors flex items-center gap-3 ${selectedSlideId === slide.id ? 'bg-sky-600/50 ring-2 ring-sky-500' : 'bg-slate-800 hover:bg-slate-700'}`}
                        >
                            {React.createElement(layoutOptions.find(opt => opt.name === slide.layout)?.icon || ListBulletIcon, { className: "w-5 h-5 text-slate-400 flex-shrink-0"})}
                            <p className="font-bold text-sm text-slate-300 truncate">#{index + 1} {slide.title}</p>
                        </button>
                    ))}
                </div>
                <button 
                  onClick={onFinalize}
                  className="w-full mt-4 px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors flex items-center justify-center space-x-2"
                >
                    <PresentationChartBarIcon className="w-6 h-6" />
                    <span>完成並預覽簡報</span>
                </button>
            </aside>

            {/* Main Editor Panel */}
            <main className="w-3/4 flex flex-col p-6 bg-slate-800">
                {!selectedSlide ? (
                    <div className="flex items-center justify-center h-full text-slate-500">選擇一張投影片以開始編輯</div>
                ) : (
                    <>
                        {isImageSearchOpen && (
                            <ImageSearchModal
                                isOpen={isImageSearchOpen}
                                onClose={() => setIsImageSearchOpen(false)}
                                onImageSelect={handleImageSelect}
                                initialQuery={selectedSlide.imagePrompt}
                            />
                        )}
                        <div className="flex justify-between items-start pb-4 mb-4 border-b border-slate-700">
                           <div>
                                <h3 className="text-2xl font-bold flex items-center mb-4">
                                    <PencilSquareIcon className="w-7 h-7 mr-3 text-sky-400"/>
                                    編輯投影片 #{selectedSlideIndex + 1}
                                </h3>
                                <div className="flex items-center gap-4">
                                     <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setIsLayoutDropdownOpen(prev => !prev)}
                                            className="flex items-center justify-between w-40 px-3 py-2 text-sm rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                {React.createElement(layoutOptions.find(opt => opt.name === selectedSlide.layout)?.icon || ListBulletIcon, { className: "w-5 h-5" })}
                                                <span>{layoutOptions.find(opt => opt.name === selectedSlide.layout)?.label}</span>
                                            </div>
                                            <ChevronDownIcon className={`w-4 h-4 transition-transform ${isLayoutDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        {isLayoutDropdownOpen && (
                                            <div className="absolute top-full mt-2 w-48 bg-slate-600 rounded-md shadow-lg z-20 overflow-y-auto max-h-60 ring-1 ring-black/5">
                                            {layoutOptions.map(opt => (
                                                <button
                                                key={opt.name}
                                                onClick={() => {
                                                    handleFieldChange('layout', opt.name);
                                                    setIsLayoutDropdownOpen(false);
                                                }}
                                                className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-sky-600"
                                                >
                                                {React.createElement(opt.icon, { className: "w-5 h-5" })}
                                                <span>{opt.label}</span>
                                                </button>
                                            ))}
                                            </div>
                                        )}
                                    </div>
                                    { !['title', 'comparison', 'features', 'cta', 'bar-chart', 'pie-chart', 'line-chart', 'swot-analysis', 'process-flow', 'circular-diagram', 'hierarchy'].includes(selectedSlide.layout) && (
                                    <div className="flex items-center space-x-1 p-1 rounded-lg bg-slate-700">
                                        {(['left', 'right', 'top', 'bottom'] as const).map(pos => {
                                            const isActive = selectedSlide.imagePosition === pos;
                                            const Icon = {
                                                left: ArrowLeftCircleIcon,
                                                right: ArrowRightCircleIcon,
                                                top: ArrowUpCircleIcon,
                                                bottom: ArrowDownCircleIcon
                                            }[pos];
                                            return (
                                                <button
                                                  key={pos}
                                                  onClick={() => handleFieldChange('imagePosition', pos)}
                                                  className={`p-1.5 rounded-md transition-colors ${isActive ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-600'}`}
                                                  title={`圖片位置: ${positionLabels[pos]}`}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                   )}
                                </div>
                           </div>
                        </div>
                        <div className="flex-grow flex gap-6 overflow-hidden">
                            {/* Text Fields */}
                            <div className="w-1/2 flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">標題</label>
                                    <input
                                        type="text"
                                        value={selectedSlide.title}
                                        onChange={(e) => handleFieldChange('title', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-lg font-bold text-slate-100 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                                    />
                                </div>
                                <div className="flex-grow flex flex-col">
                                     <label className="block text-sm font-medium text-slate-400 mb-1">內容</label>
                                     {renderContentInputs()}
                                </div>
                            </div>

                            {/* Image Preview / Chart Preview */}
                            <div className="w-1/2 flex flex-col">
                                <label className="block text-sm font-medium text-slate-400 mb-1">
                                    {['bar-chart', 'pie-chart', 'line-chart', 'swot-analysis', 'process-flow', 'circular-diagram', 'hierarchy'].includes(selectedSlide.layout) 
                                        ? '資訊圖表預覽' 
                                        : `附圖預覽 (位置: ${positionLabels[selectedSlide.imagePosition!] || 'N/A'})`
                                    }
                                </label>
                                <div className="flex-grow bg-slate-900 rounded-md overflow-hidden relative group">
                                    {selectedSlide.imageUrl ? (
                                        <img src={selectedSlide.imageUrl} alt={selectedSlide.imagePrompt} className="w-full h-full object-cover" />
                                    ) : (
                                        !['bar-chart', 'pie-chart', 'line-chart', 'swot-analysis', 'process-flow', 'circular-diagram', 'hierarchy'].includes(selectedSlide.layout) && (
                                            <div className="w-full h-full flex items-center justify-center text-slate-500 p-4 text-center">
                                            <p>圖片生成失敗或此版面無附圖。<br/>({selectedSlide.imagePrompt})</p>
                                            </div>
                                        )
                                    )}
                                     {['bar-chart', 'pie-chart', 'line-chart', 'swot-analysis', 'process-flow', 'circular-diagram', 'hierarchy'].includes(selectedSlide.layout) ? (
                                        <div className="w-full h-full flex items-center justify-center text-slate-500 p-4 text-center">
                                            資訊圖表預覽會顯示在最終簡報中。
                                        </div>
                                     ) : (
                                        <button 
                                            onClick={() => setIsImageSearchOpen(true)}
                                            className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        >
                                            <div className="flex flex-col items-center text-white bg-slate-800/80 px-4 py-2 rounded-lg">
                                                <ArrowPathIcon className="w-8 h-8 mb-1" />
                                                <span className="font-semibold">更換圖片</span>
                                            </div>
                                        </button>
                                     )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default Editor;