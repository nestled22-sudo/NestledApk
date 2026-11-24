import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  ImagePlus,
  Moon,
  Search,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import { SplashScreen } from './components/SplashScreen';
import {
  CATEGORIES,
  DEFAULT_USER,
  getTotalReactions,
} from './constants/memes';
import { Navbar } from './components/Navbar';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { MemeCard } from './components/MemeCard';
import { UploadModal } from './components/UploadModal';
import { LightboxModal } from './components/LightboxModal';
import { ProfileView } from './components/ProfileView';
import type {
  FeedTab,
  MemeCategory,
  MemePost,
  ReactionType,
  SortMode,
  UserProfile,
} from './types';

const STORAGE_USER_KEY = 'memeplaza_user_v1';
const STORAGE_SAVED_KEY = 'memeplaza_saved_v1';
const STORAGE_THEME_KEY = 'memeplaza_theme_v1';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [memes, setMemes] = useState<MemePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<FeedTab>('inicio');
  const [selectedCategory, setSelectedCategory] = useState<MemeCategory>('Todos');
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<'upload' | 'studio'>('upload');
  const [lightboxMemeId, setLightboxMemeId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_USER_KEY);
      if (raw) return JSON.parse(raw) as UserProfile;
    } catch {
      // ignore storage errors
    }
    return DEFAULT_USER;
  });

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_SAVED_KEY);
      if (raw) return JSON.parse(raw) as string[];
    } catch {
      // ignore storage errors
    }
    return [];
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_THEME_KEY) === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem(STORAGE_THEME_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(STORAGE_THEME_KEY, 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(savedIds));
    } catch {
      // ignore
    }
  }, [savedIds]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

  const fetchMemes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/memes');
      if (!res.ok) throw new Error('No se pudieron cargar los memes.');
      const data = (await res.json()) as { memes: MemePost[] };
      setMemes(data.memes || []);

      const hash = window.location.hash;
      if (hash.startsWith('#meme-')) {
        const targetId = hash.replace('#meme-', '');
        if (data.memes.some((m) => m.id === targetId)) {
          setLightboxMemeId(targetId);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemes();
  }, []);

  const handleSelectTab = (tab: FeedTab) => {
    setActiveTab(tab);
    if (tab === 'tendencias') {
      setSortMode('reactions');
    } else if (tab === 'inicio') {
      setSortMode('recent');
    }
    if (tab !== 'perfil') {
      setSelectedAuthorId(null);
    }
  };

  const handleToggleSave = (memeId: string) => {
    setSavedIds((prev) => {
      const exists = prev.includes(memeId);
      const next = exists ? prev.filter((id) => id !== memeId) : [memeId, ...prev];
      showToast(exists ? 'Quitado de guardados' : 'Meme guardado en tu colección');
      return next;
    });
  };

  const handleReact = async (memeId: string, reaction: ReactionType) => {
    try {
      const res = await fetch(`/api/memes/${memeId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, reaction }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { meme: MemePost };
      setMemes((prev) => prev.map((m) => (m.id === memeId ? data.meme : m)));
    } catch {
      showToast('No se pudo registrar la reacción');
    }
  };

  const handleAddComment = async (memeId: string, text: string) => {
    const res = await fetch(`/api/memes/${memeId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authorId: user.id,
        authorName: user.name,
        authorHandle: user.handle,
        authorAvatar: user.avatar,
        text,
      }),
    });
    if (!res.ok) {
      showToast('No se pudo publicar el comentario');
      return;
    }
    const data = (await res.json()) as { meme: MemePost };
    setMemes((prev) => prev.map((m) => (m.id === memeId ? data.meme : m)));
  };

  const handleShare = async (
    memeId: string,
    mode: 'copy' | 'repost' | 'native',
    commentary?: string
  ) => {
    const shareUrl = `${window.location.origin}/#meme-${memeId}`;
    const targetMeme = memes.find((m) => m.id === memeId);

    if (mode === 'copy') {
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch {
        // clipboard fallback ignored
      }
      showToast('Enlace copiado al portapapeles');
    } else if (mode === 'native') {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Meme en MemesWue',
            text: targetMeme?.caption || 'Mira este meme en MemesWue',
            url: shareUrl,
          });
        } catch {
          // user cancelled share
        }
      } else {
        try {
          await navigator.clipboard.writeText(shareUrl);
        } catch {
          // ignore
        }
        showToast('Enlace listo para compartir en tus redes');
      }
    }

    try {
      const res = await fetch(`/api/memes/${memeId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repost: mode === 'repost',
          authorId: user.id,
          authorName: user.name,
          authorHandle: user.handle,
          authorAvatar: user.avatar,
          commentary,
        }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        meme: MemePost;
        repostedMeme?: MemePost;
      };
      setMemes((prev) => {
        const updated = prev.map((m) => (m.id === memeId ? data.meme : m));
        if (data.repostedMeme) {
          return [data.repostedMeme, ...updated];
        }
        return updated;
      });
      if (mode === 'repost') {
        showToast('Meme compartido en el muro principal');
      }
    } catch {
      showToast('No se pudo compartir el meme');
    }
  };

  const handleDownload = async (meme: MemePost) => {
    try {
      const res = await fetch(`/api/memes/${meme.id}/download`);
      if (!res.ok) throw new Error('Error en descarga');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      const ext = blob.type.includes('png')
        ? 'png'
        : blob.type.includes('webp')
          ? 'webp'
          : blob.type.includes('gif')
            ? 'gif'
            : 'jpg';

      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `memeswue-${meme.id}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);

      setMemes((prev) =>
        prev.map((m) =>
          m.id === meme.id ? { ...m, downloadsCount: m.downloadsCount + 1 } : m
        )
      );
      showToast('Meme descargado en tu dispositivo');
    } catch {
      showToast('No se pudo descargar la imagen');
    }
  };

  const handleDelete = async (memeId: string) => {
    try {
      const res = await fetch(`/api/memes/${memeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: user.id }),
      });
      if (!res.ok) {
        showToast('No se pudo eliminar la publicación');
        return;
      }
      setMemes((prev) => prev.filter((m) => m.id !== memeId));
      if (lightboxMemeId === memeId) setLightboxMemeId(null);
      showToast('Publicación eliminada');
    } catch {
      showToast('No se pudo eliminar la publicación');
    }
  };

  const filteredMemes = useMemo(() => {
    let list = [...memes];

    if (activeTab === 'guardados') {
      list = list.filter((m) => savedIds.includes(m.id));
    }

    if (selectedAuthorId) {
      list = list.filter((m) => m.authorId === selectedAuthorId);
    }

    if (selectedCategory !== 'Todos') {
      list = list.filter((m) => m.category === selectedCategory);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (m) =>
          m.caption.toLowerCase().includes(q) ||
          m.authorName.toLowerCase().includes(q) ||
          m.authorHandle.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      );
    }

    if (sortMode === 'downloads') {
      list.sort((a, b) => b.downloadsCount - a.downloadsCount);
    } else if (sortMode === 'reactions') {
      list.sort((a, b) => getTotalReactions(b.reactions) - getTotalReactions(a.reactions));
    } else {
      list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return list;
  }, [memes, activeTab, savedIds, selectedAuthorId, selectedCategory, searchQuery, sortMode]);

  const userMemes = useMemo(
    () => memes.filter((m) => m.authorId === user.id),
    [memes, user.id]
  );

  const lightboxMeme = useMemo(
    () => memes.find((m) => m.id === lightboxMemeId) || null,
    [memes, lightboxMemeId]
  );

  const selectedAuthorName = useMemo(() => {
    if (!selectedAuthorId) return null;
    return memes.find((m) => m.authorId === selectedAuthorId)?.authorName || null;
  }, [memes, selectedAuthorId]);

  const openUploadModal = (mode: 'upload' | 'studio') => {
    setUploadMode(mode);
    setUploadOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#141517] text-[#1C1E21] dark:text-[#E4E6EB] transition-colors">
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onFinish={() => setShowSplash(false)} durationMs={2600} />
        )}
      </AnimatePresence>

      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenUpload={() => openUploadModal('upload')}
      />

      <main className="max-w-[1360px] mx-auto px-4 sm:px-6 py-5 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,660px)_300px] justify-between gap-6">
        {/* Left Navigation & Filters Rail */}
        <LeftSidebar
          user={user}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((v) => !v)}
          onOpenProfile={() => handleSelectTab('perfil')}
          sortMode={sortMode}
          onChangeSort={setSortMode}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          savedCount={savedIds.length}
        />

        {/* Center Social Feed */}
        <section className="w-full max-w-[660px] mx-auto space-y-4 min-w-0">
          {activeTab === 'perfil' ? (
            <ProfileView
              user={user}
              userMemes={userMemes}
              onUpdateProfile={(next) => {
                setUser(next);
                showToast('Perfil actualizado');
              }}
              onOpenUpload={() => openUploadModal('upload')}
              onOpenLightbox={(meme) => setLightboxMemeId(meme.id)}
            />
          ) : (
            <>
              {/* Search & Mobile Quick Controls */}
              <div className="bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-xl p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search
                      className="w-4 h-4 text-[#65676B] dark:text-[#B0B3B8] absolute left-3 top-1/2 -translate-y-1/2"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar memes, categorías o creadores..."
                      aria-label="Buscar memes"
                      className="w-full pl-9 pr-8 py-2 text-sm bg-[#F0F2F5] dark:bg-[#3A3B3C] text-[#1C1E21] dark:text-[#E4E6EB] placeholder:text-[#65676B] dark:placeholder:text-[#B0B3B8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label="Limpiar búsqueda"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#65676B] dark:text-[#B0B3B8] hover:text-[#1C1E21]"
                      >
                        <X className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setDarkMode((v) => !v)}
                    aria-label={darkMode ? 'Modo claro' : 'Modo oscuro'}
                    className="lg:hidden p-2.5 rounded-lg bg-[#F0F2F5] dark:bg-[#3A3B3C] text-[#65676B] dark:text-[#B0B3B8]"
                  >
                    {darkMode ? (
                      <Sun className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Moon className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>

                {/* Mobile Category Scroll Strip */}
                <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-1">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                        selectedCategory === category
                          ? 'bg-[#7C3AED] text-white'
                          : 'bg-[#F0F2F5] dark:bg-[#3A3B3C] text-[#65676B] dark:text-[#B0B3B8]'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Facebook-Style Quick Meme Composer */}
              {activeTab !== 'guardados' && (
                <div className="bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <button
                      type="button"
                      onClick={() => openUploadModal('upload')}
                      className="flex-1 text-left px-4 py-2.5 text-sm text-[#65676B] dark:text-[#B0B3B8] bg-[#F0F2F5] dark:bg-[#3A3B3C] hover:bg-[#E4E6EB] dark:hover:bg-[#4E4F50] rounded-full transition-colors truncate"
                    >
                      ¿Qué meme tienes hoy, {user.name.split(' ')[0]}?
                    </button>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#E4E6EB] dark:border-[#3A3B3C] grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => openUploadModal('upload')}
                      className="flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-semibold text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] rounded-lg transition-colors"
                    >
                      <ImagePlus className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                      <span>Subir imagen</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openUploadModal('studio')}
                      className="flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-semibold text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] rounded-lg transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-[#7C3AED]" aria-hidden="true" />
                      <span>Estudio de plantillas</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Active Filter Context Bar */}
              {(selectedAuthorName || selectedCategory !== 'Todos' || activeTab === 'guardados' || activeTab === 'tendencias') && (
                <div className="flex items-center justify-between gap-2 px-1 text-xs text-[#65676B] dark:text-[#B0B3B8]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-[#1C1E21] dark:text-[#E4E6EB]">
                      {activeTab === 'guardados'
                        ? 'Memes guardados'
                        : activeTab === 'tendencias'
                          ? 'Tendencias'
                          : 'Feed filtrado'}
                    </span>
                    {selectedCategory !== 'Todos' && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{selectedCategory}</span>
                      </>
                    )}
                    {selectedAuthorName && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>Por {selectedAuthorName}</span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {filteredMemes.length}{' '}
                      {filteredMemes.length === 1 ? 'resultado' : 'resultados'}
                    </span>
                  </div>

                  {(selectedAuthorId || selectedCategory !== 'Todos' || searchQuery) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAuthorId(null);
                        setSelectedCategory('Todos');
                        setSearchQuery('');
                      }}
                      className="font-semibold text-[#7C3AED] hover:underline whitespace-nowrap"
                    >
                      Ver todos
                    </button>
                  )}
                </div>
              )}

              {/* Feed States: Loading, Error, Empty, Populated */}
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((n) => (
                    <div
                      key={n}
                      className="bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-xl p-4 space-y-3 animate-pulse"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-700" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3.5 w-32 bg-slate-200 dark:bg-zinc-700 rounded" />
                          <div className="h-3 w-44 bg-slate-200 dark:bg-zinc-700 rounded" />
                        </div>
                      </div>
                      <div className="h-4 w-5/6 bg-slate-200 dark:bg-zinc-700 rounded" />
                      <div className="h-72 w-full bg-slate-200 dark:bg-zinc-700 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-xl p-8 text-center space-y-3">
                  <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={fetchMemes}
                    className="px-4 py-2 text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg"
                  >
                    Reintentar
                  </button>
                </div>
              ) : filteredMemes.length === 0 ? (
                <div className="bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-xl p-10 text-center space-y-3">
                  <h2 className="font-display text-base font-bold text-[#1C1E21] dark:text-[#E4E6EB]">
                    {activeTab === 'guardados'
                      ? 'No tienes memes guardados todavía'
                      : 'No encontramos memes con ese filtro'}
                  </h2>
                  <p className="text-sm text-[#65676B] dark:text-[#B0B3B8] max-w-md mx-auto">
                    {activeTab === 'guardados'
                      ? 'Toca el ícono de marcador en cualquier publicación para guardarla aquí y descargarla cuando quieras.'
                      : 'Prueba otra búsqueda o sube un meme nuevo para compartirlo con la comunidad.'}
                  </p>
                  <div className="pt-1 flex items-center justify-center gap-2">
                    {activeTab === 'guardados' ? (
                      <button
                        type="button"
                        onClick={() => handleSelectTab('inicio')}
                        className="px-4 py-2 text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg"
                      >
                        Explorar inicio
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openUploadModal('upload')}
                        className="px-4 py-2 text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg"
                      >
                        Subir meme
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMemes.map((meme) => (
                    <MemeCard
                      key={meme.id}
                      meme={meme}
                      currentUser={user}
                      isSaved={savedIds.includes(meme.id)}
                      onToggleSave={handleToggleSave}
                      onReact={handleReact}
                      onAddComment={handleAddComment}
                      onShare={handleShare}
                      onDownload={handleDownload}
                      onDelete={handleDelete}
                      onOpenLightbox={(m) => setLightboxMemeId(m.id)}
                      onSelectAuthor={(authorId) => {
                        setSelectedAuthorId((prev) =>
                          prev === authorId ? null : authorId
                        );
                        setActiveTab('inicio');
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* Right Trending & Creators Rail */}
        <RightSidebar
          memes={memes}
          selectedAuthorId={selectedAuthorId}
          onSelectAuthor={(authorId) => {
            setSelectedAuthorId(authorId);
            if (activeTab === 'perfil') setActiveTab('inicio');
          }}
          onOpenMeme={(meme) => setLightboxMemeId(meme.id)}
        />
      </main>

      {/* Upload & Meme Studio Modal */}
      <UploadModal
        isOpen={uploadOpen}
        initialMode={uploadMode}
        currentUser={user}
        onClose={() => setUploadOpen(false)}
        onCreated={(created) => {
          setMemes((prev) => [created, ...prev]);
          setActiveTab('inicio');
          setSelectedCategory('Todos');
          setSelectedAuthorId(null);
          showToast('Meme publicado en el muro');
        }}
      />

      {/* Fullscreen Photo Theater Modal */}
      <LightboxModal
        meme={lightboxMeme}
        currentUser={user}
        isSaved={lightboxMeme ? savedIds.includes(lightboxMeme.id) : false}
        onClose={() => setLightboxMemeId(null)}
        onToggleSave={handleToggleSave}
        onReact={handleReact}
        onAddComment={handleAddComment}
        onShare={handleShare}
        onDownload={handleDownload}
      />

      {/* Subtle Toast Confirmation */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 text-xs font-semibold text-white bg-[#1C1E21] dark:bg-[#3A3B3C] rounded-lg shadow-lg"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
