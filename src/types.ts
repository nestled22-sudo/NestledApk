export type ReactionType = 'like' | 'haha' | 'love' | 'wow' | 'skull';

export type MemeCategory =
  | 'Todos'
  | 'Programación'
  | 'Trabajo'
  | 'Animales'
  | 'Gaming'
  | 'Comida'
  | 'Vida diaria';

export type FeedTab = 'inicio' | 'tendencias' | 'guardados' | 'perfil';
export type SortMode = 'recent' | 'downloads' | 'reactions';

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
}

export interface MemeComment {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

export interface RepostInfo {
  originalId: string;
  authorName: string;
  authorHandle: string;
}

export interface MemePost {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  caption: string;
  category: Exclude<MemeCategory, 'Todos'>;
  imageUrl: string;
  imageAlt: string;
  createdAt: string;
  reactions: Record<ReactionType, number>;
  userReactions: Record<string, ReactionType>;
  comments: MemeComment[];
  sharesCount: number;
  downloadsCount: number;
  repostedFrom?: RepostInfo;
}
