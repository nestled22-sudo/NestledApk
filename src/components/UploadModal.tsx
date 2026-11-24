import { useState, useEffect, useRef } from 'react';
import { Download, ImagePlus, Sparkles, Upload, X } from 'lucide-react';
import { MEME_TEMPLATES, UPLOAD_CATEGORIES } from '../constants/memes';
import {
  fileToDataUrl,
  renderMemeToDataUrl,
  triggerDataUrlDownload,
} from '../utils/memeCanvas';
import type { MemeCategory, MemePost, UserProfile } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  initialMode: 'upload' | 'studio';
  currentUser: UserProfile;
  onClose: () => void;
  onCreated: (meme: MemePost) => void;
}

export function UploadModal({
  isOpen,
  initialMode,
  currentUser,
  onClose,
  onCreated,
}: UploadModalProps) {
  const [mode, setMode] = useState<'upload' | 'studio'>(initialMode);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<Exclude<MemeCategory, 'Todos'>>('Programación');
  const [uploadedRawUrl, setUploadedRawUrl] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(MEME_TEMPLATES[0].id);
  const [useTextOverlay, setUseTextOverlay] = useState(false);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      if (initialMode === 'studio') {
        const tpl = MEME_TEMPLATES[0];
        setSelectedTemplateId(tpl.id);
        setCategory(tpl.category);
        setTopText(tpl.defaultTop);
        setBottomText(tpl.defaultBottom);
        setUseTextOverlay(true);
      } else {
        setUseTextOverlay(false);
        setTopText('');
        setBottomText('');
      }
    }
  }, [isOpen, initialMode]);

  const activeTemplate =
    MEME_TEMPLATES.find((t) => t.id === selectedTemplateId) || MEME_TEMPLATES[0];

  const sourceImage = mode === 'upload' ? uploadedRawUrl : activeTemplate.imageUrl;

  useEffect(() => {
    let cancelled = false;
    if (!sourceImage) {
      setPreviewDataUrl('');
      return;
    }

    const shouldRenderCanvas =
      mode === 'studio' || (mode === 'upload' && (useTextOverlay || topText.trim() || bottomText.trim()));

    if (!shouldRenderCanvas) {
      setPreviewDataUrl(sourceImage);
      return;
    }

    renderMemeToDataUrl({
      imageSrc: sourceImage,
      topText: mode === 'studio' || useTextOverlay ? topText : '',
      bottomText: mode === 'studio' || useTextOverlay ? bottomText : '',
    })
      .then((rendered) => {
        if (!cancelled) setPreviewDataUrl(rendered);
      })
      .catch(() => {
        if (!cancelled) setPreviewDataUrl(sourceImage);
      });

    return () => {
      cancelled = true;
    };
  }, [sourceImage, mode, useTextOverlay, topText, bottomText]);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Selecciona un archivo de imagen válido (JPG, PNG, WEBP o GIF).');
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setError('La imagen debe pesar menos de 6 MB.');
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setUploadedRawUrl(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la imagen.');
    }
  };

  const handleTemplateSelect = (tplId: string) => {
    const tpl = MEME_TEMPLATES.find((t) => t.id === tplId);
    if (!tpl) return;
    setSelectedTemplateId(tpl.id);
    setCategory(tpl.category);
    setTopText(tpl.defaultTop);
    setBottomText(tpl.defaultBottom);
  };

  const handleDownloadPreview = async () => {
    if (!sourceImage) return;
    try {
      const finalDataUrl =
        previewDataUrl && previewDataUrl.startsWith('data:image/')
          ? previewDataUrl
          : await renderMemeToDataUrl({
              imageSrc: sourceImage,
              topText: mode === 'studio' || useTextOverlay ? topText : '',
              bottomText: mode === 'studio' || useTextOverlay ? bottomText : '',
            });
      triggerDataUrlDownload(finalDataUrl, `memeswue-creado-${Date.now()}.jpg`);
    } catch {
      setError('No se pudo preparar la descarga.');
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!sourceImage) {
      setError('Sube una imagen o elige una plantilla antes de publicar.');
      return;
    }

    setSubmitting(true);
    try {
      let payloadImageDataUrl: string | undefined;
      let payloadImageUrl: string | undefined;

      const hasOverlay =
        (mode === 'studio' || useTextOverlay) &&
        (topText.trim().length > 0 || bottomText.trim().length > 0);

      if (mode === 'upload' && !hasOverlay) {
        payloadImageDataUrl = uploadedRawUrl;
      } else if (hasOverlay) {
        payloadImageDataUrl = await renderMemeToDataUrl({
          imageSrc: sourceImage,
          topText,
          bottomText,
        });
      } else {
        payloadImageUrl = activeTemplate.imageUrl;
      }

      const res = await fetch('/api/memes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorHandle: currentUser.handle,
          authorAvatar: currentUser.avatar,
          caption: caption.trim(),
          category,
          imageDataUrl: payloadImageDataUrl,
          imageUrl: payloadImageUrl,
          imageAlt: caption.trim() || `${topText} ${bottomText}`.trim() || 'Meme de la comunidad',
        }),
      });

      const data = (await res.json()) as { meme?: MemePost; error?: string };
      if (!res.ok || !data.meme) {
        throw new Error(data.error || 'No se pudo publicar el meme.');
      }

      onCreated(data.meme);
      setCaption('');
      setUploadedRawUrl('');
      setTopText('');
      setBottomText('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al publicar el meme.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-2xl shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-[#242526] px-5 py-4 border-b border-[#E4E6EB] dark:border-[#3A3B3C] flex items-center justify-between gap-4">
          <h2
            id="upload-modal-title"
            className="font-display text-lg font-bold text-[#1C1E21] dark:text-[#E4E6EB]"
          >
            Publicar nuevo meme
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 rounded-full text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handlePublish} className="p-5 space-y-5">
          {/* Segmented Mode Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#F0F2F5] dark:bg-[#18191A] rounded-xl">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-lg transition-colors ${
                mode === 'upload'
                  ? 'bg-white dark:bg-[#242526] text-[#7C3AED] shadow-xs'
                  : 'text-[#65676B] dark:text-[#B0B3B8] hover:text-[#1C1E21] dark:hover:text-[#E4E6EB]'
              }`}
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              <span>Subir archivo</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('studio')}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-lg transition-colors ${
                mode === 'studio'
                  ? 'bg-white dark:bg-[#242526] text-[#7C3AED] shadow-xs'
                  : 'text-[#65676B] dark:text-[#B0B3B8] hover:text-[#1C1E21] dark:hover:text-[#E4E6EB]'
              }`}
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>Crear con plantilla</span>
            </button>
          </div>

          {/* Caption + Category */}
          <div className="space-y-3">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              maxLength={600}
              placeholder={`¿Qué pasa en este meme, ${currentUser.name.split(' ')[0]}?`}
              className="w-full px-3.5 py-2.5 text-sm bg-[#F0F2F5] dark:bg-[#3A3B3C] text-[#1C1E21] dark:text-[#E4E6EB] placeholder:text-[#65676B] dark:placeholder:text-[#B0B3B8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] resize-none"
            />

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <label className="text-xs font-semibold text-[#65676B] dark:text-[#B0B3B8]">
                Categoría:
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as Exclude<MemeCategory, 'Todos'>)
                  }
                  className="ml-2 px-3 py-1.5 text-xs font-semibold bg-[#F0F2F5] dark:bg-[#3A3B3C] text-[#1C1E21] dark:text-[#E4E6EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                >
                  {UPLOAD_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>

              {mode === 'upload' && uploadedRawUrl && (
                <button
                  type="button"
                  onClick={() => setUseTextOverlay((v) => !v)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                    useTextOverlay
                      ? 'bg-[#7C3AED]/10 border-[#7C3AED] text-[#7C3AED]'
                      : 'border-[#E4E6EB] dark:border-[#3A3B3C] text-[#65676B] dark:text-[#B0B3B8]'
                  }`}
                >
                  {useTextOverlay ? 'Ocultar texto sobre imagen' : 'Agregar texto arriba/abajo'}
                </button>
              )}
            </div>
          </div>

          {/* Template Picker */}
          {mode === 'studio' && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#65676B] dark:text-[#B0B3B8]">
                Elige una plantilla
              </p>
              <div className="grid grid-cols-5 gap-2">
                {MEME_TEMPLATES.map((tpl) => {
                  const selected = tpl.id === selectedTemplateId;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleTemplateSelect(tpl.id)}
                      title={tpl.title}
                      className={`overflow-hidden rounded-lg border-2 transition-all ${
                        selected
                          ? 'border-[#7C3AED] scale-[1.02]'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={tpl.imageUrl}
                        alt={tpl.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-14 object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upload Dropzone or Preview */}
          {mode === 'upload' && !uploadedRawUrl ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center gap-2 transition-colors ${
                isDragging
                  ? 'border-[#7C3AED] bg-[#7C3AED]/5'
                  : 'border-[#CED0D4] dark:border-[#3A3B3C] hover:border-[#7C3AED]'
              }`}
            >
              <ImagePlus className="w-10 h-10 text-[#7C3AED]" aria-hidden="true" />
              <p className="font-display text-sm font-bold text-[#1C1E21] dark:text-[#E4E6EB]">
                Arrastra tu meme aquí o haz clic para subir
              </p>
              <p className="text-xs text-[#65676B] dark:text-[#B0B3B8]">
                JPG, PNG, WEBP o GIF · Máximo 6 MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-3">
              {(mode === 'studio' || useTextOverlay) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={topText}
                    onChange={(e) => setTopText(e.target.value)}
                    placeholder="Texto superior"
                    maxLength={80}
                    className="px-3 py-2 text-xs font-semibold bg-[#F0F2F5] dark:bg-[#3A3B3C] text-[#1C1E21] dark:text-[#E4E6EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                  <input
                    type="text"
                    value={bottomText}
                    onChange={(e) => setBottomText(e.target.value)}
                    placeholder="Texto inferior"
                    maxLength={80}
                    className="px-3 py-2 text-xs font-semibold bg-[#F0F2F5] dark:bg-[#3A3B3C] text-[#1C1E21] dark:text-[#E4E6EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>
              )}

              <div className="relative rounded-xl overflow-hidden bg-[#F0F2F5] dark:bg-[#18191A] border border-[#E4E6EB] dark:border-[#3A3B3C]">
                {previewDataUrl && (
                  <img
                    src={previewDataUrl}
                    alt="Vista previa del meme"
                    referrerPolicy="no-referrer"
                    className="w-full max-h-80 object-contain mx-auto"
                  />
                )}
                {mode === 'upload' && (
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedRawUrl('');
                      setPreviewDataUrl('');
                    }}
                    aria-label="Cambiar imagen"
                    className="absolute top-2.5 right-2.5 px-2.5 py-1 text-xs font-semibold bg-black/70 text-white rounded-lg hover:bg-black/85 transition-colors"
                  >
                    Cambiar imagen
                  </button>
                )}
              </div>
            </div>
          )}

          {error && (
            <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}

          {/* Footer Actions */}
          <div className="pt-2 border-t border-[#E4E6EB] dark:border-[#3A3B3C] flex items-center justify-between gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadPreview}
              disabled={!sourceImage}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#1C1E21] dark:text-[#E4E6EB] bg-[#F0F2F5] dark:bg-[#3A3B3C] hover:bg-[#E4E6EB] dark:hover:bg-[#4E4F50] disabled:opacity-40 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Descargar imagen</span>
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || !sourceImage}
                className="px-5 py-2 text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 rounded-lg transition-colors"
              >
                {submitting ? 'Publicando...' : 'Publicar meme'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
