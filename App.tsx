
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
    selectedRoomType: 'LIVING_ROOM',
    selectedModel: 'gemini-3-pro-image-preview',
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
      const result = await stageRoom(activeImage.url, state.selectedStyle, state.selectedRoomType, state.selectedModel);

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
        selectedRoomType: 'LIVING_ROOM',
        selectedModel: 'gemini-3-pro-image-preview',
        error: null,
      });
      setCurrentViewId('original');
    }
  };

  const handleDelete = (e: React.MouseEvent, imageId: string) => {
    e.stopPropagation();
    if (confirm("Delete this image and all its staged versions?")) {
      setState(prev => {
        const newUploaded = prev.uploadedImages.filter(img => img.id !== imageId);
        const newStaged = prev.stagedImages.filter(img => img.originalImageId !== imageId);

        // Determine new active image if we deleted the current one
        let newActiveId = prev.activeImageId;
        if (prev.activeImageId === imageId) {
          newActiveId = newUploaded.length > 0 ? newUploaded[newUploaded.length - 1].id : null;
        }

        return {
          ...prev,
          uploadedImages: newUploaded,
          stagedImages: newStaged,
          activeImageId: newActiveId
        };
      });
      // If we deleted the active image, reset view to original of the new active one (or null)
      if (state.activeImageId === imageId) {
        setCurrentViewId('original');
      }
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
          <div className="flex gap-4 items-center">
            {/* Model Switcher */}
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
              <button
                onClick={() => setState(prev => ({ ...prev, selectedModel: 'gemini-2.5-flash-image' }))}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${state.selectedModel === 'gemini-2.5-flash-image' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Fast (v2.5)
              </button>
              <button
                onClick={() => setState(prev => ({ ...prev, selectedModel: 'gemini-3-pro-image-preview' }))}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${state.selectedModel === 'gemini-3-pro-image-preview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Quality (v3.0)
              </button>
            </div>
            <div className="h-8 w-px bg-slate-800" />
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
          <div className="max-w-5xl mx-auto animate-slide-up pb-20">
            {/* Minimal Hero */}
            <div className="text-center py-16 space-y-8">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                Virtual Staging <span className="text-indigo-500">Simplified.</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-xl mx-auto">
                Turn empty rooms into furnished homes in seconds. Preserves all architectural details.
              </p>

              <div className="max-w-md mx-auto">
                <FileUploader onUpload={handleUpload} isLoading={state.isProcessing} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 mt-12">
              {/* Pro Tips Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Pro Tips for Best Results</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4 items-start p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                    <span className="text-indigo-500 font-bold text-lg">01</span>
                    <div>
                      <h4 className="font-bold text-white text-sm">Use Wide Angles</h4>
                      <p className="text-xs text-slate-400 mt-1">Photos taken from corners showing 2+ walls give the AI better depth perception.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                    <span className="text-indigo-500 font-bold text-lg">02</span>
                    <div>
                      <h4 className="font-bold text-white text-sm">Natural Lighting</h4>
                      <p className="text-xs text-slate-400 mt-1">Bright, daytime photos stage significantly better than dark or flash-lit rooms.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                    <span className="text-indigo-500 font-bold text-lg">03</span>
                    <div>
                      <h4 className="font-bold text-white text-sm">Empty is Best</h4>
                      <p className="text-xs text-slate-400 mt-1">While we can replace furniture, starting with an empty or decluttered room yields the cleanest results.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supported Styles Preview */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Available Design Styles</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {Object.values(StagingStyle).map((style) => (
                    <span key={style} className="px-3 py-1.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-slate-700">
                      {style}
                    </span>
                  ))}
                </div>

                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20">
                  <h4 className="font-bold text-white text-sm mb-2">Why Damon?</h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      Preserves structural elements (windows, doors, floors)
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      Professional interior design descriptions
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      Secure, client-side processing
                    </li>
                  </ul>
                </div>
              </div>
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
                      className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all relative group ${state.activeImageId === img.id ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                    >
                      <img src={img.url} className="w-full h-full object-cover" alt="Space" />

                      {/* Delete Overlay */}
                      <button
                        onClick={(e) => handleDelete(e, img.id)}
                        className="absolute inset-0 bg-red-500/80 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex"
                        title="Delete Image"
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass p-6 rounded-3xl space-y-6">
                {/* Room Type Selector */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Room Type</h3>
                  </div>
                  <select
                    value={state.selectedRoomType || 'LIVING_ROOM'}
                    onChange={(e) => setState(prev => ({ ...prev, selectedRoomType: e.target.value as any }))}
                    disabled={state.isProcessing}
                    className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl px-4 py-3 text-white font-medium focus:border-indigo-500 focus:outline-none transition-colors disabled:opacity-50"
                  >
                    <option value="LIVING_ROOM">Living Room</option>
                    <option value="BEDROOM">Bedroom</option>
                    <option value="KITCHEN">Kitchen</option>
                    <option value="DINING_ROOM">Dining Room</option>
                    <option value="OFFICE">Home Office</option>
                    <option value="BATHROOM">Bathroom</option>
                    <option value="OUTDOOR">Outdoor / Patio</option>
                  </select>
                </div>

                {/* Style Picker */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-[10px] uppercase tracking-widest text-indigo-400 font-black">Staging Style</h3>
                    <span className="text-[9px] text-slate-600 font-bold">{Object.keys(StagingStyle).length} styles</span>
                  </div>
                  <StylePicker
                    selected={state.selectedStyle}
                    onSelect={(s) => setState(prev => ({ ...prev, selectedStyle: s }))}
                    disabled={state.isProcessing}
                  />
                </div>

                <Button
                  onClick={handleStage}
                  className="w-full py-4 text-lg rounded-2xl font-bold"
                  isLoading={state.isProcessing}
                  variant="primary"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                  Generate Staging
                </Button>

                {state.error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-medium">
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
                        <Button variant="outline" onClick={handleStage} className="flex-1 md:flex-none">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                          Regenerate
                        </Button>
                        <Button onClick={handleDownload} className="flex-1 md:flex-none px-8">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Download
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
