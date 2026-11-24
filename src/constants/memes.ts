import type { MemeCategory, ReactionType, UserProfile } from '../types';

export interface ReactionMeta {
  type: ReactionType;
  label: string;
  emoji: string;
  colorClass: string;
}

export const REACTIONS: ReactionMeta[] = [
  { type: 'like', label: 'Me gusta', emoji: '👍', colorClass: 'text-[#7C3AED]' },
  { type: 'haha', label: 'Jaja', emoji: '😂', colorClass: 'text-amber-600 dark:text-amber-400' },
  { type: 'love', label: 'Me encanta', emoji: '❤️', colorClass: 'text-rose-600 dark:text-rose-400' },
  { type: 'wow', label: 'Wooow', emoji: '😮', colorClass: 'text-amber-600 dark:text-amber-400' },
  { type: 'skull', label: 'Me morí', emoji: '💀', colorClass: 'text-slate-700 dark:text-slate-300' },
];

export const REACTION_MAP: Record<ReactionType, ReactionMeta> = REACTIONS.reduce(
  (acc, item) => {
    acc[item.type] = item;
    return acc;
  },
  {} as Record<ReactionType, ReactionMeta>
);

export const CATEGORIES: MemeCategory[] = [
  'Todos',
  'Programación',
  'Trabajo',
  'Animales',
  'Gaming',
  'Comida',
  'Vida diaria',
];

export const UPLOAD_CATEGORIES: Exclude<MemeCategory, 'Todos'>[] = [
  'Programación',
  'Trabajo',
  'Animales',
  'Gaming',
  'Comida',
  'Vida diaria',
];

export interface MemeTemplate {
  id: string;
  title: string;
  category: Exclude<MemeCategory, 'Todos'>;
  imageUrl: string;
  defaultTop: string;
  defaultBottom: string;
}

export const MEME_TEMPLATES: MemeTemplate[] = [
  {
    id: 'tpl-coding-cat',
    title: 'Gato programador de madrugada',
    category: 'Programación',
    imageUrl: '/src/assets/images/meme_coding_coffee_1795515775884.jpg',
    defaultTop: 'CUANDO EL CÓDIGO COMPILA',
    defaultBottom: 'PERO NO SABES POR QUÉ',
  },
  {
    id: 'tpl-monday-dog',
    title: 'Perro en lunes de oficina',
    category: 'Trabajo',
    imageUrl: '/src/assets/images/meme_monday_dog_1795515775925.jpg',
    defaultTop: 'SON LAS 9 DE LA MAÑANA',
    defaultBottom: 'Y YA QUIERO QUE SEA VIERNES',
  },
  {
    id: 'tpl-midnight-pizza',
    title: 'Pizza a las 2 de la mañana',
    category: 'Comida',
    imageUrl: '/src/assets/images/meme_midnight_pizza_1795515777234.jpg',
    defaultTop: 'YO PROMETIENDO COMER SANO',
    defaultBottom: 'YO A LAS 2:00 AM',
  },
  {
    id: 'tpl-gym-cat',
    title: 'Gato en modo fitness',
    category: 'Animales',
    imageUrl: '/src/assets/images/meme_gym_cat_1795515776848.jpg',
    defaultTop: 'DÍA 1 DE EJERCICIO',
    defaultBottom: 'YA ME CANSÉ DE VER LAS PESAS',
  },
  {
    id: 'tpl-group-raccoons',
    title: 'Equipo entregando a última hora',
    category: 'Vida diaria',
    imageUrl: '/src/assets/images/meme_group_project_1795515777160.jpg',
    defaultTop: 'FALTAN 5 MINUTOS',
    defaultBottom: 'ALGUIEN GUARDE EL ARCHIVO',
  },
];

export const AVATAR_PRESETS = [
  {
    label: 'Carlos',
    url: '/src/assets/images/avatar_carlos_1795515777158.jpg',
  },
  {
    label: 'Sofía',
    url: '/src/assets/images/avatar_sofia_1795515777899.jpg',
  },
  {
    label: 'Mateo',
    url: '/src/assets/images/avatar_mateo_1795515777568.jpg',
  },
];

export const DEFAULT_USER: UserProfile = {
  id: 'user-tu',
  name: 'Alex Rivera',
  handle: '@alexmemes',
  avatar: '/src/assets/images/avatar_mateo_1795515777568.jpg',
  bio: 'Coleccionista oficial de memes de programación, gatos dramáticos y lunes eternos.',
};

export function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 1) return 'Justo ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Hace ${days} d`;
  return new Date(isoString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

export function getTotalReactions(reactions: Record<ReactionType, number>): number {
  return (
    (reactions.like || 0) +
    (reactions.haha || 0) +
    (reactions.love || 0) +
    (reactions.wow || 0) +
    (reactions.skull || 0)
  );
}
