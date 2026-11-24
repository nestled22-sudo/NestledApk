export interface MemeCanvasOptions {
  imageSrc: string;
  topText?: string;
  bottomText?: string;
  fontSizeScale?: number;
  preserveAnimatedIfUntouched?: boolean;
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.trim().split(/\s+/);
  if (words.length === 0 || (words.length === 1 && words[0] === '')) return [];
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i += 1) {
    const testLine = `${currentLine} ${words[i]}`;
    if (ctx.measureText(testLine).width <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine);
  return lines;
}

export async function renderMemeToDataUrl(options: MemeCanvasOptions): Promise<string> {
  const { imageSrc, topText = '', bottomText = '', fontSizeScale = 1 } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const maxDimension = 1200;
      let width = img.naturalWidth || 960;
      let height = img.naturalHeight || 720;

      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No se pudo inicializar el lienzo.'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const cleanTop = topText.trim().toUpperCase();
      const cleanBottom = bottomText.trim().toUpperCase();

      if (cleanTop || cleanBottom) {
        const baseFontSize = Math.max(24, Math.round((width / 14) * fontSizeScale));
        ctx.font = `900 ${baseFontSize}px "Plus Jakarta Sans", Impact, "Arial Black", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(4, Math.round(baseFontSize / 7));
        ctx.lineJoin = 'round';

        const maxTextWidth = width * 0.9;
        const lineHeight = baseFontSize * 1.15;

        if (cleanTop) {
          ctx.textBaseline = 'top';
          const topLines = wrapTextLines(ctx, cleanTop, maxTextWidth);
          topLines.forEach((line, idx) => {
            const y = height * 0.04 + idx * lineHeight;
            ctx.strokeText(line, width / 2, y);
            ctx.fillText(line, width / 2, y);
          });
        }

        if (cleanBottom) {
          ctx.textBaseline = 'bottom';
          const bottomLines = wrapTextLines(ctx, cleanBottom, maxTextWidth);
          const totalHeight = bottomLines.length * lineHeight;
          bottomLines.forEach((line, idx) => {
            const y = height - height * 0.04 - (totalHeight - (idx + 1) * lineHeight);
            ctx.strokeText(line, width / 2, y);
            ctx.fillText(line, width / 2, y);
          });
        }
      }

      const output = canvas.toDataURL('image/jpeg', 0.88);
      resolve(output);
    };

    img.onerror = () => {
      reject(new Error('No se pudo cargar la imagen seleccionada.'));
    };

    img.src = imageSrc;
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Error leyendo archivo.'));
      }
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });
}

export function triggerDataUrlDownload(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
