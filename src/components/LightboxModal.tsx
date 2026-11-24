import { useEffect, useState } from 'react';
import {
  Bookmark,
  Check,
  Copy,
  Download,
  Repeat2,
  Send,
  X,
} from 'lucide-react';
import {
  REACTIONS,
  formatRelativeTime,
  getTotalReactions,
} from '../constants/memes';
import type { MemePost, ReactionType, UserProfile } from '../types';

interface LightboxModalProps {
  meme: MemePost | null;
  currentUser: UserProfile;
  isSaved: boolean;
  onClose: () => void;
  onToggleSave: (memeId: string) => void;
  onReact: (memeId: string, reaction: ReactionType) => Promise<void>;
  onAddComment: (memeId: string, text: string) => Promise<void>;
  onShare: (
    memeId: string,
    mode: 'copy' | 'repost' | 'native',
    commentary?: string
  ) => Promise<void>;
  onDownload: (meme: MemePost) => Promise<void>;
}

export function LightboxModal({
  meme,
  currentUser,
  isSaved,
  onClose,
  onToggleSave,
  onReact,
  onAddComment,
  onShare,
  onDownload,
}: LightboxModalProps) {
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (meme) {
      window.addEventListener('keydown', handleKey);
    }
    return () => window.removeEventListener('keydown', handleKey);
  }, [meme, onClose]);

  if (!meme) return null;

  const userReaction = meme.userReactions[currentUser.id];
  const totalReactions = getTotalReactions(meme.reactions);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await onAddComment(meme.id, trimmed);
      setCommentText('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    await onShare(meme.id, 'copy');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vista completa del meme"
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-0 sm:p-4"
    >
      <div className="w-full h-full sm:h-[90vh] sm:max-w-6xl bg-white dark:bg-[#242526] sm:rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-2xl">
        {/* Left: Dark Media Viewport */}
        <div className="lg:col-span-8 bg-[#0B0C0E] relative flex items-center justify-center p-4 min-h-[40vh]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar vista"
            className="absolute top-3 left-3 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 text-white hover:bg-black transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onDownload(meme)}
            className="absolute top-3 right-3 z-10 inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg shadow-lg transition-colors"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Descargar</span>
          </button>

          <img
            src={meme.imageUrl}
            alt={meme.imageAlt}
            referrerPolicy="no-referrer"
            className="max-h-full max-w-full object-contain rounded"
          />
        </div>

        {/* Right: Post Details & Comments */}
        <div className="lg:col-span-4 flex flex-col h-full bg-white dark:bg-[#242526] border-l border-[#E4E6EB] dark:border-[#3A3B3C] overflow-hidden">
          <div className="p-4 border-b border-[#E4E6EB] dark:border-[#3A3B3C]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={meme.authorAvatar}
                  alt={meme.authorName}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-[#1C1E21] dark:text-[#E4E6EB] truncate">
                    {meme.authorName}
                  </p>
                  <p className="text-xs text-[#65676B] dark:text-[#B0B3B8] truncate">
                    {meme.authorHandle} · {formatRelativeTime(meme.createdAt)} · {meme.category}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onToggleSave(meme.id)}
                aria-label={isSaved ? 'Quitar de guardados' : 'Guardar meme'}
                className={`p-2 rounded-lg transition-colors ${
                  isSaved
                    ? 'text-[#7C3AED] bg-[#7C3AED]/10'
                    : 'text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C]'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} aria-hidden="true" />
              </button>
            </div>

            {meme.caption && (
              <p className="mt-3 text-sm leading-relaxed text-[#1C1E21] dark:text-[#E4E6EB] whitespace-pre-line">
                {meme.caption}
              </p>
            )}

            <div className="mt-3 flex items-center gap-3 text-xs text-[#65676B] dark:text-[#B0B3B8] tabular-nums">
              <span>{totalReactions.toLocaleString('es-ES')} reacciones</span>
              <span aria-hidden="true">·</span>
              <span>{meme.downloadsCount.toLocaleString('es-ES')} descargas</span>
              <span aria-hidden="true">·</span>
              <span>{meme.sharesCount.toLocaleString('es-ES')} compartidos</span>
            </div>

            {/* Reaction Picker Row */}
            <div className="mt-3 pt-3 border-t border-[#E4E6EB] dark:border-[#3A3B3C] flex items-center justify-between gap-1">
              <div className="flex items-center gap-1">
                {REACTIONS.map((r) => (
                  <button
                    key={r.type}
                    type="button"
                    onClick={() => onReact(meme.id, r.type)}
                    title={r.label}
                    aria-label={r.label}
                    className={`w-8 h-8 flex items-center justify-center text-lg rounded-full hover:scale-115 transition-transform ${
                      userReaction === r.type
                        ? 'bg-[#7C3AED]/15 ring-1 ring-[#7C3AED]'
                        : 'hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C]'
                    }`}
                  >
                    {r.emoji}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onShare(meme.id, 'repost')}
                  title="Compartir en el muro"
                  className="p-2 text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] rounded-lg"
                >
                  <Repeat2 className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copiar enlace"
                  className="p-2 text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] rounded-lg"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  ) : (
                    <Copy className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Comments */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {meme.comments.length === 0 ? (
              <p className="text-xs text-[#65676B] dark:text-[#B0B3B8] text-center py-6">
                Todavía no hay comentarios. ¡Deja el primero!
              </p>
            ) : (
              meme.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2.5">
                  <img
                    src={comment.authorAvatar}
                    alt={comment.authorName}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="bg-[#F0F2F5] dark:bg-[#3A3B3C] rounded-xl px-3 py-2 flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-bold text-[#1C1E21] dark:text-[#E4E6EB] truncate">
                        {comment.authorName}
                      </span>
                      <span className="text-[11px] text-[#65676B] dark:text-[#B0B3B8] shrink-0">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-[#1C1E21] dark:text-[#E4E6EB] mt-0.5 break-words">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Composer */}
          <form
            onSubmit={handleSubmit}
            className="p-3 border-t border-[#E4E6EB] dark:border-[#3A3B3C] flex items-center gap-2"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escribe un comentario..."
              maxLength={400}
              className="flex-1 px-3.5 py-2 text-sm bg-[#F0F2F5] dark:bg-[#3A3B3C] text-[#1C1E21] dark:text-[#E4E6EB] placeholder:text-[#65676B] dark:placeholder:text-[#B0B3B8] rounded-full focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || submitting}
              aria-label="Enviar comentario"
              className="p-2 text-white bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 rounded-full transition-colors shrink-0"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
