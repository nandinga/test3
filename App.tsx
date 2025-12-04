import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Wand2, Sparkles as SparklesIcon } from 'lucide-react';
import { Experience } from './components/Experience';
import PolaroidProcessor from './components/PolaroidProcessor';
import { TreeState, UserPhoto } from './types';
import { v4 as uuidv4 } from 'uuid'; // We'll just use simple random string if uuid not avail, but standard practice.
// Since I can't import uuid without installing, I'll use a simple generator.

const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE_SHAPE);
  const [userImages, setUserImages] = useState<UserPhoto[]>([]);

  const toggleState = () => {
    setTreeState(prev => 
      prev === TreeState.TREE_SHAPE ? TreeState.SCATTERED : TreeState.TREE_SHAPE
    );
  };

  const handleImageProcessed = (base64: string) => {
    const newImage: UserPhoto = {
      id: generateId(),
      dataUrl: base64
    };
    setUserImages(prev => [...prev, newImage]);
    
    // Automatically form tree if we add a memory, feels magical
    if (treeState === TreeState.SCATTERED) {
      setTreeState(TreeState.TREE_SHAPE);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden">
      
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: false, toneMappingExposure: 1.5 }}>
          <Suspense fallback={null}>
            <Experience treeState={treeState} userImages={userImages} />
          </Suspense>
        </Canvas>
      </div>

      {/* Overlay UI */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6 md:p-12">
        
        {/* Header */}
        <header className="flex flex-col items-center justify-center text-center space-y-2 animate-fade-in">
            <div className="flex items-center gap-3">
                <SparklesIcon className="text-amber-400 w-6 h-6 animate-pulse" />
                <h3 className="serif text-amber-200 tracking-[0.3em] text-sm uppercase">The Arix Signature</h3>
                <SparklesIcon className="text-amber-400 w-6 h-6 animate-pulse" />
            </div>
            <h1 className="serif text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-yellow-200 to-amber-500 font-bold drop-shadow-lg">
                Christmas Magic
            </h1>
        </header>

        {/* Footer / Controls */}
        <div className="flex flex-col items-center gap-6 pointer-events-auto">
            
            <div className="flex items-center gap-6 backdrop-blur-md bg-black/30 p-4 rounded-3xl border border-white/10 shadow-2xl">
                
                {/* State Toggle */}
                <button 
                    onClick={toggleState}
                    className={`
                        group relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500
                        ${treeState === TreeState.TREE_SHAPE 
                            ? 'bg-emerald-900/80 hover:bg-emerald-800' 
                            : 'bg-amber-900/80 hover:bg-amber-800'}
                        border border-white/20 hover:scale-110 active:scale-95
                    `}
                >
                    <Wand2 
                        className={`w-8 h-8 text-white transition-transform duration-700 ${treeState === TreeState.SCATTERED ? 'rotate-180' : ''}`} 
                    />
                    <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-black/80 text-xs px-2 py-1 rounded text-white whitespace-nowrap">
                        {treeState === TreeState.TREE_SHAPE ? 'Scatter Magic' : 'Assemble Tree'}
                    </span>
                </button>

                {/* Separator */}
                <div className="w-px h-10 bg-white/20"></div>

                {/* Upload Action */}
                <PolaroidProcessor onImageProcessed={handleImageProcessed} />
                
            </div>

            <p className="text-xs text-amber-100/40 serif tracking-widest mt-4">
                {userImages.length} MEMORIES ON THE TREE
            </p>
        </div>
      </div>

      {/* Loading Overlay (Optional simple one for suspense) */}
      <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center bg-black transition-opacity duration-1000 opacity-0 animate-[fadeOut_1s_ease-out_forwards_2s]">
          <h1 className="serif text-amber-500 animate-pulse">Loading Magic...</h1>
      </div>
      
    </div>
  );
};

export default App;
