import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import type { MemePost, ReactionType, MemeCategory } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseState {
  memes: MemePost[];
}

const VALID_REACTIONS: ReactionType[] = ['like', 'haha', 'love', 'wow', 'skull'];
const VALID_CATEGORIES: Exclude<MemeCategory, 'Todos'>[] = [
  'Programación',
  'Trabajo',
  'Animales',
  'Gaming',
  'Comida',
  'Vida diaria',
];

let activeDataDir = DATA_DIR;
let activeUploadsDir = UPLOADS_DIR;
let activeDbFile = DB_FILE;
let memoryDb: DatabaseState | null = null;

function ensureStorage(): boolean {
  try {
    if (!fs.existsSync(activeDataDir)) {
      fs.mkdirSync(activeDataDir, { recursive: true });
    }
    if (!fs.existsSync(activeUploadsDir)) {
      fs.mkdirSync(activeUploadsDir, { recursive: true });
    }
    return true;
  } catch {
    try {
      activeDataDir = path.join('/tmp', 'memeswue-data');
      activeUploadsDir = path.join(activeDataDir, 'uploads');
      activeDbFile = path.join(activeDataDir, 'db.json');
      if (!fs.existsSync(activeDataDir)) {
        fs.mkdirSync(activeDataDir, { recursive: true });
      }
      if (!fs.existsSync(activeUploadsDir)) {
        fs.mkdirSync(activeUploadsDir, { recursive: true });
      }
      return true;
    } catch {
      return false;
    }
  }
}

