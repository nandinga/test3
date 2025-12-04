import React, { useRef, useState } from 'react';
import { Camera } from 'lucide-react';

interface PolaroidProcessorProps {
  onImageProcessed: (base64: string) => void;
}

const PolaroidProcessor: React.FC<PolaroidProcessorProps> = ({ onImageProcessed }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        processImage(img);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const processImage = (img: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const OUTPUT_WIDTH = 500;
    const OUTPUT_HEIGHT = 600;
    const PADDING = 20;
    const BOTTOM_SPACE = 120; // Space for the "Polaroid" chin

    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;

    if (!ctx) return;

    // 1. Draw White Background (Polaroid Card)
    ctx.fillStyle = '#FFFAF0'; // Slightly warm white
    ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

    // 2. Calculate aspect ratio fill for the photo area
    const drawAreaWidth = OUTPUT_WIDTH - (PADDING * 2);
    const drawAreaHeight = OUTPUT_HEIGHT - PADDING - BOTTOM_SPACE;
    
    // Draw a dark placeholder behind image just in case
    ctx.fillStyle = '#111';
    ctx.fillRect(PADDING, PADDING, drawAreaWidth, drawAreaHeight);

    // Center crop logic
    const scale = Math.max(drawAreaWidth / img.width, drawAreaHeight / img.height);
    const x = (drawAreaWidth / scale - img.width) / 2;
    const y = (drawAreaHeight / scale - img.height) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(PADDING, PADDING, drawAreaWidth, drawAreaHeight);
    ctx.clip();
    ctx.drawImage(
      img, 
      x * scale * -1, 
      y * scale * -1, 
      img.width, 
      img.height,
      PADDING, 
      PADDING, 
      drawAreaWidth * scale, 
      drawAreaHeight * scale
    );
    ctx.restore();

    // 3. Add a subtle shadow overlay inner border
    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 1;
    ctx.strokeRect(PADDING, PADDING, drawAreaWidth, drawAreaHeight);

    // 4. Output
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    onImageProcessed(dataUrl);
    setIsProcessing(false);
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
        className={`
          flex items-center justify-center gap-2 px-6 py-3 rounded-full 
          bg-gradient-to-r from-amber-200 to-yellow-500 
          text-yellow-950 font-bold uppercase tracking-wider shadow-lg shadow-amber-500/20
          hover:scale-105 active:scale-95 transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <Camera size={20} />
        {isProcessing ? 'Developing...' : 'Add Memory'}
      </button>
    </>
  );
};

export default PolaroidProcessor;
