import { Download, X } from 'lucide-react';
import { getTotalReactions } from '../constants/memes';
import type { MemePost } from '../types';

interface RightSidebarProps {
  memes: MemePost[];
  selectedAuthorId: string | null;
  onSelectAuthor: (authorId: string | null) => void;
  onOpenMeme: (meme: MemePost) => void;
}

interface CreatorSummary {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  postsCount: number;
  totalReactions: number;
}

export function RightSidebar({
  memes,
  selectedAuthorId,
  onSelectAuthor,
  onOpenMeme,
}: RightSidebarProps) {
  const topDownloaded = [...memes]
    .sort((a, b) => b.downloadsCount - a.downloadsCount)
    .slice(0, 4);

  const creatorMap = new Map<string, CreatorSummary>();
  for (const meme of memes) {
    const existing = creatorMap.get(meme.authorId);
    const rx = getTotalReactions(meme.reactions);
    if (existing) {
      existing.postsCount += 1;
      existing.totalReactions += rx;
    } else {
      creatorMap.set(meme.authorId, {
        id: meme.authorId,
        name: meme.authorName,
        handle: meme.authorHandle,
        avatar: meme.authorAvatar,
        postsCount: 1,
        totalReactions: rx,
      });
    }
  }

  const topCreators = Array.from(creatorMap.values())
    .sort((a, b) => b.totalReactions - a.totalReactions)
    .slice(0, 5);

  return (
    <aside className="hidden xl:flex flex-col gap-5 sticky top-20 self-start">
      {/* Top Descargados */}
      <div className="bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-sm font-bold text-[#1C1E21] dark:text-[#E4E6EB]">
            Más descargados
          </h2>
          <Download className="w-4 h-4 text-[#65676B] dark:text-[#B0B3B8]" aria-hidden="true" />
        </div>

        {topDownloaded.length === 0 ? (
          <p className="text-xs text-[#65676B] dark:text-[#B0B3B8]">
            Aún no hay memes publicados.
          </p>
        ) : (
          <div className="divide-y divide-[#E4E6EB] dark:divide-[#3A3B3C]">
            {topDownloaded.map((meme, idx) => (
              <button
                key={meme.id}
                type="button"
                onClick={() => onOpenMeme(meme)}
                className="w-full py-2.5 first:pt-0 last:pb-0 flex items-center gap-3 text-left group"
              >
                <span className="font-mono-nums text-xs font-semibold text-[#65676B] dark:text-[#B0B3B8] w-5 shrink-0">
                  0{idx + 1}.
                </span>
                <img
                  src={meme.imageUrl}
                  alt={meme.imageAlt}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-lg object-cover bg-slate-100 dark:bg-zinc-800 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#1C1E21] dark:text-[#E4E6EB] group-hover:text-[#7C3AED] transition-colors line-clamp-2">
                    {meme.caption || meme.category}
                  </p>
                  <p className="text-[11px] text-[#65676B] dark:text-[#B0B3B8] mt-0.5 tabular-nums">
                    {meme.downloadsCount.toLocaleString('es-ES')} descargas
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Creadores destacados */}
      <div className="bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-sm font-bold text-[#1C1E21] dark:text-[#E4E6EB]">
            Creadores destacados
          </h2>
          {selectedAuthorId && (
            <button
              type="button"
              onClick={() => onSelectAuthor(null)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C3AED] hover:underline"
            >
              <X className="w-3 h-3" aria-hidden="true" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {topCreators.map((creator) => {
            const active = selectedAuthorId === creator.id;
            return (
              <button
                key={creator.id}
                type="button"
                onClick={() => onSelectAuthor(active ? null : creator.id)}
                className={`flex items-center gap-3 p-2 -mx-2 rounded-lg text-left transition-colors ${
                  active
                    ? 'bg-[#7C3AED]/10 text-[#7C3AED]'
                    : 'hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C]'
                }`}
              >
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover bg-slate-200 dark:bg-zinc-700 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#1C1E21] dark:text-[#E4E6EB] truncate">
                    {creator.name}
                  </p>
                  <p className="text-xs text-[#65676B] dark:text-[#B0B3B8] truncate tabular-nums">
                    {creator.postsCount} {creator.postsCount === 1 ? 'meme' : 'memes'} ·{' '}
                    {creator.totalReactions.toLocaleString('es-ES')} reacciones
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
