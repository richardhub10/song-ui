import type { Song, SongApiResponse } from './types';

const fallbackSongs: Song[] = [
  {
    id: 'one',
    title: 'One',
    artist: 'U2',
    genre: 'Rock',
    year: '1992',
    description: 'The featured track in the teacher-style layout with a strong hero card and curated recommendations.',
    thumbnail: 'https://i.ytimg.com/vi/ftjEcrrf7r0/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=ftjEcrrf7r0',
    sourceUrl: 'https://www.youtube.com/watch?v=ftjEcrrf7r0',
  },
  {
    id: 'sometimes',
    title: 'Sometimes',
    artist: 'Britney Spears',
    genre: 'Pop',
    year: '1999',
    description: 'A bright recommendation card with a soft cover image and concise metadata.',
    thumbnail: 'https://i.ytimg.com/vi/FEzfML8c0pM/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=FEzfML8c0pM',
    sourceUrl: 'https://www.youtube.com/watch?v=FEzfML8c0pM',
  },
  {
    id: 'ligaya',
    title: 'Ligaya',
    artist: 'Eraserheads',
    genre: 'OPM',
    year: '1993',
    description: 'Built to keep the right rail visually dense, similar to the teacher reference.',
    thumbnail: 'https://i.ytimg.com/vi/Zg38zVF9pQk/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=Zg38zVF9pQk',
    sourceUrl: 'https://www.youtube.com/watch?v=Zg38zVF9pQk',
  },
  {
    id: 'halo',
    title: 'Halo',
    artist: 'Beyonce',
    genre: 'Pop',
    year: '2009',
    description: 'A fallback card for the search flow and recommendation list.',
    thumbnail: 'https://i.ytimg.com/vi/bnVUHWCynig/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=bnVUHWCynig',
    sourceUrl: 'https://www.youtube.com/watch?v=bnVUHWCynig',
  },
];

const defaultApiUrl = 'https://song-api-9fde.onrender.com/velasco/songs';

function extractSongs(payload: SongApiResponse | unknown): Song[] {
  if (Array.isArray(payload)) {
    return payload as Song[];
  }

  if (payload && typeof payload === 'object') {
    const candidate = payload as { results?: Song[]; data?: Song[]; songs?: Song[] };
    return candidate.results ?? candidate.data ?? candidate.songs ?? [];
  }

  return [];
}

function normalizeSong(song: Partial<Song> & Record<string, unknown>, index: number): Song {
  const id = String(song.id ?? song._id ?? song.slug ?? `${index}-${song.title ?? 'song'}`);
  const title = String(song.title ?? song.name ?? song.songTitle ?? 'Untitled Song');
  const artist = String(song.artist ?? song.singer ?? song.band ?? 'Unknown Artist');
  const genre = String(song.genre ?? song.category ?? song.style ?? 'Music');
  const year = song.year ? String(song.year) : song.releaseYear ? String(song.releaseYear) : undefined;
  const description = String(song.description ?? song.summary ?? song.lyrics ?? '');
  const thumbnail = String(song.thumbnail ?? song.image ?? song.cover ?? song.artwork ?? '');
  const videoUrl = String(song.videoUrl ?? song.video ?? song.youtubeUrl ?? song.url ?? '');
  const sourceUrl = String(song.sourceUrl ?? song.link ?? song.externalUrl ?? videoUrl ?? '');

  return {
    id,
    title,
    artist,
    genre,
    year,
    description: description || undefined,
    thumbnail: thumbnail || undefined,
    videoUrl: videoUrl || undefined,
    sourceUrl: sourceUrl || undefined,
  };
}

export async function loadSongs(): Promise<Song[]> {
  const apiUrl = import.meta.env.VITE_API_URL || defaultApiUrl;

  try {
    const response = await fetch(apiUrl, { headers: { Accept: 'application/json' } });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as SongApiResponse;
    const songs = extractSongs(payload).map((song, index) => normalizeSong(song, index));

    return songs.length > 0 ? songs : fallbackSongs;
  } catch {
    return fallbackSongs;
  }
}

export const appLinks = {
  apiRepo: 'https://github.com/richardhub10/song-api',
  uiRepo: 'https://github.com/richardhub10/song-ui',
  apiUrl: defaultApiUrl,
  uiUrl: 'https://song-ui.onrender.com/',
  apiExampleUrl: 'https://song-api-9fde.onrender.com/velasco/songs',
};
