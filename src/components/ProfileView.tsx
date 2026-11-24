import { useState } from 'react';
import { Check, Pencil, Plus } from 'lucide-react';
import { AVATAR_PRESETS, getTotalReactions } from '../constants/memes';
import type { MemePost, UserProfile } from '../types';

interface ProfileViewProps {
  user: UserProfile;
  userMemes: MemePost[];
  onUpdateProfile: (next: UserProfile) => void;
  onOpenUpload: () => void;
  onOpenLightbox: (meme: MemePost) => void;
}

export function ProfileView({
  user,
  userMemes,
  onUpdateProfile,
  onOpenUpload,
  onOpenLightbox,
}: ProfileViewProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [handle, setHandle] = useState(user.handle);
  const [bio, setBio] = useState(user.bio);
  const [avatar, setAvatar] = useState(user.avatar);

  const totalReactions = userMemes.reduce(
    (sum, m) => sum + getTotalReactions(m.reactions),
    0
  );
  const totalDownloads = userMemes.reduce((sum, m) => sum + m.downloadsCount, 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim() || user.name;
    const rawHandle = handle.trim() || user.handle;
    const cleanHandle = rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`;
    onUpdateProfile({
      ...user,
      name: cleanName,
      handle: cleanHandle,
      bio: bio.trim(),
      avatar,
    });
    setEditing(false);
  };

  return (
    <div className="space-y-5">
      {/* Facebook-style Profile Card */}
      <section className="bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-xl overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#7C3AED] to-[#4C1D95]" />

        <div className="px-5 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 mb-4">
            <div className="flex items-end gap-4">
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-[#242526] bg-slate-200 dark:bg-zinc-700 shrink-0"
              />
              <div className="pt-10 sm:pt-0">
                <h1 className="font-display text-xl font-extrabold text-[#1C1E21] dark:text-[#E4E6EB]">
                  {user.name}
                </h1>
                <p className="text-sm text-[#65676B] dark:text-[#B0B3B8]">{user.handle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#1C1E21] dark:text-[#E4E6EB] bg-[#F0F2F5] dark:bg-[#3A3B3C] hover:bg-[#E4E6EB] dark:hover:bg-[#4E4F50] rounded-lg transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{editing ? 'Cerrar edición' : 'Editar perfil'}</span>
              </button>
              <button
                type="button"
                onClick={onOpenUpload}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Subir meme</span>
              </button>
            </div>
          </div>

          <p className="text-sm text-[#1C1E21] dark:text-[#E4E6EB] max-w-xl">
            {user.bio}
          </p>

          <div className="mt-4 pt-4 border-t border-[#E4E6EB] dark:border-[#3A3B3C] grid grid-cols-3 gap-4 text-center sm:text-left">
            <div>
              <p className="font-display text-lg font-bold text-[#1C1E21] dark:text-[#E4E6EB] tabular-nums">
                {userMemes.length}
              </p>
              <p className="text-xs text-[#65676B] dark:text-[#B0B3B8]">Memes publicados</p>
            </div>
            <div>
              <p className="font-display text-lg font-bold text-[#1C1E21] dark:text-[#E4E6EB] tabular-nums">
                {totalReactions.toLocaleString('es-ES')}
              </p>
              <p className="text-xs text-[#65676B] dark:text-[#B0B3B8]">Reacciones recibidas</p>
            </div>
            <div>
              <p className="font-display text-lg font-bold text-[#1C1E21] dark:text-[#E4E6EB] tabular-nums">
                {totalDownloads.toLocaleString('es-ES')}
              </p>
              <p className="text-xs text-[#65676B] dark:text-[#B0B3B8]">Descargas totales</p>
            </div>
          </div>

          {editing && (
            <form
              onSubmit={handleSave}
              className="mt-5 pt-4 border-t border-[#E4E6EB] dark:border-[#3A3B3C] space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#65676B] dark:text-[#B0B3B8] mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                    className="w-full px-3 py-2 text-sm bg-[#F0F2F5] dark:bg-[#3A3B3C] text-[#1C1E21] dark:text-[#E4E6EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#65676B] dark:text-[#B0B3B8] mb-1">
                    Usuario (@handle)
                  </label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    maxLength={32}
                    className="w-full px-3 py-2 text-sm bg-[#F0F2F5] dark:bg-[#3A3B3C] text-[#1C1E21] dark:text-[#E4E6EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#65676B] dark:text-[#B0B3B8] mb-1">
                  Biografía
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={160}
                  className="w-full px-3 py-2 text-sm bg-[#F0F2F5] dark:bg-[#3A3B3C] text-[#1C1E21] dark:text-[#E4E6EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-[#65676B] dark:text-[#B0B3B8] mb-2">
                  Avatar
                </p>
                <div className="flex items-center gap-3">
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setAvatar(preset.url)}
                      className={`relative rounded-full p-0.5 border-2 transition-all ${
                        avatar === preset.url
                          ? 'border-[#7C3AED]'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg"
                >
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Guardar cambios</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* User's Memes Gallery */}
      <section className="bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-xl p-5">
        <h2 className="font-display text-base font-bold text-[#1C1E21] dark:text-[#E4E6EB] mb-4">
          Tus memes publicados
        </h2>

        {userMemes.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <p className="text-sm text-[#65676B] dark:text-[#B0B3B8]">
              Todavía no has publicado ningún meme con tu perfil.
            </p>
            <button
              type="button"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Subir mi primer meme</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {userMemes.map((meme) => (
              <button
                key={meme.id}
                type="button"
                onClick={() => onOpenLightbox(meme)}
                className="group relative aspect-square rounded-lg overflow-hidden bg-[#F0F2F5] dark:bg-[#18191A] text-left"
              >
                <img
                  src={meme.imageUrl}
                  alt={meme.imageAlt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="truncate font-semibold">{meme.caption || meme.category}</p>
                  <p className="text-[11px] text-white/80 tabular-nums">
                    {meme.downloadsCount} descargas
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
