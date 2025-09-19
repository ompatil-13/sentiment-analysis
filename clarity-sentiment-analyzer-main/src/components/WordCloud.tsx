import { useEffect, useRef } from "react";
// @ts-ignore - wordcloud package doesn't have proper TypeScript definitions
import WordCloud from "wordcloud";

interface WordData {
  text: string;
  size: number;
}

interface WordCloudComponentProps {
  words: WordData[];
  width?: number;
  height?: number;
}

export const WordCloudComponent = ({ 
  words, 
  width = 800, 
  height = 400 
}: WordCloudComponentProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || words.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Prepare word list for wordcloud library
    const wordList: [string, number][] = words.map(word => [word.text, word.size]);

    // Compute frequency bounds and font range for scaling
    const maxFreq = Math.max(...words.map(w => w.size));
    const minFreq = Math.min(...words.map(w => w.size));
    const minFontPx = Math.max(10, Math.round(width * 0.018));
    const maxFontPx = Math.max(minFontPx + 10, Math.round(width * 0.085));

    // Debug metrics
    try { console.debug('WordCloud: render', { count: words.length, minFreq, maxFreq, minFontPx, maxFontPx }); } catch {}

    // Resolve design system colors from CSS variables for canvas usage
    const root = getComputedStyle(document.documentElement);
    const colorVars = [
      '--primary',
      '--analytics-blue',
      '--analytics-green',
      '--analytics-purple',
      '--analytics-orange',
      '--sentiment-positive',
      '--sentiment-neutral'
    ];
    const paletteColors = colorVars
      .map(v => root.getPropertyValue(v).trim())
      .filter(Boolean)
      .map(v => `hsl(${v})`);

    // Configure word cloud options
    const options = {
      list: wordList,
      gridSize: Math.max(8, Math.round(12 * width / 1024)),
      weightFactor: (size: number) => {
        // Robust log scaling with safe handling when all freqs equal
        if (maxFreq === minFreq) return Math.round((minFontPx + maxFontPx) / 2);
        const logMin = Math.log(minFreq + 1);
        const logMax = Math.log(maxFreq + 1);
        const logVal = Math.log(size + 1);
        const t = (logVal - logMin) / (logMax - logMin); // 0..1
        return Math.round(minFontPx + t * (maxFontPx - minFontPx));
      },
      fontFamily: 'Inter, sans-serif',
      color: () => {
        if (paletteColors.length === 0) return 'hsl(215 20% 50%)';
        return paletteColors[Math.floor(Math.random() * paletteColors.length)];
      },
      rotateRatio: 0.25, // 25% rotated for readability
      rotationSteps: 2, // Only 0° and 90° rotations
      backgroundColor: 'transparent',
      drawOutOfBound: false,
      shrinkToFit: true,
      minSize: minFontPx,
      ellipticity: 0.8, // Slightly elliptical layout
    };

    try {
      WordCloud(canvas, options);
    } catch (error) {
      console.error('Word cloud generation failed:', error);
      
      // Fallback: simple text rendering
      ctx.font = '16px Inter, sans-serif';
      ctx.fillStyle = 'hsl(var(--primary))';
      ctx.textAlign = 'center';
      ctx.fillText('Word cloud generation failed', width / 2, height / 2);
      ctx.fillText(`Showing ${words.length} unique words`, width / 2, height / 2 + 24);
    }
  }, [words, width, height]);

  if (words.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-muted rounded-lg text-muted-foreground"
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="text-lg font-medium">No words to display</div>
          <div className="text-sm">Add some comments to generate a word cloud</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div className="relative inline-block">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="border rounded-lg bg-background max-w-full h-auto"
          style={{ 
            maxWidth: '100%',
            height: 'auto',
            aspectRatio: `${width} / ${height}`
          }}
        />
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          {words.length} unique words
        </div>
      </div>
    </div>
  );
};