function getSeedMemes(): MemePost[] {
  const now = Date.now();
  return [
    {
      id: 'meme-coding-coffee',
      authorId: 'user-carlos',
      authorName: 'Carlos Mendoza',
      authorHandle: '@carlosdev',
      authorAvatar: '/src/assets/images/avatar_carlos_1795515777158.jpg',
      caption:
        'Yo a las 3:00 AM diciendo "solo arreglo este último bug y me duermo". Llevo tres tazas de café y el compilador me acaba de pedir disculpas.',
      category: 'Programación',
      imageUrl: '/src/assets/images/meme_coding_coffee_1795515775884.jpg',
      imageAlt: 'Gato naranja con lentes mirando una laptop de noche junto a una taza gigante de café',
      createdAt: new Date(now - 1000 * 60 * 35).toISOString(),
      reactions: { like: 124, haha: 289, love: 42, wow: 18, skull: 96 },
      userReactions: {},
      comments: [
        {
          id: 'c-101',
          authorId: 'user-sofia',
          authorName: 'Sofía Ríos',
          authorHandle: '@sofiarios',
          authorAvatar: '/src/assets/images/avatar_sofia_1795515777899.jpg',
          text: 'El clásico "es un cambio de dos líneas en producción" un viernes.',
          createdAt: new Date(now - 1000 * 60 * 24).toISOString(),
        },
        {
          id: 'c-102',
          authorId: 'user-mateo',
          authorName: 'Mateo Vargas',
          authorHandle: '@mateocrea',
          authorAvatar: '/src/assets/images/avatar_mateo_1795515777568.jpg',
          text: 'Esa taza tiene más RAM que mi computadora.',
          createdAt: new Date(now - 1000 * 60 * 12).toISOString(),
        },
      ],
      sharesCount: 47,
      downloadsCount: 163,
    },
    {
      id: 'meme-monday-dog',
      authorId: 'user-sofia',
      authorName: 'Sofía Ríos',
      authorHandle: '@sofiarios',
      authorAvatar: '/src/assets/images/avatar_sofia_1795515777899.jpg',
      caption:
        'Cuando entras a la primera junta del lunes a las 8:30 AM y alguien dice: "¿Qué tal su fin de semana? ¿Listos para arrancar con todo?"',
      category: 'Trabajo',
      imageUrl: '/src/assets/images/meme_monday_dog_1795515775925.jpg',
      imageAlt: 'Perro golden retriever con corbata descansando agotado sobre pilas de carpetas en la oficina',
      createdAt: new Date(now - 1000 * 60 * 115).toISOString(),
      reactions: { like: 98, haha: 215, love: 64, wow: 9, skull: 53 },
      userReactions: {},
      comments: [
        {
          id: 'c-103',
          authorId: 'user-carlos',
          authorName: 'Carlos Mendoza',
          authorHandle: '@carlosdev',
          authorAvatar: '/src/assets/images/avatar_carlos_1795515777158.jpg',
          text: 'Me representa totalmente cada lunes sin excepción.',
          createdAt: new Date(now - 1000 * 60 * 80).toISOString(),
        },
      ],
      sharesCount: 38,
      downloadsCount: 142,
    },
    {
      id: 'meme-midnight-pizza',
      authorId: 'user-mateo',
      authorName: 'Mateo Vargas',
      authorHandle: '@mateocrea',
      authorAvatar: '/src/assets/images/avatar_mateo_1795515777568.jpg',
      caption:
        'Yo: "Desde hoy ceno ligero, pura ensalada." \nTambién yo a las 2:03 AM frente al refrigerador:',
      category: 'Comida',
      imageUrl: '/src/assets/images/meme_midnight_pizza_1795515777234.jpg',
      imageAlt: 'Persona con sudadera mirando fascinada una rebanada de pizza fría en el refrigerador de madrugada',
      createdAt: new Date(now - 1000 * 60 * 240).toISOString(),
      reactions: { like: 85, haha: 174, love: 91, wow: 12, skull: 41 },
      userReactions: {},
      comments: [
        {
          id: 'c-104',
          authorId: 'user-sofia',
          authorName: 'Sofía Ríos',
          authorHandle: '@sofiarios',
          authorAvatar: '/src/assets/images/avatar_sofia_1795515777899.jpg',
          text: 'La pizza fría de madrugada sabe mejor que cualquier restaurante de cinco estrellas.',
          createdAt: new Date(now - 1000 * 60 * 190).toISOString(),
        },
      ],
      sharesCount: 29,
      downloadsCount: 98,
    },
    {
      id: 'meme-gym-cat',
      authorId: 'user-sofia',
      authorName: 'Sofía Ríos',
      authorHandle: '@sofiarios',
      authorAvatar: '/src/assets/images/avatar_sofia_1795515777899.jpg',
      caption:
        'Ya compré el tapete, ya saqué las pesas y ya me puse ropa deportiva. Por hoy ya fue demasiado esfuerzo físico, toca descansar.',
      category: 'Animales',
      imageUrl: '/src/assets/images/meme_gym_cat_1795515776848.jpg',
      imageAlt: 'Gato blanco y negro acostado boca arriba en un tapete de yoga junto a pesas pequeñas',
      createdAt: new Date(now - 1000 * 60 * 390).toISOString(),
      reactions: { like: 112, haha: 196, love: 134, wow: 6, skull: 28 },
      userReactions: {},
      comments: [],
      sharesCount: 34,
      downloadsCount: 119,
    },
    {
      id: 'meme-group-project',
      authorId: 'user-carlos',
      authorName: 'Carlos Mendoza',
      authorHandle: '@carlosdev',
      authorAvatar: '/src/assets/images/avatar_carlos_1795515777158.jpg',
      caption:
        'Todo el equipo conectándose en llamada a las 11:52 PM cuando la entrega cierra a las 11:59 PM y nadie ha hecho las diapositivas.',
      category: 'Vida diaria',
      imageUrl: '/src/assets/images/meme_group_project_1795515777160.jpg',
      imageAlt: 'Tres mapaches preocupados reunidos alrededor de una laptop bajo una lámpara de escritorio',
      createdAt: new Date(now - 1000 * 60 * 600).toISOString(),
      reactions: { like: 154, haha: 312, love: 49, wow: 27, skull: 88 },
      userReactions: {},
      comments: [
        {
          id: 'c-105',
          authorId: 'user-mateo',
          authorName: 'Mateo Vargas',
          authorHandle: '@mateocrea',
          authorAvatar: '/src/assets/images/avatar_mateo_1795515777568.jpg',
          text: 'El que solo pone su nombre en la portada y cambia el tipo de letra.',
          createdAt: new Date(now - 1000 * 60 * 500).toISOString(),
        },
      ],
      sharesCount: 62,
      downloadsCount: 205,
    },
  ];
}

