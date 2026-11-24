import { Clock, Download, Flame, Moon, Sun, UserPen } from 'lucide-react';
import { CATEGORIES } from '../constants/memes';
import type { MemeCategory, SortMode, UserProfile } from '../types';

interface LeftSidebarProps {
  user: UserProfile;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenProfile: () => void;
  sortMode: SortMode;
  onChangeSort: (sort: SortMode) => void;
  selectedCategory: MemeCategory;
  onSelectCategory: (cat: MemeCategory) => void;
  savedCount: number;
}

export function LeftSidebar({
  user,
  darkMode,
  onToggleDarkMode,
  onOpenProfile,
  sortMode,
  onChangeSort,
  selectedCategory,
  onSelectCategory,
  savedCount,
}: LeftSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col gap-5 sticky top-20 self-start">
      {/* User summary card */}
      <div className="bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-xl p-4">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.name}
            referrerPolicy="no-referrer"
            className="w-11 h-11 rounded-full object-cover bg-slate-200 dark:bg-zinc-700 shrink-0"
          />
          <div className="min-w-0">
            <p className="font-display text-sm font-bold text-[#1C1E21] dark:text-[#E4E6EB] truncate">
              {user.name}
            </p>
            <p className="text-xs text-[#65676B] dark:text-[#B0B3B8] truncate">
              {user.handle} · <span className="tabular-nums">{savedCount}</span> guardados
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#E4E6EB] dark:border-[#3A3B3C] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onOpenProfile}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7C3AED] hover:underline whitespace-nowrap"
          >
            <UserPen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Mi perfil</span>
          </button>

          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] rounded-lg transition-colors whitespace-nowrap"
          >
            {darkMode ? (
              <>
                <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Oscuro</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Ordenar feed */}
      <div className="bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-xl p-4">
        <h2 className="font-display text-xs font-bold text-[#65676B] dark:text-[#B0B3B8] mb-2.5">
          Ordenar publicaciones
        </h2>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onChangeSort('recent')}
            className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg text-left transition-colors ${
              sortMode === 'recent'
                ? 'bg-[#7C3AED]/10 text-[#7C3AED]'
                : 'text-[#1C1E21] dark:text-[#E4E6EB] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C]'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="truncate">Más recientes</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeSort('reactions')}
            className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg text-left transition-colors ${
              sortMode === 'reactions'
                ? 'bg-[#7C3AED]/10 text-[#7C3AED]'
                : 'text-[#1C1E21] dark:text-[#E4E6EB] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C]'
            }`}
          >
            <Flame className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="truncate">Más virales</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeSort('downloads')}
            className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg text-left transition-colors ${
              sortMode === 'downloads'
                ? 'bg-[#7C3AED]/10 text-[#7C3AED]'
                : 'text-[#1C1E21] dark:text-[#E4E6EB] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C]'
            }`}
          >
            <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="truncate">Más descargados</span>
          </button>
        </div>
      </div>

      {/* Categorías */}
      <div className="bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-xl p-4">
        <h2 className="font-display text-xs font-bold text-[#65676B] dark:text-[#B0B3B8] mb-2.5">
          Categorías
        </h2>
        <div className="flex flex-col gap-1">
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => onSelectCategory(category)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg text-left transition-colors whitespace-nowrap truncate ${
                  active
                    ? 'bg-[#7C3AED] text-white'
                    : 'text-[#1C1E21] dark:text-[#E4E6EB] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
