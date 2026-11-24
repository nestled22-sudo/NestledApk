import { Plus } from 'lucide-react';
import type { FeedTab } from '../types';

interface NavbarProps {
  activeTab: FeedTab;
  onSelectTab: (tab: FeedTab) => void;
  onOpenUpload: () => void;
}

const NAV_ITEMS: { id: FeedTab; label: string }[] = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'tendencias', label: 'Tendencias' },
  { id: 'guardados', label: 'Guardados' },
  { id: 'perfil', label: 'Mi Perfil' },
];

export function Navbar({ activeTab, onSelectTab, onOpenUpload }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 h-14 bg-white/95 dark:bg-[#242526]/95 backdrop-blur-sm border-b border-[#E4E6EB] dark:border-[#3A3B3C]">
      <div className="max-w-[1360px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark with requested watermark */}
        <button
          type="button"
          onClick={() => onSelectTab('inicio')}
          className="flex flex-col items-start text-left whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] rounded"
        >
          <span className="font-display text-xl font-extrabold tracking-tight text-[#7C3AED] leading-none">
            MemesWue
          </span>
          <span className="text-[10px] font-medium tracking-wide text-[#65676B]/70 dark:text-[#B0B3B8]/60 leading-none mt-0.5 select-none">
            NestLed-apk
          </span>
        </button>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-7 h-full"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative h-full flex items-center text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] ${
                  isActive
                    ? 'text-[#7C3AED]'
                    : 'text-[#65676B] dark:text-[#B0B3B8] hover:text-[#1C1E21] dark:hover:text-[#E4E6EB]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary CTA */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.98] rounded-lg transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Subir meme</span>
          </button>
        </div>
      </div>

      {/* Compact mobile navigation row */}
      <nav
        aria-label="Navegación móvil"
        className="md:hidden flex items-center justify-around bg-white dark:bg-[#242526] border-b border-[#E4E6EB] dark:border-[#3A3B3C] px-2 h-11"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'text-[#7C3AED] border-b-2 border-[#7C3AED]'
                  : 'text-[#65676B] dark:text-[#B0B3B8]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