function readDb(): DatabaseState {
  if (memoryDb) return memoryDb;
  const writable = ensureStorage();
  if (!writable) {
    memoryDb = { memes: getSeedMemes() };
    return memoryDb;
  }
  if (!fs.existsSync(activeDbFile)) {
    const initial: DatabaseState = { memes: getSeedMemes() };
    try {
      fs.writeFileSync(activeDbFile, JSON.stringify(initial, null, 2), 'utf-8');
    } catch {
      // fallback to memory
    }
    memoryDb = initial;
    return initial;
  }
  try {
    const raw = fs.readFileSync(activeDbFile, 'utf-8');
    const parsed = JSON.parse(raw) as DatabaseState;
    if (!Array.isArray(parsed.memes)) {
      throw new Error('Invalid DB structure');
    }
    memoryDb = parsed;
    return parsed;
  } catch {
    const fallback: DatabaseState = { memes: getSeedMemes() };
    try {
      fs.writeFileSync(activeDbFile, JSON.stringify(fallback, null, 2), 'utf-8');
    } catch {
      // ignore
    }
    memoryDb = fallback;
    return fallback;
  }
}

function writeDb(state: DatabaseState): void {
  memoryDb = state;
  if (!ensureStorage()) return;
  try {
    const tmpFile = `${activeDbFile}.${process.pid}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(state, null, 2), 'utf-8');
    fs.renameSync(tmpFile, activeDbFile);
  } catch {
    // keep in-memory state if disk write fails
  }
}

function resolveMemeImageFile(imageUrl: string): string | null {
  if (imageUrl.startsWith('/uploads/')) {
    const safeName = path.basename(imageUrl);
    const fullPath = path.join(activeUploadsDir, safeName);
    if (fs.existsSync(fullPath)) return fullPath;
  }
  if (imageUrl.startsWith('/src/assets/images/')) {
    const safeName = path.basename(imageUrl);
    const devPath = path.resolve(__dirname, 'src/assets/images', safeName);
    if (fs.existsSync(devPath)) return devPath;
    const prodPath = path.resolve(__dirname, 'dist/src/assets/images', safeName);
    if (fs.existsSync(prodPath)) return prodPath;
  }
  return null;
}

function saveBase64Image(dataUrl: string, id: string): string {
  const match = /^data:(image\/(png|jpeg|jpg|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) {
    throw new Error('Formato de imagen inválido. Usa PNG, JPG, WEBP o GIF.');
  }
  const mime = match[1];
  const extRaw = match[2];
  const ext = extRaw === 'jpeg' ? 'jpg' : extRaw;
  const base64Data = match[3];
  const buffer = Buffer.from(base64Data, 'base64');

  if (buffer.length > 6 * 1024 * 1024) {
    throw new Error('La imagen supera el límite máximo de 6 MB.');
  }

  ensureStorage();
  const filename = `${id}.${ext}`;
  const filePath = path.join(activeUploadsDir, filename);
  fs.writeFileSync(filePath, buffer);
  void mime;
  return `/uploads/${filename}`;
}

async function startServer(): Promise<void> {
  ensureStorage();
  readDb();

  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use('/uploads', express.static(activeUploadsDir, { maxAge: '7d' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/memes', (req, res) => {
    const db = readDb();
    let list = [...db.memes];
    const category = typeof req.query.category === 'string' ? req.query.category : '';
    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
    const authorId = typeof req.query.authorId === 'string' ? req.query.authorId.trim() : '';

    if (category && category !== 'Todos') {
      list = list.filter((m) => m.category === category);
    }
    if (authorId) {
      list = list.filter((m) => m.authorId === authorId);
    }
    if (q) {
      list = list.filter(
        (m) =>
          m.caption.toLowerCase().includes(q) ||
          m.authorName.toLowerCase().includes(q) ||
          m.authorHandle.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ memes: list });
  });

  app.post('/api/memes', (req, res) => {
    try {
      const body = req.body as {
        authorId?: string;
        authorName?: string;
        authorHandle?: string;
        authorAvatar?: string;
        caption?: string;
        category?: string;
        imageDataUrl?: string;
        imageUrl?: string;
        imageAlt?: string;
      };

      const authorId = (body.authorId || '').trim().slice(0, 80);
      const authorName = (body.authorName || '').trim().slice(0, 60);
      const authorHandle = (body.authorHandle || '').trim().slice(0, 40);
      const authorAvatar = (body.authorAvatar || '').trim().slice(0, 500);
      const caption = (body.caption || '').trim().slice(0, 600);
      const category = VALID_CATEGORIES.includes(body.category as Exclude<MemeCategory, 'Todos'>)
        ? (body.category as Exclude<MemeCategory, 'Todos'>)
        : 'Vida diaria';

      if (!authorId || !authorName) {
        res.status(400).json({ error: 'Datos del autor requeridos.' });
        return;
      }
      if (!caption && !body.imageDataUrl && !body.imageUrl) {
        res.status(400).json({ error: 'Agrega una imagen o texto para publicar el meme.' });
        return;
      }

      const id = `meme-${crypto.randomUUID().slice(0, 8)}`;
      let finalImageUrl = '';

      if (typeof body.imageDataUrl === 'string' && body.imageDataUrl.startsWith('data:image/')) {
        finalImageUrl = saveBase64Image(body.imageDataUrl, id);
      } else if (
        typeof body.imageUrl === 'string' &&
        (body.imageUrl.startsWith('/src/assets/images/') || body.imageUrl.startsWith('/uploads/'))
      ) {
        finalImageUrl = body.imageUrl;
      } else {
        res.status(400).json({ error: 'Imagen requerida en formato PNG, JPG, WEBP o GIF.' });
        return;
      }

      const newMeme: MemePost = {
        id,
        authorId,
        authorName,
        authorHandle: authorHandle || '@usuario',
        authorAvatar: authorAvatar || '/src/assets/images/avatar_carlos_1795515777158.jpg',
        caption,
        category,
        imageUrl: finalImageUrl,
        imageAlt: (body.imageAlt || caption || 'Meme subido por la comunidad').slice(0, 180),
        createdAt: new Date().toISOString(),
        reactions: { like: 0, haha: 0, love: 0, wow: 0, skull: 0 },
        userReactions: {},
        comments: [],
        sharesCount: 0,
        downloadsCount: 0,
      };

      const db = readDb();
      db.memes.unshift(newMeme);
      writeDb(db);

      res.status(201).json({ meme: newMeme });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo publicar el meme.';
      res.status(400).json({ error: message });
    }
  });

  app.delete('/api/memes/:id', (req, res) => {
    const { id } = req.params;
    const authorId = typeof req.body?.authorId === 'string' ? req.body.authorId : '';
    const db = readDb();
    const index = db.memes.findIndex((m) => m.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Meme no encontrado.' });
      return;
    }
    const target = db.memes[index];
    if (!authorId || target.authorId !== authorId) {
      res.status(403).json({ error: 'Solo el autor puede eliminar esta publicación.' });
      return;
    }

    if (target.imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(activeUploadsDir, path.basename(target.imageUrl));
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {
          // ignore cleanup failure
        }
      }
    }

    db.memes.splice(index, 1);
    writeDb(db);
    res.json({ deletedId: id });
  });

  app.post('/api/memes/:id/react', (req, res) => {
    const { id } = req.params;
    const userId = typeof req.body?.userId === 'string' ? req.body.userId.trim() : '';
    const reaction = req.body?.reaction as ReactionType;

    if (!userId || !VALID_REACTIONS.includes(reaction)) {
      res.status(400).json({ error: 'Reacción o usuario inválido.' });
      return;
    }

    const db = readDb();
    const meme = db.memes.find((m) => m.id === id);
    if (!meme) {
      res.status(404).json({ error: 'Meme no encontrado.' });
      return;
    }

    const previous = meme.userReactions[userId];
    if (previous === reaction) {
      delete meme.userReactions[userId];
      meme.reactions[reaction] = Math.max(0, (meme.reactions[reaction] || 0) - 1);
    } else {
      if (previous && VALID_REACTIONS.includes(previous)) {
        meme.reactions[previous] = Math.max(0, (meme.reactions[previous] || 0) - 1);
      }
      meme.userReactions[userId] = reaction;
      meme.reactions[reaction] = (meme.reactions[reaction] || 0) + 1;
    }

    writeDb(db);
    res.json({ meme });
  });

  app.post('/api/memes/:id/comments', (req, res) => {
    const { id } = req.params;
    const body = req.body as {
      authorId?: string;
      authorName?: string;
      authorHandle?: string;
      authorAvatar?: string;
      text?: string;
    };

    const text = (body.text || '').trim().slice(0, 400);
    const authorId = (body.authorId || '').trim().slice(0, 80);
    const authorName = (body.authorName || '').trim().slice(0, 60);

    if (!text || !authorId || !authorName) {
      res.status(400).json({ error: 'Escribe un comentario válido.' });
      return;
    }

    const db = readDb();
    const meme = db.memes.find((m) => m.id === id);
    if (!meme) {
      res.status(404).json({ error: 'Meme no encontrado.' });
      return;
    }

    const comment = {
      id: `c-${crypto.randomUUID().slice(0, 8)}`,
      authorId,
      authorName,
      authorHandle: (body.authorHandle || '@usuario').trim().slice(0, 40),
      authorAvatar: (body.authorAvatar || '/src/assets/images/avatar_carlos_1795515777158.jpg').trim(),
      text,
      createdAt: new Date().toISOString(),
    };

    meme.comments.push(comment);
    writeDb(db);
    res.status(201).json({ meme, comment });
  });

  app.post('/api/memes/:id/share', (req, res) => {
    const { id } = req.params;
    const body = req.body as {
      repost?: boolean;
      authorId?: string;
      authorName?: string;
      authorHandle?: string;
      authorAvatar?: string;
      commentary?: string;
    };

    const db = readDb();
    const original = db.memes.find((m) => m.id === id);
    if (!original) {
      res.status(404).json({ error: 'Meme no encontrado.' });
      return;
    }

    original.sharesCount += 1;

    let repostedMeme: MemePost | undefined;
    if (body.repost && body.authorId && body.authorName) {
      repostedMeme = {
        id: `meme-${crypto.randomUUID().slice(0, 8)}`,
        authorId: body.authorId.trim().slice(0, 80),
        authorName: body.authorName.trim().slice(0, 60),
        authorHandle: (body.authorHandle || '@usuario').trim().slice(0, 40),
        authorAvatar: (body.authorAvatar || '/src/assets/images/avatar_carlos_1795515777158.jpg').trim(),
        caption: (body.commentary || original.caption).trim().slice(0, 600),
        category: original.category,
        imageUrl: original.imageUrl,
        imageAlt: original.imageAlt,
        createdAt: new Date().toISOString(),
        reactions: { like: 0, haha: 0, love: 0, wow: 0, skull: 0 },
        userReactions: {},
        comments: [],
        sharesCount: 0,
        downloadsCount: 0,
        repostedFrom: {
          originalId: original.id,
          authorName: original.authorName,
          authorHandle: original.authorHandle,
        },
      };
      db.memes.unshift(repostedMeme);
    }

    writeDb(db);
    res.json({ meme: original, repostedMeme });
  });

  app.get('/api/memes/:id/download', (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const meme = db.memes.find((m) => m.id === id);
    if (!meme) {
      res.status(404).json({ error: 'Meme no encontrado.' });
      return;
    }

    const filePath = resolveMemeImageFile(meme.imageUrl);
    if (!filePath) {
      res.status(404).json({ error: 'Archivo de imagen no disponible.' });
      return;
    }

    meme.downloadsCount += 1;
    writeDb(db);

    const ext = path.extname(filePath) || '.jpg';
    const downloadName = `memeswue-${meme.id}${ext}`;
    res.download(filePath, downloadName);
  });

  app.post('/api/memes/:id/track-download', (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const meme = db.memes.find((m) => m.id === id);
    if (!meme) {
      res.status(404).json({ error: 'Meme no encontrado.' });
      return;
    }
    meme.downloadsCount += 1;
    writeDb(db);
    res.json({ meme });
  });

  const distDir = path.resolve(__dirname, 'dist');
  const distIndex = path.join(distDir, 'index.html');
  const useViteDev = process.env.USE_VITE_MIDDLEWARE === 'true' || !fs.existsSync(distIndex);

  if (useViteDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(distIndex);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MemesWue server running on http://localhost:${PORT}`);
  });
}

startServer();
