
import React, { useState, useEffect, useCallback } from 'react';
import { StagingStyle, StagedImage, AppState, UploadedImage } from './types';
import { stageRoom } from './services/gemini';
import { FileUploader } from './components/FileUploader';
import { StylePicker } from './components/StylePicker';
import { Button } from './components/Button';
import { ComparisonSlider } from './components/ComparisonSlider';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    uploadedImages: [],
    activeImageId: null,
    stagedImages: [],
    isProcessing: false,
    selectedStyle: StagingStyle.MODERN,
    error: null,
  });

  const [currentViewId, setCurrentViewId] = useState<'original' | string>('original');

  const handleUpload = useCallback((files: string[]) => {
    const newImages: UploadedImage[] = files.map(url => ({
      id: Math.random().toString(36).substring(7),
      url,
      timestamp: Date.now()
    }));

    setState(prev => ({
      ...prev,
      uploadedImages: [...prev.uploadedImages, ...newImages],
      activeImageId: newImages[newImages.length - 1].id, // Select the last uploaded image
      error: null
    }));
    setCurrentViewId('original');
  }, []);

  // Handle global paste for quick image swapping
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (state.isProcessing) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: string[] = [];
      let pendingReads = 0;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            pendingReads++;
            const reader = new FileReader();
            reader.onloadend = () => {
              files.push(reader.result as string);
              pendingReads--;
              if (pendingReads === 0) {
                handleUpload(files);
              }
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };
    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [state.isProcessing, handleUpload]);

  const activeImage = state.uploadedImages.find(img => img.id === state.activeImageId);

  // Filter staged images for the CURRENT active original image
  const activeStagedImages = state.stagedImages.filter(
    img => img.originalImageId === state.activeImageId
  );

  const handleStage = async () => {
    if (!activeImage) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const result = await stageRoom(activeImage.url, state.selectedStyle);

      const newStagedImage: StagedImage = {
        id: Math.random().toString(36).substring(7),
        originalImageId: activeImage.id,
        url: result.url,
        description: result.description,
        style: state.selectedStyle,
        timestamp: Date.now(),
      };

      setState(prev => ({
        ...prev,
        stagedImages: [newStagedImage, ...prev.stagedImages],
        isProcessing: false,
      }));

      // Automatically switch to the newly generated staging
      setCurrentViewId(newStagedImage.id);
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.message || "An error occurred during staging.",
        isProcessing: false,
      }));
    }
  };

  const activeStagedView = activeStagedImages.find(img => img.id === currentViewId);
  const currentImageUrl = currentViewId === 'original' ? activeImage?.url : activeStagedView?.url;

  const handleDownload = () => {
    if (!currentImageUrl) return;
    const link = document.createElement('a');
    link.href = currentImageUrl;
    link.download = `damon-staged-${state.selectedStyle.toLowerCase()}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    if (confirm("Reset everything? You will lose your current work.")) {
      setState({
        uploadedImages: [],
        activeImageId: null,
        stagedImages: [],
        isProcessing: false,
        selectedStyle: StagingStyle.MODERN,
        error: null,
      });
      setCurrentViewId('original');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200">
      {/* Navbar */}
      <nav className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] overflow-hidden">
              <img src={`${import.meta.env.BASE_URL}logo.png`} className="w-full h-full object-cover" alt="Damon Staging Logo" />
            </div>
            <h1 className="text-xl font-bold tracking-tighter text-white uppercase">Damon Staging Tool</h1>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={reset} className="text-xs">Reset Tool</Button>
            <div className="h-8 w-px bg-slate-800" />
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Vision Engine Active
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-6 py-12 max-w-7xl">
        {state.uploadedImages.length === 0 ? (
          <div className="max-w-4xl mx-auto space-y-16 animate-slide-up">
            <div className="text-center space-y-6">
              <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-widest border border-indigo-500/20">
                Next-Gen AI Staging
              </span>
              <h2 className="text-5xl md:text-7xl font-black text-white leading-tight">
                Transform Spaces <br />
                <span className="text-indigo-500">In Seconds.</span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
                Damon identifies room architecture and applies hyper-realistic virtual staging to your original listing photos.
              </p>
            </div>

            <FileUploader onUpload={handleUpload} isLoading={state.isProcessing} />

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                title="Zero Overlap"
                desc="Each new style is applied fresh to your original photo, ensuring perfect consistency."
              />
              <FeatureCard
                title="Design Expert"
                desc="Damon generates professional interior descriptions for every version created."
              />
              <FeatureCard
                title="Interactive Comparison"
                desc="Review original vs staged views with our precision slider tool."
              />
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-10 items-start animate-slide-up">
            {/* Control Panel */}
            <div className="lg:col-span-4 space-y-8 sticky top-28">

              {/* Space Gallery */}
              <div className="glass p-6 rounded-3xl space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Your Spaces</h3>
                  <div className="relative overflow-hidden cursor-pointer group">
                    <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold group-hover:text-indigo-300 transition-colors">+ Add More</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const files: string[] = [];
                          const fileList = Array.from(e.target.files);
                          // Reusing the upload logic slightly differently here for simplicity or exact same logic if abstracted
                          // For now, simple manual read for the add-more button
                          let processed = 0;
                          fileList.forEach(file => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              files.push(reader.result as string);
                              processed++;
                              if (processed === fileList.length) handleUpload(files);
                            };
                            reader.readAsDataURL(file);
                          });
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                  {state.uploadedImages.map(img => (
                    <div
                      key={img.id}
                      onClick={() => { setState(prev => ({ ...prev, activeImageId: img.id })); setCurrentViewId('original'); }}
                      className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${state.activeImageId === img.id ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                    >
                      <img src={img.url} className="w-full h-full object-cover" alt="Space" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass p-8 rounded-3xl space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm uppercase tracking-widest text-indigo-400 font-black">1. Pick a Style</h3>
                    <span className="text-[10px] text-slate-500 font-bold">Staging Active Room</span>
                  </div>
                  <StylePicker
                    selected={state.selectedStyle}
                    onSelect={(s) => setState(prev => ({ ...prev, selectedStyle: s }))}
                    disabled={state.isProcessing}
                  />
                </div>

                <Button
                  onClick={handleStage}
                  className="w-full py-5 text-xl rounded-2xl"
                  isLoading={state.isProcessing}
                  variant="primary"
                >
                  Generate {state.selectedStyle} View
                </Button>

                {state.error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium">
                    {state.error}
                  </div>
                )}
              </div>

              {/* Version History (Filtered for Active Image) */}
              {activeStagedImages.length > 0 && (
                <div className="glass p-6 rounded-3xl space-y-4">
                  <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Room History</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {/* Base Image Icon */}
                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => setCurrentViewId('original')}
                        className={`w-20 h-20 rounded-2xl border-2 flex-shrink-0 overflow-hidden transition-all duration-300 relative ${currentViewId === 'original' ? 'border-indigo-500 scale-105 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'border-slate-800 opacity-50 grayscale hover:opacity-100 hover:grayscale-0'}`}
                      >
                        <img src={activeImage?.url} className="w-full h-full object-cover" alt="Original Base" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-[8px] text-center text-white font-bold uppercase">Base</div>
                      </button>
                    </div>

                    {/* Staged Icons */}
                    {activeStagedImages.map(img => (
                      <div key={img.id} className="flex flex-col items-center gap-2">
                        <button
                          onClick={() => setCurrentViewId(img.id)}
                          className={`w-20 h-20 rounded-2xl border-2 flex-shrink-0 overflow-hidden transition-all duration-300 relative ${currentViewId === img.id ? 'border-indigo-500 scale-105 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'border-slate-800 opacity-60 hover:opacity-100'}`}
                        >
                          <img src={img.url} className="w-full h-full object-cover" alt={img.style} />
                          <div className="absolute inset-x-0 bottom-0 bg-indigo-600/60 py-0.5 text-[8px] text-center text-white font-bold uppercase">{img.style}</div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stage Preview */}
            <div className="lg:col-span-8 space-y-6">
              <div className="relative group">
                {state.isProcessing && (
                  <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center rounded-3xl border border-indigo-500/20">
                    <div className="relative w-24 h-24 mb-8">
                      <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-3">Staging In Progress</h3>
                    <p className="text-slate-400 text-center max-w-xs px-4">Applying professional {state.selectedStyle} furniture to your original photo...</p>
                  </div>
                )}

                {currentViewId !== 'original' && activeStagedView ? (
                  <div key={activeStagedView.id} className="animate-slide-up">
                    <ComparisonSlider before={activeImage!.url} after={activeStagedView.url} />
                  </div>
                ) : (
                  <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative aspect-[4/3] bg-slate-900 flex items-center justify-center">
                    {activeImage && (
                      <img src={activeImage.url} className="w-full h-full object-cover opacity-80" alt="Workspace Original" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl text-white font-bold">
                      Original Selection
                    </div>
                  </div>
                )}
              </div>

              {/* Information & Actions */}
              <div className="glass p-8 rounded-3xl space-y-6 transition-all duration-500">
                {currentViewId !== 'original' && activeStagedView ? (
                  <div className="animate-slide-up space-y-6">
                    <div>
                      <h4 className="text-indigo-400 text-[10px] uppercase tracking-[0.2em] font-black mb-3">Staging Insights</h4>
                      <p className="text-xl font-medium text-white leading-relaxed">
                        {activeStagedView.description}
                      </p>
                    </div>
                    <div className="h-px bg-slate-800" />
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex flex-wrap gap-4">
                        <div className="bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800 text-xs">
                          <span className="text-slate-500 mr-2 uppercase tracking-tighter">Style</span>
                          <span className="text-white font-bold">{activeStagedView.style}</span>
                        </div>
                        <div className="bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800 text-xs">
                          <span className="text-slate-500 mr-2 uppercase tracking-tighter">Source</span>
                          <span className="text-white font-bold italic underline underline-offset-4 decoration-indigo-500/50">Original Photo</span>
                        </div>
                      </div>
                      <div className="flex gap-3 w-full md:w-auto">
                        <Button variant="outline" onClick={() => setCurrentViewId('original')} className="flex-1 md:flex-none">View Original</Button>
                        <Button onClick={handleDownload} className="flex-1 md:flex-none px-8">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Download PNG
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="flex items-center justify-center gap-4 mb-4 text-slate-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-sm font-medium">Ready to stage your original capture.</span>
                    </div>
                    <p className="text-slate-400 text-sm max-w-sm mx-auto">Select any staging style from the panel on the left to see Damon's AI transform your space while preserving its structure.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-900 py-12 mt-auto">
        <div className="container mx-auto px-6 text-center space-y-4">
          <div className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Damon Staging Tool v2.1</div>
          <p className="text-slate-600 text-[9px] max-w-md mx-auto">Professional real estate staging powered by Gemini 2.5 Intelligence. Always processes the original shared capture for maximum fidelity.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/40 hover:border-indigo-500/50 transition-all duration-300 group">
    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mb-6 group-hover:scale-[3] group-hover:bg-indigo-400 transition-all" />
    <h4 className="text-lg font-bold text-white mb-3 tracking-tight">{title}</h4>
    <p className="text-sm text-slate-500 leading-relaxed font-medium">{desc}</p>
  </div>
);

export default App;
