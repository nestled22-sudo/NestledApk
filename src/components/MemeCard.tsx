import { useState, useRef, useEffect } from 'react';
import {
  Bookmark,
  Check,
  Copy,
  Download,
  ImageOff,
  MessageCircle,
  Repeat2,
  Send,
  Share2,
  ThumbsUp,
  Trash2,
} from 'lucide-react';
import {
  REACTIONS,
  REACTION_MAP,
  formatRelativeTime,
  getTotalReactions,
} from '../constants/memes';
import type { MemePost, ReactionType, UserProfile } from '../types';

interface MemeCardProps {
  meme: MemePost;
  currentUser: UserProfile;
  isSaved: boolean;
  onToggleSave: (memeId: string) => void;
  onReact: (memeId: string, reaction: ReactionType) => Promise<void>;
  onAddComment: (memeId: string, text: string) => Promise<void>;
  onShare: (
    memeId: string,
    mode: 'copy' | 'repost' | 'native',
    commentary?: string
  ) => Promise<void>;
  onDownload: (meme: MemePost) => Promise<void>;
  onDelete: (memeId: string) => Promise<void>;
  onOpenLightbox: (meme: MemePost) => void;
  onSelectAuthor: (authorId: string) => void;
}

export function MemeCard({
  meme,
  currentUser,
  isSaved,
  onToggleSave,
  onReact,
  onAddComment,
  onShare,
  onDownload,
  onDelete,
  onOpenLightbox,
  onSelectAuthor,
}: MemeCardProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [repostText, setRepostText] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const reactionTimerRef = useRef<number | null>(null);
  const shareBoxRef = useRef<HTMLDivElement | null>(null);
  const commentInputRef = useRef<HTMLInputElement | null>(null);

  const userReaction = meme.userReactions[currentUser.id];
  const totalReactions = getTotalReactions(meme.reactions);

  const topReactionEmojis = REACTIONS.filter((r) => (meme.reactions[r.type] || 0) > 0)
    .sort((a, b) => (meme.reactions[b.type] || 0) - (meme.reactions[a.type] || 0))
    .slice(0, 3);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (shareBoxRef.current && !shareBoxRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
    }
    if (showShareMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showShareMenu]);

  const openReactionsTray = () => {
    if (reactionTimerRef.current) window.clearTimeout(reactionTimerRef.current);
    setShowReactions(true);
  };

  const closeReactionsTray = () => {
    if (reactionTimerRef.current) window.clearTimeout(reactionTimerRef.current);
    reactionTimerRef.current = window.setTimeout(() => {
      setShowReactions(false);
    }, 180);
  };

  const handlePrimaryReactionClick = async () => {
    const target: ReactionType = userReaction || 'like';
    await onReact(meme.id, target);
    setShowReactions(false);
  };

  const handlePickReaction = async (reaction: ReactionType) => {
    setShowReactions(false);
    await onReact(meme.id, reaction);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed || submittingComment) return;
    setSubmittingComment(true);
    try {
      await onAddComment(meme.id, trimmed);
      setCommentText('');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDownloadClick = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await onDownload(meme);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyShare = async () => {
    await onShare(meme.id, 'copy');
    setCopiedLink(true);
    setTimeout(() => {
      setCopiedLink(false);
      setShowShareMenu(false);
    }, 1200);
  };

  const handleRepostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onShare(meme.id, 'repost', repostText.trim() || undefined);
    setRepostText('');
    setShowShareMenu(false);
  };

  return (
    <article
      id={`meme-${meme.id}`}
      className="bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-xl transition-colors"
    >
      {/* Post Header */}
      <div className="p-4 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => onSelectAuthor(meme.authorId)}
            className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
          >
            <img
              src={meme.authorAvatar}
              alt={meme.authorName}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover bg-slate-200 dark:bg-zinc-700"
            />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => onSelectAuthor(meme.authorId)}
                className="font-display text-sm font-bold text-[#1C1E21] dark:text-[#E4E6EB] hover:underline truncate"
              >
                {meme.authorName}
              </button>
              {meme.repostedFrom && (
                <span className="text-xs text-[#65676B] dark:text-[#B0B3B8]">
                  compartió el meme de {meme.repostedFrom.authorName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#65676B] dark:text-[#B0B3B8]">
              <span className="truncate">{meme.authorHandle}</span>
              <span aria-hidden="true">·</span>
              <span className="whitespace-nowrap">{formatRelativeTime(meme.createdAt)}</span>
              <span aria-hidden="true">·</span>
              <span className="whitespace-nowrap">{meme.category}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onToggleSave(meme.id)}
            aria-label={isSaved ? 'Quitar de guardados' : 'Guardar meme'}
            title={isSaved ? 'Guardado' : 'Guardar meme'}
            className={`p-2 rounded-lg transition-colors ${
              isSaved
                ? 'text-[#7C3AED] bg-[#7C3AED]/10'
                : 'text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} aria-hidden="true" />
          </button>

          {meme.authorId === currentUser.id && (
            confirmDelete ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onDelete(meme.id)}
                  className="px-2.5 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                >
                  Eliminar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 text-xs font-medium text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] rounded-lg"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                aria-label="Eliminar publicación"
                title="Eliminar publicación"
                className="p-2 rounded-lg text-[#65676B] dark:text-[#B0B3B8] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            )
          )}
        </div>
      </div>

      {/* Caption */}
      {meme.caption && (
        <p className="px-4 pb-3 text-[15px] leading-relaxed text-[#1C1E21] dark:text-[#E4E6EB] whitespace-pre-line">
          {meme.caption}
        </p>
      )}

      {/* Meme Media */}
      <div className="px-4">
        <button
          type="button"
          onClick={() => onOpenLightbox(meme)}
          className="w-full block overflow-hidden rounded-lg bg-[#F0F2F5] dark:bg-[#18191A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
        >
          {imgError ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-[#65676B] dark:text-[#B0B3B8] p-6">
              <ImageOff className="w-8 h-8" aria-hidden="true" />
              <span className="text-sm font-medium">{meme.imageAlt}</span>
            </div>
          ) : (
            <img
              src={meme.imageUrl}
              alt={meme.imageAlt}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full max-h-[540px] object-contain mx-auto transition-transform duration-200 hover:scale-[1.01]"
            />
          )}
        </button>
      </div>

      {/* Counters Row (Unboxed Tabular Numerals) */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-4 text-xs text-[#65676B] dark:text-[#B0B3B8]">
        <div className="flex items-center gap-1.5 min-w-0">
          {topReactionEmojis.length > 0 && (
            <span className="inline-flex items-center -space-x-0.5" aria-hidden="true">
              {topReactionEmojis.map((r) => (
                <span key={r.type} className="text-sm leading-none">
                  {r.emoji}
                </span>
              ))}
            </span>
          )}
          <span className="tabular-nums">
            {totalReactions.toLocaleString('es-ES')}{' '}
            {totalReactions === 1 ? 'reacción' : 'reacciones'}
          </span>
        </div>

        <div className="flex items-center gap-2 tabular-nums shrink-0">
          <button
            type="button"
            onClick={() => setShowComments((v) => !v)}
            className="hover:underline"
          >
            {meme.comments.length} {meme.comments.length === 1 ? 'comentario' : 'comentarios'}
          </button>
          <span aria-hidden="true">·</span>
          <span>{meme.sharesCount.toLocaleString('es-ES')} compartidos</span>
          <span aria-hidden="true">·</span>
          <span>{meme.downloadsCount.toLocaleString('es-ES')} descargas</span>
        </div>
      </div>

      {/* Facebook 4-Action Bar */}
      <div className="mx-4 border-t border-[#E4E6EB] dark:border-[#3A3B3C] py-1 grid grid-cols-4 gap-1 relative">
        {/* 1. Reaccionar */}
        <div
          className="relative"
          onMouseEnter={openReactionsTray}
          onMouseLeave={closeReactionsTray}
        >
          {showReactions && (
            <div
              role="toolbar"
              aria-label="Elegir reacción"
              className="absolute bottom-full left-0 mb-1.5 z-30 flex items-center gap-1 px-2 py-1.5 bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-full shadow-lg"
            >
              {REACTIONS.map((r) => (
                <button
                  key={r.type}
                  type="button"
                  onClick={() => handlePickReaction(r.type)}
                  title={r.label}
                  aria-label={r.label}
                  className={`w-9 h-9 flex items-center justify-center text-xl rounded-full hover:scale-125 hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] transition-transform duration-150 ${
                    userReaction === r.type ? 'bg-[#7C3AED]/15 scale-110' : ''
                  }`}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handlePrimaryReactionClick}
            onFocus={openReactionsTray}
            className={`w-full h-10 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              userReaction
                ? `${REACTION_MAP[userReaction].colorClass} bg-[#F0F2F5]/70 dark:bg-[#3A3B3C]/60`
                : 'text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C]'
            }`}
          >
            {userReaction ? (
              <>
                <span className="text-base leading-none">{REACTION_MAP[userReaction].emoji}</span>
                <span className="truncate">{REACTION_MAP[userReaction].label}</span>
              </>
            ) : (
              <>
                <ThumbsUp className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Me gusta</span>
              </>
            )}
          </button>
        </div>

        {/* 2. Comentar */}
        <button
          type="button"
          onClick={() => {
            setShowComments(true);
            window.setTimeout(() => commentInputRef.current?.focus(), 60);
          }}
          className="w-full h-10 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] rounded-lg transition-colors whitespace-nowrap"
        >
          <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Comentar</span>
        </button>

        {/* 3. Compartir */}
        <div className="relative" ref={shareBoxRef}>
          <button
            type="button"
            onClick={() => setShowShareMenu((v) => !v)}
            className="w-full h-10 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] rounded-lg transition-colors whitespace-nowrap"
          >
            <Share2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Compartir</span>
          </button>

          {showShareMenu && (
            <div className="absolute bottom-full right-0 mb-2 z-30 w-72 sm:w-80 bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-xl shadow-xl p-3">
              <p className="font-display text-xs font-bold text-[#1C1E21] dark:text-[#E4E6EB] mb-2">
                Compartir meme
              </p>

              <form onSubmit={handleRepostSubmit} className="mb-2.5">
                <input
                  type="text"
                  value={repostText}
                  onChange={(e) => setRepostText(e.target.value)}
                  placeholder="Añade un comentario opcional..."
                  className="w-full px-3 py-1.5 text-xs bg-[#F0F2F5] dark:bg-[#3A3B3C] text-[#1C1E21] dark:text-[#E4E6EB] rounded-lg border border-transparent focus:border-[#7C3AED] focus:outline-none mb-2"
                />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg transition-colors"
                >
                  <Repeat2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Compartir ahora en el muro</span>
                </button>
              </form>

              <div className="border-t border-[#E4E6EB] dark:border-[#3A3B3C] pt-2 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={handleCopyShare}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-[#1C1E21] dark:text-[#E4E6EB] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] rounded-lg transition-colors text-left"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                      <span className="text-emerald-600 font-semibold">Enlace copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Copiar enlace del meme</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onShare(meme.id, 'native');
                    setShowShareMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-[#1C1E21] dark:text-[#E4E6EB] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] rounded-lg transition-colors text-left"
                >
                  <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Enviar por WhatsApp / aplicaciones</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. Descargar */}
        <button
          type="button"
          onClick={handleDownloadClick}
          disabled={downloading}
          className="w-full h-10 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-[#7C3AED] hover:bg-[#7C3AED]/10 rounded-lg transition-colors whitespace-nowrap disabled:opacity-60"
        >
          <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{downloading ? 'Bajando...' : 'Descargar'}</span>
        </button>
      </div>

      {/* Inline Comments Drawer */}
      {showComments && (
        <div className="px-4 py-3 border-t border-[#E4E6EB] dark:border-[#3A3B3C] space-y-3">
          {meme.comments.length === 0 ? (
            <p className="text-xs text-[#65676B] dark:text-[#B0B3B8]">
              Sé el primero en comentar este meme.
            </p>
          ) : (
            <div className="space-y-2.5">
              {meme.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2.5">
                  <img
                    src={comment.authorAvatar}
                    alt={comment.authorName}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover bg-slate-200 dark:bg-zinc-700 shrink-0 mt-0.5"
                  />
                  <div className="bg-[#F0F2F5] dark:bg-[#3A3B3C] rounded-xl px-3 py-2 min-w-0 flex-1">
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
              ))}
            </div>
          )}

          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-1">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
            <input
              ref={commentInputRef}
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escribe un comentario..."
              maxLength={400}
              className="flex-1 px-3.5 py-2 text-sm bg-[#F0F2F5] dark:bg-[#3A3B3C] text-[#1C1E21] dark:text-[#E4E6EB] placeholder:text-[#65676B] dark:placeholder:text-[#B0B3B8] rounded-full focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || submittingComment}
              aria-label="Publicar comentario"
              className="p-2 text-white bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 rounded-full transition-colors shrink-0"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
